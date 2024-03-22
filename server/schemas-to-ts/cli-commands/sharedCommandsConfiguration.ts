import { LogLevel } from "../../models/logLevel";
import { defaultPluginConfig } from "../../models/pluginConfig";

type YargsChoicesConfiguration = {
  alias: string;
  describe: string;
  type: "string";
  choices: string[];
  default: string;
};

export class SharedCommandsConfiguration {
  public static strapiRootPathConfiguration(): { describe: string; type: "string"; demandOption: true; } {
    return {
      describe: 'Path to the Strapi project root',
      type: 'string',
      demandOption: true,
    };
  }

  public static logLevelConfiguration(): YargsChoicesConfiguration {
    return {
      alias: 'l',
      describe: 'Set the log level',
      type: 'string',
      choices: [
        LogLevel[LogLevel.None],
        LogLevel[LogLevel.Verbose],
        LogLevel[LogLevel.Debug],
        LogLevel[LogLevel.Information],
        LogLevel[LogLevel.Error]
      ],
      default: LogLevel[defaultPluginConfig.logLevel],
    };
  }
}