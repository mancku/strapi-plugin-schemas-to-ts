import { PluginConfig } from "../../models/pluginConfig";
import { SchemaInfo } from "../../models/schemaInfo";
import { CommonHelpers } from "../commonHelpers";
import { InterfaceBuilder } from "./interfaceBuilder";

export class PostV414InterfaceBuilder extends InterfaceBuilder {
  constructor(commonHelpers: CommonHelpers, config: PluginConfig) {
    super(commonHelpers, config);
  }

  public addVersionSpecificCommonSchemas(commonSchemas: SchemaInfo[], commonFolderModelsPath: string): SchemaInfo[] {
   this.addCommonSchema(commonSchemas, commonFolderModelsPath, 'BeforeRunEvent',
      `import { Event } from '@strapi/database/dist/lifecycles';
  
    export interface BeforeRunEvent<TState extends Record<string, unknown>> extends Event {
      state: TState;
    }`);

    this.addCommonSchema(commonSchemas, commonFolderModelsPath, 'AfterRunEvent',
      `import { BeforeRunEvent } from './BeforeRunEvent';
  
    export interface AfterRunEvent<TState, TResult> extends BeforeRunEvent<TState extends Record<string, unknown> ? TState : never> {
      result: TResult;
    }
    `);

    return commonSchemas;
  }
}