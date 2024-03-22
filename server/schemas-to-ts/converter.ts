import fs from 'fs';
import { pascalCase } from "pascal-case";
import path from 'path';
import { PluginConfig } from '../models/pluginConfig';
import { pluginName } from '../models/pluginName';
import { SchemaInfo } from "../models/schemaInfo";
import { SchemaSource } from '../models/schemaSource';
import { StrapiPaths } from '../models/strapiPaths';
import { CommonHelpers } from './commonHelpers';
import { FileHelpers } from './fileHelpers';
import { InterfaceBuilder } from './interface-builders/interfaceBuilder';
import { InterfaceBuilderFactory } from './interface-builders/interfaceBuilderFactory';

export class Converter {
  private readonly componentInterfacesFolderName: string = 'interfaces';
  private commonFolderModelsPath: string = '';
  private readonly commonHelpers: CommonHelpers;
  private readonly interfaceBuilder: InterfaceBuilder;
  private readonly config: PluginConfig;
  private readonly checkedComponentFolders: Set<string> = new Set();


  constructor(config: PluginConfig, strapiVersion: string, private readonly strapiPaths: StrapiPaths) {
    this.config = config;
    this.commonHelpers = new CommonHelpers(config, strapiPaths.root);
    this.interfaceBuilder = InterfaceBuilderFactory.getInterfaceBuilder(strapiVersion, this.commonHelpers, config);
    this.commonHelpers.logger.verbose(`${pluginName} configuration`, this.config);
  }

  public SchemasToTs(): void {
    const currentNodeEnv: string = process.env.NODE_ENV ?? '';
    const acceptedNodeEnvs = this.config.acceptedNodeEnvs ?? [];
    if (!acceptedNodeEnvs.includes(currentNodeEnv)) {
      this.commonHelpers.logger
        .information(`${pluginName} plugin's acceptedNodeEnvs property does not include '${currentNodeEnv}' environment. Skipping conversion of schemas to Typescript.`);
      return;
    }

    this.setCommonInterfacesFolder();

    const commonSchemas: SchemaInfo[] = this.interfaceBuilder.generateCommonSchemas(this.commonFolderModelsPath);
    const apiSchemas: SchemaInfo[] = this.getSchemas(this.strapiPaths.api, SchemaSource.Api);
    const componentSchemas: SchemaInfo[] = this.getSchemas(this.strapiPaths.components, SchemaSource.Component, apiSchemas);
    this.adjustComponentsWhoseNamesWouldCollide(componentSchemas, apiSchemas);

    const schemas: SchemaInfo[] = [...apiSchemas, ...componentSchemas, ...commonSchemas];
    for (const schema of schemas.filter(x => x.source !== SchemaSource.Common)) {
      this.interfaceBuilder.convertSchemaToInterfaces(schema, schemas);
    }

    const generatedInterfacesPaths: string[] = [];
    for (const schema of schemas) {
      const filePath = this.writeInterfacesFile(schema);
      generatedInterfacesPaths.push(filePath);
    }

    FileHelpers.deleteUnnecessaryGeneratedInterfaces(this.strapiPaths, this.commonHelpers.logger, generatedInterfacesPaths);
  }

  /**
  * Adjusts the names of component schemas to avoid name collisions. If a component schema name conflicts with
  * any name in the API schemas or among other component schemas, it is modified to ensure uniqueness. This
  * modification involves appending 'Component' to the name if required by the configuration or if there's a name
  * collision. Additionally, if a name collision is detected within the component schemas themselves, further
  * adjustments are made to ensure all names are unique.
  * 
  * @private
  * @param {SchemaInfo[]} componentSchemas - An array of schemas representing the components, where each schema
  *                                          has a 'pascalName' and 'componentFullName' property.
  * @param {SchemaInfo[]} apiSchemas - An array of schemas representing the API, where each schema has a
  *                                    'pascalName' property. These names are checked against the component
  *                                    schema names to identify potential collisions.
  */
  private adjustComponentsWhoseNamesWouldCollide(componentSchemas: SchemaInfo[], apiSchemas: SchemaInfo[]) {
    type ComponentNamingStatus = {
      hasDuplicate: boolean;
      needsComponentSuffix: boolean;
    };

    const encounteredNames: Record<string, ComponentNamingStatus> = {};

    for (const schema of componentSchemas) {
      const needsComponentSuffix: boolean = this.config.alwaysAddComponentSuffix
        || apiSchemas?.some(x => x.pascalName === schema.pascalName);
      if (needsComponentSuffix) {
        schema.pascalName += 'Component';
      }

      if (encounteredNames[schema.pascalName] === undefined) {
        encounteredNames[schema.pascalName] = { hasDuplicate: false, needsComponentSuffix: needsComponentSuffix };;
      } else {
        encounteredNames[schema.pascalName].hasDuplicate = true;
        encounteredNames[schema.pascalName].needsComponentSuffix = encounteredNames[schema.pascalName].needsComponentSuffix
          || needsComponentSuffix;
      }
    }

    const duplicates = Object.entries(encounteredNames)
      .filter(([_, namingStatus]) => namingStatus.hasDuplicate)
      .map(([pascalName, _]) => pascalName);

    for (const schema of componentSchemas) {
      if (duplicates.includes(schema.pascalName)) {
        const originalPascalName: string = schema.pascalName;
        const componentFullName: string = schema.componentFullName.replaceAll('.', '-');
        schema.pascalName = pascalCase(componentFullName);
        if (encounteredNames[originalPascalName].needsComponentSuffix) {
          schema.pascalName += "Component";
        }
      }
    }
  }


