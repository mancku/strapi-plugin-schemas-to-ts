import prettier from 'prettier';
import { PluginConfig } from "../models/pluginConfig";
import { SchemaInfo } from '../models/schemaInfo';
import { SchemaSource } from '../models/schemaSource';

export class CommonHelpers {
  private verboseLogs: boolean;

  constructor(config: PluginConfig) {
    this.verboseLogs = config.verboseLogs;
  }

  public printVerboseLog(message: any, ...optionalParams: any[]): void {
    if (!!this.verboseLogs) {
      console.log(message, optionalParams);
    }
  }

  public getPrettierOptions(): prettier.Options | undefined {
    const prettierConfigFile = prettier.resolveConfigFile.sync(strapi.dirs.app.root);
    if (prettierConfigFile !== null) {
      return prettier.resolveConfig.sync(prettierConfigFile, { editorconfig: true }) as prettier.Options;
    }
  }

  public getFileNameFromSchema(schemaInfo: SchemaInfo, withExtension: boolean): string {
    let fileName: string = schemaInfo.source === SchemaSource.Api
      ? schemaInfo.schema.info.singularName
      : schemaInfo.pascalName;

    if (!!withExtension) {
      fileName += '.ts';
    }

    return fileName;
  }

  public static isWindows(): boolean {
    return process.platform === 'win32';
  }

  public static capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}