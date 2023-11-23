import { LogLevel } from './logLevel';

export interface PluginConfig {
  acceptedNodeEnvs: string[];
  commonInterfacesFolderName: string;
  alwaysAddEnumSuffix: boolean;
  alwaysAddComponentSuffix: boolean;
  usePrettierIfAvailable: boolean;
  logLevel: LogLevel
}