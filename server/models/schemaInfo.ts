import { SchemaSource } from "./schemaSource";

export interface SchemaInfo {
  path: string;
  destinationFolder: string;
  schema: any;
  pascalName: string;
  source: SchemaSource;
  interfaceAsText: string;
  plainInterfaceAsText: string;
  noRelationsInterfaceAsText: string;
  adminPanelLifeCycleRelationsInterfaceAsText: string;
  imports: string[];
}

const defaultSchemaInfo: SchemaInfo = {
  destinationFolder: '',
  interfaceAsText: '',
  pascalName: '',
  source: SchemaSource.Common,
  path: '',
  plainInterfaceAsText: '',
  noRelationsInterfaceAsText: '',
  adminPanelLifeCycleRelationsInterfaceAsText: '',
  schema: undefined,
  imports: [],
};

export default defaultSchemaInfo;