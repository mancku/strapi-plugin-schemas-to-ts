import { SchemaSource } from "./schemaSource";

export interface SchemaInfo {
  schemaPath: string;
  destinationFolder: string;
  schema: any;
  pascalName: string;
  source: SchemaSource;
  interfaceAsText: string;
  plainInterfaceAsText: string;
  noRelationsInterfaceAsText: string;
  adminPanelLifeCycleRelationsInterfaceAsText: string;
  dependencies: string[];
}

const defaultSchemaInfo: SchemaInfo = {
  destinationFolder: '',
  interfaceAsText: '',
  pascalName: '',
  source: SchemaSource.Common,
  schemaPath: '',
  plainInterfaceAsText: '',
  noRelationsInterfaceAsText: '',
  adminPanelLifeCycleRelationsInterfaceAsText: '',
  schema: undefined,
  dependencies: [],
};

export default defaultSchemaInfo;