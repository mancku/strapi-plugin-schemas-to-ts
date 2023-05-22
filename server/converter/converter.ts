import fs from 'fs';
import { pascalCase } from "pascal-case";
import path from 'path';
import prettier from 'prettier';
import { PluginConfig } from '../models/pluginConfig';
import defaultSchemaInfo, { SchemaInfo } from "../models/schemaInfo";
import { SchemaSource } from '../models/schemaSource';
import { SchemaType } from '../models/schemaType';
import { pluginName } from '../register';

export class Converter {
  private static commonFolderModelsPath: string = '';
  private static componentInterfacesFolderName: string = '';

  public static SchemasToTs(config: PluginConfig): void {
    const currentNodeEnv: string = process.env.NODE_ENV ?? '';
    const acceptedNodeEnvs = config.acceptedNodeEnvs ?? [];
    if (!acceptedNodeEnvs.includes(currentNodeEnv)) {
      console.log(`${pluginName} plugin's acceptedNodeEnvs property does not include '${currentNodeEnv}' environment. Skipping conversion of schemas to Typescript.`);
      return;
    }

    this.componentInterfacesFolderName = config.componentInterfacesFolderName;

    let usePrettier = false;
    let prettierOptions: prettier.Options = {};
    const prettierConfigFile = prettier.resolveConfigFile.sync(strapi.dirs.app.root);
    if (prettierConfigFile !== null) {
      prettierOptions = prettier.resolveConfig.sync(prettierConfigFile, { editorconfig: true }) as prettier.Options;
      usePrettier = true;
    }

    this.setCommonInterfacesFolder(config);

    const commonSchemas: SchemaInfo[] = this.generateCommonSchemas();
    const apiSchemas: SchemaInfo[] = this.getSchemas(strapi.dirs.app.api, SchemaSource.Api);
    const componentSchemas: SchemaInfo[] = this.getSchemas(strapi.dirs.app.components, SchemaSource.Component);
    const schemas: SchemaInfo[] = [...apiSchemas, ...componentSchemas, ...commonSchemas];
    for (const schema of schemas.filter(x => x.source !== SchemaSource.Common)) {
      this.convertSchemaToInterfaces(schema, schemas);
    }

    for (const schema of schemas) {
      this.writeInterfacesFile(schema, usePrettier, prettierOptions);
    }
  }

  private static writeInterfacesFile(schema: SchemaInfo, usePrettier: boolean, prettierOptions: prettier.Options) {
    const interfacesFileContent = this.buildInterfacesFileContent(schema, usePrettier, prettierOptions);
    const fileName: string = this.getFileName(schema, true);
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

    let writeFile = true;
    const destinationPath: string = path.join(folderPath, fileName);
    if (this.fileExists(destinationPath)) {
      const fileContent: string = fs.readFileSync(destinationPath, 'utf8');
      if (fileContent === interfacesFileContent) {
        console.log(`File ${destinationPath} is up to date.`);
        writeFile = false;
      }
    }
    if (writeFile) {
      console.log(`Writing file ${destinationPath}`);
      fs.writeFileSync(destinationPath, interfacesFileContent, 'utf8');
    }
  }

  private static buildInterfacesFileContent(schema: SchemaInfo, usePrettier: boolean, prettierOptions: prettier.Options) {
    let interfacesFileContent = '';
    if (schema.imports?.length > 0) {
      interfacesFileContent += schema.imports.join('\n');
      interfacesFileContent += '\n\n';
    }
    let interfacesText = schema.interfaceAsText;
    interfacesText += `\n${schema.plainInterfaceAsText}`;
    interfacesText += `\n${schema.noRelationsInterfaceAsText}`;
    interfacesText += `\n${schema.adminPanelLifeCycleRelationsInterfaceAsText}`;
    interfacesText = interfacesText.replace('\n\n', '\n');
    interfacesFileContent += interfacesText;

    if (!!usePrettier) {
      interfacesFileContent = prettier.format(interfacesFileContent, prettierOptions);
    }
    return interfacesFileContent;
  }

