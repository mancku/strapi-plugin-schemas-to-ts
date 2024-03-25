import { LogLevel } from './logLevel';
import { pluginName } from './pluginName';

export interface PluginConfig {
  acceptedNodeEnvs: string[];
  commonInterfacesFolderName: string;
  alwaysAddEnumSuffix: boolean;
  alwaysAddComponentSuffix: boolean;
  usePrettierIfAvailable: boolean;
  logLevel: LogLevel,
  destinationFolder?: string;
}

export const defaultPluginConfig: PluginConfig = {
  acceptedNodeEnvs: ["development"],
  commonInterfacesFolderName: pluginName,
  alwaysAddEnumSuffix: false,
  alwaysAddComponentSuffix: false,
  usePrettierIfAvailable: true,
  logLevel: LogLevel.Debug,
  destinationFolder: undefined,
};