  private setCommonInterfacesFolder() {
    this.commonFolderModelsPath = FileHelpers.ensureFolderPathExistRecursive(this.strapiPaths.src, 'common', this.config.commonInterfacesFolderName);
  }

  private getSchemas(folderPath: string, schemaSource: SchemaSource, apiSchemas?: SchemaInfo[]): SchemaInfo[] {
    const files: string[] = [];

    if (FileHelpers.folderExists(folderPath)) {
      const readFolder = (folderPath: string) => {
        const items = fs.readdirSync(folderPath);
        for (const item of items) {
          const itemPath = path.join(folderPath, item);
          const stat = fs.statSync(itemPath);
          if (stat.isDirectory()) {
            readFolder(itemPath);
          } else {
            files.push(itemPath);
          }
        }
      };

      readFolder(folderPath);
    }

    return files
      .filter((file: string) => (schemaSource === SchemaSource.Api ? file.endsWith('schema.json') : file.endsWith('.json')))
      .map((file: string) => this.parseSchema(file, schemaSource, apiSchemas));
  }

  private parseSchema(file: string, schemaSource: SchemaSource, apiSchemas?: SchemaInfo[]): SchemaInfo {
    let schema: any = undefined;
    try {
      schema = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      this.commonHelpers.logger.error(`Error while parsing the schema for ${file}:`, e);
    }

    let folder = '';
    let schemaName = '';
    let componentNameInApiSchema = '';

    switch (schemaSource) {
      case SchemaSource.Api:
        schemaName = schema.info.singularName;
        folder = path.dirname(file);
        break;
      case SchemaSource.Common:
        schemaName = schema.info.displayName;
        folder = this.commonFolderModelsPath;
        break;
      case SchemaSource.Component:
        let fileNameWithoutExtension = path.basename(file, path.extname(file));
        schemaName = fileNameWithoutExtension;
        folder = path.dirname(file);
        const componentFolder: string = path.basename(folder);
        const componentFolderFullPath: string = path.join(folder, this.componentInterfacesFolderName);
        if (!this.checkedComponentFolders.has(componentFolderFullPath)) {
          FileHelpers.ensureFolderPathExistRecursive(folder, this.componentInterfacesFolderName);
          this.checkedComponentFolders.add(componentFolderFullPath);
        }
        folder = componentFolderFullPath;
        componentNameInApiSchema = `${componentFolder}.${schemaName}`;
        break;
    }

    let pascalName: string = pascalCase(schemaName);
    return {
      schemaPath: file,
      destinationFolder: folder,
      schema: schema,
      schemaName: schemaName,
      pascalName: pascalName,
      componentFullName: componentNameInApiSchema,
      source: schemaSource,
      interfaceAsText: '',
      plainInterfaceAsText: '',
      noRelationsInterfaceAsText: '',
      adminPanelLifeCycleRelationsInterfaceAsText: '',
      dependencies: [],
      enums: [],
    };
  }

  private writeInterfacesFile(schema: SchemaInfo): string {
    const interfacesFileContent = this.interfaceBuilder.buildInterfacesFileContent(schema);
    const fileName: string = this.commonHelpers.getFileNameFromSchema(schema, true);
    let folderPath: string = '';
    switch (schema.source) {
      case SchemaSource.Common:
        folderPath = this.commonFolderModelsPath;
        break;
      case SchemaSource.Component:
        folderPath = schema.destinationFolder;
        break;
      case SchemaSource.Api:
      default:
        folderPath = schema.destinationFolder;
        break;
    }

    return FileHelpers.writeInterfaceFile(folderPath, fileName, interfacesFileContent, this.commonHelpers.logger);
  }
}
