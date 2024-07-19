import { StrapiDirectories } from '@strapi/strapi';
import fs from 'fs';
import { pascalCase } from "pascal-case";
import path from 'path';
import { DestinationPaths } from '../models/destinationPaths';
import { PluginConfig } from '../models/pluginConfig';
import { pluginName } from '../models/pluginName';
import { SchemaInfo } from "../models/schemaInfo";
import { SchemaSource } from '../models/schemaSource';
import { CommonHelpers } from './commonHelpers';
import { FileHelpers } from './fileHelpers';
import { InterfaceBuilder } from './interface-builders/interfaceBuilder';
import { InterfaceBuilderFactory } from './interface-builders/interfaceBuilderFactory';

export class Converter {
  private readonly commonHelpers: CommonHelpers;
  private readonly interfaceBuilder: InterfaceBuilder;
  private readonly config: PluginConfig;
  private readonly destinationPaths: DestinationPaths;

  constructor(config: PluginConfig, strapiVersion: string, private readonly strapiDirectories: StrapiDirectories) {
    this.config = config;
    this.commonHelpers = new CommonHelpers(config, strapiDirectories.app.root);
    this.interfaceBuilder = InterfaceBuilderFactory.getInterfaceBuilder(strapiVersion, this.commonHelpers, config);
    this.commonHelpers.logger.verbose(`${pluginName} configuration`, this.config);
    this.destinationPaths = new DestinationPaths(config, strapiDirectories);
  }

  public SchemasToTs(): void {
    const currentNodeEnv: string = process.env.NODE_ENV ?? '';
    const acceptedNodeEnvs = this.config.acceptedNodeEnvs ?? [];
    if (!acceptedNodeEnvs.includes(currentNodeEnv)) {
      this.commonHelpers.logger
        .information(`${pluginName} plugin's acceptedNodeEnvs property does not include '${currentNodeEnv}' environment. Skipping conversion of schemas to Typescript.`);
      return;
    }

    const commonSchemas: SchemaInfo[] = this.interfaceBuilder.generateCommonSchemas(this.destinationPaths.commons, this.strapiDirectories.app.extensions);
    const apiSchemas: SchemaInfo[] = this.getSchemas(this.strapiDirectories.app.api, SchemaSource.Api);
    const componentSchemas: SchemaInfo[] = this.getSchemas(this.strapiDirectories.app.components, SchemaSource.Component, apiSchemas);
    const extensionSchemas: SchemaInfo[] = this.getSchemas(this.strapiDirectories.app.extensions, SchemaSource.Extension);
    this.adjustComponentsWhoseNamesWouldCollide(componentSchemas);

    const schemas: SchemaInfo[] = [...apiSchemas, ...componentSchemas, ...commonSchemas, ...extensionSchemas];
    for (const schema of schemas.filter(x => x.source !== SchemaSource.Common)) {
      this.interfaceBuilder.convertSchemaToInterfaces(schema, schemas);
    }

    const generatedInterfacesPaths: string[] = [];
    for (const schema of schemas) {
      const filePath = this.writeInterfacesFile(schema);
      generatedInterfacesPaths.push(filePath);
    }

    FileHelpers.deleteUnnecessaryGeneratedInterfaces(this.strapiDirectories, this.commonHelpers.logger, generatedInterfacesPaths);
  }

  /**
  * A component could need the suffix and the by having it, it would end up with the same name as another one that didn't need it
    but whose name had the word 'Component' at the end
  */
  private adjustComponentsWhoseNamesWouldCollide(componentSchemas: SchemaInfo[]) {
    for (const componentSchema of componentSchemas.filter(x => x.needsComponentSuffix)) {
      const component: SchemaInfo = componentSchemas.find(x => x.pascalName === componentSchema.pascalName && !x.needsComponentSuffix);
      if (component) {
        component.needsComponentSuffix = true;
        component.pascalName += 'Component';
      }
    }
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
      .filter((file: string) => ((schemaSource === SchemaSource.Api || schemaSource === SchemaSource.Extension) ? file.endsWith('schema.json') : file.endsWith('.json')))
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

    switch (schemaSource) {
      case SchemaSource.Api:
        schemaName = schema?.info.singularName;
        folder = this.destinationPaths.useForApisAndComponents ? this.destinationPaths.apis : path.dirname(file);
        break;
      case SchemaSource.Common:
        schemaName = schema?.info.displayName;
        folder = this.destinationPaths.commons;
        break;
      case SchemaSource.Extension:
        if (schema?.info.displayName === 'User') {
          folder = this.destinationPaths.commons;
        } else {
          folder = this.destinationPaths.useForApisAndComponents
          ? FileHelpers.ensureFolderPathExistRecursive(this.config.destinationFolder, this.destinationPaths.extensionsFolderName)
          : path.dirname(file);
        }
        schemaName = schema?.info.displayName;
        break;
      case SchemaSource.Component:
        let fileNameWithoutExtension = path.basename(file, path.extname(file));
        schemaName = fileNameWithoutExtension;
        folder = path.dirname(file);
        const componentFolder: string = path.basename(folder);
        folder = this.destinationPaths.useForApisAndComponents
          ? FileHelpers.ensureFolderPathExistRecursive(this.destinationPaths.components, componentFolder)
          : FileHelpers.ensureFolderPathExistRecursive(folder, this.destinationPaths.componentInterfacesFolderName);
        break;
    }

    let pascalName: string = pascalCase(schemaName);
    let needsComponentSuffix: boolean = schemaSource === SchemaSource.Component &&
      (this.config.alwaysAddComponentSuffix || apiSchemas?.some(x => x.pascalName === pascalName));
    if (needsComponentSuffix) {
      pascalName += 'Component';
    }

    return {
      schemaPath: file,
      destinationFolder: folder,
      schema: schema,
      schemaName: schemaName,
      pascalName: pascalName,
      needsComponentSuffix: needsComponentSuffix,
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
    return FileHelpers.writeInterfaceFile(schema.destinationFolder, fileName, interfacesFileContent, this.commonHelpers.logger);
  }
}
