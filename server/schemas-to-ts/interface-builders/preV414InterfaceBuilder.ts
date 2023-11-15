import { PluginConfig } from "../../models/pluginConfig";
import { SchemaInfo } from "../../models/schemaInfo";
import { CommonHelpers } from "../commonHelpers";
import { InterfaceBuilder } from "./interfaceBuilder";

export class PreV414InterfaceBuilder extends InterfaceBuilder {
  constructor(commonHelpers: CommonHelpers, config: PluginConfig) {
    super(commonHelpers, config);
  }

  public addVersionSpecificCommonSchemas(commonSchemas: SchemaInfo[], commonFolderModelsPath: string): SchemaInfo[] {
    this.addCommonSchema(commonSchemas, commonFolderModelsPath, 'BeforeRunEvent',
      `import { Event } from '@strapi/database/lib/lifecycles/index';
  
    export interface BeforeRunEvent<TState> extends Event {
      state: TState;
    }`);

    this.addCommonSchema(commonSchemas, commonFolderModelsPath, 'AfterRunEvent',
      `import { BeforeRunEvent } from './BeforeRunEvent';
  
    export interface AfterRunEvent<TState, TResult> extends BeforeRunEvent<TState> {
      result: TResult;
    }
    `);

    return commonSchemas;
  }
}