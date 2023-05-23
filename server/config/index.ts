import { PluginConfig } from "../models/pluginConfig";

const config: PluginConfig = {
  acceptedNodeEnvs: ["development"],
  commonInterfacesFolderName: "common",
  componentInterfacesFolderName: "interfaces",
  verboseLogs: false,
};

export default {
  default: config,
  validator(config: PluginConfig) {
  }
};