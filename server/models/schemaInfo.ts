import { SchemaSource } from "./schemaSource";

export interface SchemaInfo {
  schemaPath: string;
  destinationFolder: string;
  schema: any;
  schemaName: string;
  pascalName: string;
  source: SchemaSource;
  interfaceAsText: string;
  plainInterfaceAsText: string;
  noRelationsInterfaceAsText: string;
  adminPanelLifeCycleRelationsInterfaceAsText: string;
  dependencies: string[];
  enums: string[];
}

const defaultSchemaInfo: SchemaInfo = {
  destinationFolder: '',
  interfaceAsText: '',
  schemaName: '',
  pascalName: '',
  source: SchemaSource.Common,
  schemaPath: '',
  plainInterfaceAsText: '',
  noRelationsInterfaceAsText: '',
  adminPanelLifeCycleRelationsInterfaceAsText: '',
  schema: undefined,
  dependencies: [],
  enums: [],
};

export default defaultSchemaInfo;