  private static convertSchemaToInterfaces(schema: SchemaInfo, schemas: SchemaInfo[]) {
    console.log('Converting schema', schema.path);
    this.convertToInterface(schema, schemas, SchemaType.Standard);
    this.convertToInterface(schema, schemas, SchemaType.Plain);
    this.convertToInterface(schema, schemas, SchemaType.NoRelations);
    if (schema.source === SchemaSource.Api) {
      this.convertToInterface(schema, schemas, SchemaType.AdminPanelLifeCycle);
    }
    schema.imports = [...new Set(schema.imports)];
  }

  private static setCommonInterfacesFolder(config: PluginConfig) {
    this.commonFolderModelsPath = this.ensureFolderPathExistRecursive(config.commonInterfacesFolderName, pluginName);
  }

  private static ensureFolderPathExistRecursive(...subfolders: string[]): string {
    let folder = strapi.dirs.app.src;
    for (const subfolder of subfolders) {
      folder = path.join(folder, subfolder);
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
      }
    }

    return folder;
  }

  private static folderExists(folderPath: string): boolean {
    try {
      return fs.statSync(folderPath).isDirectory();
    } catch (err) {
      return false;
    }
  }

  private static fileExists(filePath: string): boolean {
    try {
      return fs.statSync(filePath).isFile();
    } catch {
      return false;
    }
  }

  private static getFileName(schemaInfo: SchemaInfo, withExtension: boolean): string {
    let fileName: string = schemaInfo.source === SchemaSource.Api
      ? schemaInfo.schema.info.singularName
      : schemaInfo.pascalName;

    if (!!withExtension) {
      fileName += '.ts';
    }

    return fileName;
  }

  private static getRelativePath(fromPath: string, toPath: string): string {
    let stat = fs.statSync(fromPath);
    if (stat.isDirectory()) {
      // path.relative works better with file paths, so we add an unexisting file to the route
      fromPath += '/.dumbFile.txt';
    }

    stat = fs.statSync(toPath);
    if (stat.isDirectory()) {
      toPath += '/.dumbFile.txt';
    }

    const relativePath = path.relative(path.dirname(fromPath), path.dirname(toPath));
    return relativePath === '' ? './' : relativePath;
  }

  private static getSchemas(folderPath: string, schemaType: SchemaSource): SchemaInfo[] {
    const files: string[] = [];

    if (this.folderExists(folderPath)) {
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

  private static parseSchema(file: string, schemaType: SchemaSource): SchemaInfo {
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
        interfaceName = schema.info.displayName;
        folder = path.join(path.dirname(file), this.componentInterfacesFolderName);
        if (!this.folderExists(folder)) {
          fs.mkdirSync(folder);
        }
        break;
    }

    return {
      path: file,
      destinationFolder: folder,
      schema: schema,
      pascalName: pascalCase(interfaceName),
      source: schemaType,
      interfaceAsText: '',
      plainInterfaceAsText: '',
      noRelationsInterfaceAsText: '',
      adminPanelLifeCycleRelationsInterfaceAsText: '',
      imports: [],
    };
  }

  private static isOptional(attributeValue): boolean {
    // arrays are never null
    if (attributeValue.relation === 'oneToMany' || attributeValue.repeatable) {
      return false;
    }
    return attributeValue.required !== true;
  }

  private static convertToInterface(schemaInfo: SchemaInfo, allSchemas: SchemaInfo[], schemaType: SchemaType) {
    if (!schemaInfo.schema) {
      console.log(`Skipping ${schemaInfo.path}: schema is empty.`);
      return null;
    }

    const tsImports: any[] = [];

    let interfaceName: string = schemaInfo.pascalName;
    if (schemaType === SchemaType.Plain) {
      interfaceName += '_Plain';
    } else if (schemaType === SchemaType.NoRelations) {
      interfaceName += '_NoRelations';
    } else if (schemaType === SchemaType.AdminPanelLifeCycle) {
      interfaceName += '_AdminPanelLifeCycle';
    }

    let tsInterface = `export interface ${interfaceName} {\n`;
    if (schemaInfo.source === SchemaSource.Api) {
      tsInterface += `  id: number;\n`;
    }

    let indentation = '  ';
    if (schemaInfo.source === SchemaSource.Api && schemaType === SchemaType.Standard) {
      tsInterface += `  attributes: {\n`;
      indentation += '  ';
    }

    const attributes = Object.entries(schemaInfo.schema.attributes);
    for (const attribute of attributes) {
      let attributeName = attribute[0];
      const attributeValue: any = attribute[1];
      if (this.isOptional(attributeValue)) attributeName += '?';
      let tsPropertyType;
      let tsProperty;
      // -------------------------------------------------
      // Relation
      // -------------------------------------------------
      if (attributeValue.type === 'relation') {
        tsPropertyType = attributeValue.target.includes('::user')
          ? 'User'
          : `${pascalCase(attributeValue.target.split('.')[1])}`;

        if (schemaType === SchemaType.Plain || schemaType === SchemaType.AdminPanelLifeCycle) {
          tsPropertyType += '_Plain';
        }

        tsImports.push({
          type: tsPropertyType,
        });
        const isArray = attributeValue.relation.endsWith('ToMany');
        const bracketsIfArray = isArray ? '[]' : '';

        //TODO review if this should be that way
        if (schemaType === SchemaType.Standard) {
          tsProperty = `${indentation}${attributeName}: { data: ${tsPropertyType}${bracketsIfArray} };\n`;
        } else if (schemaType === SchemaType.Plain) {
          tsProperty = `${indentation}${attributeName}: ${tsPropertyType}${bracketsIfArray};\n`;
        } else if (schemaType === SchemaType.NoRelations) {
          tsProperty = `${indentation}${attributeName}: number${bracketsIfArray};\n`;
        } else if (schemaType === SchemaType.AdminPanelLifeCycle) {
          tsProperty = `${indentation}${attributeName}: AdminPanelRelationPropertyModification<${tsPropertyType}>${bracketsIfArray};\n`;
          tsImports.push({
            type: 'AdminPanelRelationPropertyModification',
          });
        }
      }
      // -------------------------------------------------
      // Component
      // -------------------------------------------------
      else if (attributeValue.type === 'component') {
        tsPropertyType =
          attributeValue.target === 'plugin::users-permissions.user'
            ? 'User'
            : pascalCase(attributeValue.component.split('.')[1]);

        if (schemaType === SchemaType.Plain || schemaType === SchemaType.AdminPanelLifeCycle) {
          tsPropertyType += '_Plain';
        }
        if (schemaType === SchemaType.NoRelations) {
          tsPropertyType += '_NoRelations';
        }
        tsImports.push({
          type: tsPropertyType,
        });
        const isArray = attributeValue.repeatable;
        const bracketsIfArray = isArray ? '[]' : '';
        tsProperty = `${indentation}${attributeName}: ${tsPropertyType}${bracketsIfArray};\n`;
      }
      // -------------------------------------------------
      // Dynamic zone
      // -------------------------------------------------
      else if (attributeValue.type === 'dynamiczone') {
        // TODO
        tsPropertyType = 'any';
        tsProperty = `${indentation}${attributeName}: ${tsPropertyType};\n`;
      }
      // -------------------------------------------------
      // Media
      // -------------------------------------------------
      else if (attributeValue.type === 'media') {
        tsPropertyType = 'Media';
        tsImports.push({
          type: tsPropertyType,
        });

        const bracketsIfArray = attributeValue.multiple ? '[]' : '';
        if (schemaType === SchemaType.Standard) {
          tsProperty = `${indentation}${attributeName}: { data: ${tsPropertyType}${bracketsIfArray} };\n`;
        } else if (schemaType === SchemaType.Plain) {
          tsProperty = `${indentation}${attributeName}: ${tsPropertyType}${bracketsIfArray};\n`;
        } else if (schemaType === SchemaType.NoRelations) {
          tsProperty = `${indentation}${attributeName}: number${bracketsIfArray};\n`;
        } else if (schemaType === SchemaType.AdminPanelLifeCycle) {
          tsProperty = `${indentation}${attributeName}: AdminPanelRelationPropertyModification<${tsPropertyType}>${bracketsIfArray};\n`;

          tsImports.push({
            type: 'AdminPanelRelationPropertyModification',
          });
        }
      }
      // -------------------------------------------------
      // Enumeration
      // -------------------------------------------------
      else if (attributeValue.type === 'enumeration') {
        const enumOptions = attributeValue.enum.map(v => `'${v}'`).join(' | ');
        tsProperty = `${indentation}${attributeName}: ${enumOptions};\n`;
      }
      // -------------------------------------------------
      // Text, RichText, Email, UID
      // -------------------------------------------------
      else if (
        attributeValue.type === 'string' ||
        attributeValue.type === 'text' ||
        attributeValue.type === 'richtext' ||
        attributeValue.type === 'email' ||
        attributeValue.type === 'password' ||
        attributeValue.type === 'uid'
      ) {
        tsPropertyType = 'string';
        tsProperty = `${indentation}${attributeName}: ${tsPropertyType};\n`;
      }
      // -------------------------------------------------
      // Json
      // -------------------------------------------------
      else if (attributeValue.type === 'json') {
        tsPropertyType = 'any';
        tsProperty = `${indentation}${attributeName}: ${tsPropertyType};\n`;
      }
      // -------------------------------------------------
      // Password
      // -------------------------------------------------
      else if (attributeValue.type === 'password') {
        tsProperty = '';
      }
      // -------------------------------------------------
      // Number
      // -------------------------------------------------
      else if (
        attributeValue.type === 'integer' ||
        attributeValue.type === 'biginteger' ||
        attributeValue.type === 'decimal' ||
        attributeValue.type === 'float'
      ) {
        tsPropertyType = 'number';
        tsProperty = `${indentation}${attributeName}: ${tsPropertyType};\n`;
      }
      // -------------------------------------------------
      // Date
      // -------------------------------------------------
      else if (attributeValue.type === 'date' || attributeValue.type === 'datetime' || attributeValue.type === 'time') {
        tsPropertyType = 'Date';
        tsProperty = `${indentation}${attributeName}: ${tsPropertyType};\n`;
      }
      // -------------------------------------------------
      // Boolean
      // -------------------------------------------------
      else if (attributeValue.type === 'boolean') {
        tsPropertyType = 'boolean';
        tsProperty = `${indentation}${attributeName}: ${tsPropertyType};\n`;
      }
      // -------------------------------------------------
      // Others
      // -------------------------------------------------
      else {
        tsPropertyType = 'any';
        tsProperty = `${indentation}${attributeName}: ${tsPropertyType};\n`;
      }
      tsInterface += tsProperty;
    }
    // -------------------------------------------------
    // Localization
    // -------------------------------------------------
    if (schemaInfo.schema.pluginOptions?.i18n?.localized) {
      tsInterface += `${indentation}locale: string;\n`;
      if (schemaType === SchemaType.Standard) {
        tsInterface += `${indentation}localizations?: { data: ${schemaInfo.pascalName}[] };\n`;
      } else {
        tsInterface += `${indentation}localizations?: ${schemaInfo.pascalName}[];\n`;
      }
    }
    if (schemaInfo.source === SchemaSource.Api && schemaType === SchemaType.Standard) {
      tsInterface += `  };\n`;
    }

    tsInterface += '}\n';

    for (const tsImport of tsImports) {
      const importSchemaInfo = allSchemas.find((x: SchemaInfo) => {
        return x.pascalName === tsImport.type.replace('_Plain', '').replace('_NoRelations', '');
      });

      let importPath = schemaInfo.destinationFolder;
      if (importSchemaInfo) {
        importPath = this.getRelativePath(importPath, importSchemaInfo.destinationFolder);
        const fileName: string = this.getFileName(importSchemaInfo, false);
        importPath = this.getImportPath(importPath, fileName);
      }
      schemaInfo.imports.push(`import { ${tsImport.type} } from '${importPath}';`);
    }

    if (schemaType === SchemaType.Standard) {
      schemaInfo.interfaceAsText = tsInterface;
    } else if (schemaType === SchemaType.Plain) {
      schemaInfo.plainInterfaceAsText = tsInterface;
    } else if (schemaType === SchemaType.NoRelations) {
      schemaInfo.noRelationsInterfaceAsText = tsInterface;
    } else if (schemaType === SchemaType.AdminPanelLifeCycle) {
      schemaInfo.adminPanelLifeCycleRelationsInterfaceAsText = tsInterface;
    }
  }

  private static getImportPath(importPath: string, fileName: string): string {
    let result = '';
    if (importPath === './') {
      result = `./${fileName}`;
    } else {
      result = path.join(importPath, fileName);
    }

    if (this.isWindows()) {
      result = result.replace('/', '\\');
    }

    return result;
  }

  private static isWindows() {
    return process.platform === 'win32';
  }

  private static generateCommonSchemas(): SchemaInfo[] {
    const result: SchemaInfo[] = [];
    this.addCommonSchema(result, 'Payload', `export interface Payload<T> {
      data: T;
      meta: {
        pagination?: {
          page: number;
          pageSize: number;
          pageCount: number;
          total: number;
        }
      };
    }
    `);

    this.addCommonSchema(result, 'User', `export interface User {
      id: number;
      attributes: {
        username: string;
        email: string;
        provider: string;
        confirmed: boolean;
        blocked: boolean;
        createdAt: Date;
        updatedAt: Date;
      }
    }
    `, `export interface User_Plain {
      id: number;
      username: string;
      email: string;
      provider: string;
      confirmed: boolean;
      blocked: boolean;
      createdAt: Date;
      updatedAt: Date;
    }
    `);

    this.addCommonSchema(result, 'MediaFormat', `export interface MediaFormat {
      name: string;
      hash: string;
      ext: string;
      mime: string;
      width: number;
      height: number;
      size: number;
      path: string;
      url: string;
    }
    `);

    this.addCommonSchema(result, 'Media', `import { MediaFormat } from './MediaFormat';
    export interface Media {
      id: number;
      attributes: {
        name: string;
        alternativeText: string;
        caption: string;
        width: number;
        height: number;
        formats: { thumbnail: MediaFormat; medium: MediaFormat; small: MediaFormat; };
        hash: string;
        ext: string;
        mime: string;
        size: number;
        url: string;
        previewUrl: string;
        provider: string;
        createdAt: Date;
        updatedAt: Date;
      }
    }
    `);

    this.addCommonSchema(result, 'AdminPanelRelationPropertyModification', `export interface AdminPanelRelationPropertyModification<T> {
      connect: T[];
      disconnect: T[];
    }
    `);

    this.addCommonSchema(result, 'BeforeRunEvent', `import { Event } from '@strapi/database/lib/lifecycles/index';
  
    export interface BeforeRunEvent<TState> extends Event {
      state: TState;
    }`);

    this.addCommonSchema(result, 'AfterRunEvent', `import { BeforeRunEvent } from './BeforeRunEvent';
  
    export interface AfterRunEvent<TState, TResult> extends BeforeRunEvent<TState> {
      result: TResult;
    }
    `);

    return result;
  }

  private static addCommonSchema(schemas: SchemaInfo[], pascalName: string, interfaceAsText: string, plainInterfaceAsText?: string): void {
    const schemaInfo: SchemaInfo = Object.assign({}, defaultSchemaInfo);
    schemaInfo.destinationFolder = this.commonFolderModelsPath;
    schemaInfo.pascalName = pascalName;
    schemaInfo.interfaceAsText = interfaceAsText;
    if (plainInterfaceAsText) {
      schemaInfo.plainInterfaceAsText = plainInterfaceAsText;
    }
    schemas.push(schemaInfo);
  }

}