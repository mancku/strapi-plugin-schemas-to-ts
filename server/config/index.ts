import { PluginConfig } from "../models/pluginConfig";
import { pluginName } from "../register";

const config: PluginConfig = {
  acceptedNodeEnvs: ["development"],
  commonInterfacesFolderName: pluginName,
  verboseLogs: false,
  alwaysAddEnumSuffix: false,
};

export default {
  default: config,
  validator(config: PluginConfig) {
  }
};