import { LogLevel } from '../models/logLevel';
import { PluginConfig } from "../models/pluginConfig";
import { pluginName } from '../models/pluginName';

const config: PluginConfig = {
  acceptedNodeEnvs: ["development"],
  commonInterfacesFolderName: pluginName,
  alwaysAddEnumSuffix: false,
  alwaysAddComponentSuffix: false,
  usePrettierIfAvailable: true,
  logLevel: LogLevel.Debug
};

export default {
  default: config,
  validator(config: PluginConfig) {
  }
};