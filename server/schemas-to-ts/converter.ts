import fs from 'fs';
import { pascalCase } from "pascal-case";
import path from 'path';
import { PluginConfig } from '../models/pluginConfig';
import { SchemaInfo } from "../models/schemaInfo";
import { SchemaSource } from '../models/schemaSource';
import { pluginName } from '../register';
import { CommonHelpers } from './commonHelpers';
import { FileHelpers } from './fileHelpers';
import { InterfaceBuilder } from './interfaceBuilder';

export class Converter {
  private readonly componentInterfacesFolderName: string = 'interfaces';
  private commonFolderModelsPath: string = '';
  private readonly commonHelpers: CommonHelpers;
  private readonly interfaceBuilder: InterfaceBuilder;
  private readonly config: PluginConfig;

  constructor(config: PluginConfig) {
    this.config = config;
    this.commonHelpers = new CommonHelpers(config);
    this.interfaceBuilder = new InterfaceBuilder(this.commonHelpers);
    this.commonHelpers.printVerboseLog(`${pluginName} configuration`, this.config);
  }

  public SchemasToTs(): void {
    const currentNodeEnv: string = process.env.NODE_ENV ?? '';
    const acceptedNodeEnvs = this.config.acceptedNodeEnvs ?? [];
    if (!acceptedNodeEnvs.includes(currentNodeEnv)) {
      console.log(`${pluginName} plugin's acceptedNodeEnvs property does not include '${currentNodeEnv}' environment. Skipping conversion of schemas to Typescript.`);
      return;
    }

    this.setCommonInterfacesFolder();

    const commonSchemas: SchemaInfo[] = this.interfaceBuilder.generateCommonSchemas(this.commonFolderModelsPath);
    const apiSchemas: SchemaInfo[] = this.getSchemas(strapi.dirs.app.api, SchemaSource.Api);
    const componentSchemas: SchemaInfo[] = this.getSchemas(strapi.dirs.app.components, SchemaSource.Component);
    const schemas: SchemaInfo[] = [...apiSchemas, ...componentSchemas, ...commonSchemas];
    for (const schema of schemas.filter(x => x.source !== SchemaSource.Common)) {
      this.interfaceBuilder.convertSchemaToInterfaces(schema, schemas);
    }

    for (const schema of schemas) {
      this.writeInterfacesFile(schema);
    }
  }

  private setCommonInterfacesFolder() {
    this.commonFolderModelsPath = FileHelpers.ensureFolderPathExistRecursive('common', this.config.commonInterfacesFolderName);
  }

  private getSchemas(folderPath: string, schemaType: SchemaSource): SchemaInfo[] {
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
      .filter((file: string) => (schemaType === SchemaSource.Api ? file.endsWith('schema.json') : file.endsWith('.json')))
      .map((file: string) => this.parseSchema(file, schemaType));
  }

  private parseSchema(file: string, schemaType: SchemaSource): SchemaInfo {
    let schema: any = undefined;
    try {
      schema = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      console.error(`Error while parsing the schema for ${file}:`, e);
    }

    let folder = '';
    let interfaceName = '';

    switch (schemaType) {
      case SchemaSource.Api:
        interfaceName = schema.info.singularName;
        folder = path.dirname(file);
        break;
      case SchemaSource.Common:
        interfaceName = schema.info.displayName;
        folder = this.commonFolderModelsPath;
        break;
      case SchemaSource.Component:
        let fileNameWithoutExtension = path.basename(file, path.extname(file));
        interfaceName = pascalCase(fileNameWithoutExtension);
        folder = path.join(path.dirname(file), this.componentInterfacesFolderName);
        if (!FileHelpers.folderExists(folder)) {
          fs.mkdirSync(folder);
        }
        break;
    }

    return {
      schemaPath: file,
      destinationFolder: folder,
      schema: schema,
      pascalName: pascalCase(interfaceName),
      source: schemaType,
      interfaceAsText: '',
      plainInterfaceAsText: '',
      noRelationsInterfaceAsText: '',
      adminPanelLifeCycleRelationsInterfaceAsText: '',
      dependencies: [],
    };
  }

  private writeInterfacesFile(schema: SchemaInfo) {
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

    FileHelpers.writeInterfaceFile(folderPath, fileName, interfacesFileContent);
  }
}
