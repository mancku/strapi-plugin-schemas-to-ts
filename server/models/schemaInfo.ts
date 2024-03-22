import { SchemaSource } from "./schemaSource";

export interface SchemaInfo {
  schemaPath: string;
  destinationFolder: string;
  schema: any;
  schemaName: string;
  pascalName: string;
  componentFullName: string;
  source: SchemaSource;
  interfaceAsText: string;
  plainInterfaceAsText: string;
  noRelationsInterfaceAsText: string;
  adminPanelLifeCycleRelationsInterfaceAsText: string;
  dependencies: string[];
  enums: string[];
}

const defaultSchemaInfo: SchemaInfo = {
  schemaPath: '',
  destinationFolder: '',
  schema: undefined,
  schemaName: '',
  pascalName: '',
  componentFullName: '',
  source: SchemaSource.Common,
  interfaceAsText: '',
  plainInterfaceAsText: '',
  noRelationsInterfaceAsText: '',
  adminPanelLifeCycleRelationsInterfaceAsText: '',
  dependencies: [],
  enums: [],
};

export default defaultSchemaInfo;