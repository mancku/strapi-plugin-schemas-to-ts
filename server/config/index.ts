import { PluginConfig } from "../models/pluginConfig";

const config: PluginConfig = {
  acceptedNodeEnvs: ["development"],
  commonInterfacesFolderName: "common",
  componentInterfacesFolderName: "interfaces",
};

export default {
  default: config,
  validator(acceptedNodeEnvs: string[]) {
    console.log('acceptedNodeEnvs', acceptedNodeEnvs);
  }
};