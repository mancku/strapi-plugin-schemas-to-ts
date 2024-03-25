import _ from "lodash";
import yargs from "yargs";
import { LogLevel } from "../../models/logLevel";
import { PluginConfig, defaultPluginConfig } from "../../models/pluginConfig";
import { Converter } from "../converter";
import { SharedCommandsConfiguration } from "./sharedCommandsConfiguration";

type GenerateInterfaceArguments = {
  "strapi-root-path": string;
} & {
  acceptedNodeEnvs: string[] | (string | number)[];
} & {
  commonInterfacesFolderName: string;
} & {
  alwaysAddEnumSuffix: boolean;
} & {
  alwaysAddComponentSuffix: boolean;
} & {
  usePrettierIfAvailable: boolean;
} & {
  logLevel: string;
} & {
  destinationFolder: string;
};

type GenerateInterfaceConfiguration = yargs.Argv<GenerateInterfaceArguments>;

export class GenerateInterfacesCommand {
  public static configureCommand(yargs: yargs.Argv<{}>): void | GenerateInterfaceConfiguration | PromiseLike<GenerateInterfaceConfiguration> {
    return yargs
      .option('strapi-root-path', SharedCommandsConfiguration.strapiRootPathConfiguration())
      .option('acceptedNodeEnvs', {
        alias: 'ne',
        describe: 'Accepted Node environments',
        type: 'array',
        default: defaultPluginConfig.acceptedNodeEnvs,
      })
      .option('commonInterfacesFolderName', {
        alias: 'ci',
        describe: 'Name of the common interfaces folder',
        type: 'string',
        default: defaultPluginConfig.commonInterfacesFolderName,
      })
      .option('alwaysAddEnumSuffix', {
        alias: 'es',
        describe: 'Always add enum suffix',
        type: 'boolean',
        default: defaultPluginConfig.alwaysAddEnumSuffix,
      })
      .option('alwaysAddComponentSuffix', {
        alias: 'cs',
        describe: 'Always add component suffix',
        type: 'boolean',
        default: defaultPluginConfig.alwaysAddComponentSuffix,
      })
      .option('usePrettierIfAvailable', {
        alias: 'p',
        describe: 'Use prettier if available',
        type: 'boolean',
        default: defaultPluginConfig.usePrettierIfAvailable,
      })
      .option('logLevel', SharedCommandsConfiguration.logLevelConfiguration())
      .option('destinationFolder', {
        alias: 'if',
        describe: 'Relative path (to the Strapi root one) of the folder where the interfaces need to be created. Empty for default.',
        type: 'string',
        default: defaultPluginConfig.destinationFolder,
      });
  }

  public static executeCommand(argv: yargs.ArgumentsCamelCase<GenerateInterfaceArguments>): void {
    console.log(argv);
    if (argv.strapiRootPath) {
      const acceptedNodeEnvs: string[] = GenerateInterfacesCommand.curateAcceptedNodeEnvs(argv);
      const config: PluginConfig = {
        acceptedNodeEnvs: acceptedNodeEnvs,
        alwaysAddComponentSuffix: argv.alwaysAddComponentSuffix,
        alwaysAddEnumSuffix: argv.alwaysAddEnumSuffix,
        commonInterfacesFolderName: argv.commonInterfacesFolderName,
        usePrettierIfAvailable: argv.usePrettierIfAvailable,
        logLevel: LogLevel[argv.logLevel],
        destinationFolder: argv.destinationFolder,
      };

      const strapi = require("@strapi/strapi");
      const app = strapi({ distDir: "./dist" });
      const converter = new Converter(config, app.config.info.strapi, app.dirs);
      converter.SchemasToTs();
    } else {
      console.error('strapi-root-path parameter was missing');
    }
  }

  private static curateAcceptedNodeEnvs(argv: yargs.ArgumentsCamelCase<GenerateInterfaceArguments>): string[] {
    if (!Array.isArray(argv.acceptedNodeEnvs)) {
      argv.acceptedNodeEnvs = new Array<string>();
    }

    argv.acceptedNodeEnvs = argv.acceptedNodeEnvs
      .flatMap((item: string) => item.split(','));

    // If the execution doesn't have an environment, the empty one must be accepted
    argv.acceptedNodeEnvs.push('');

    // Only different values will be accepted
    argv.acceptedNodeEnvs = _.uniq(argv.acceptedNodeEnvs);

    return argv.acceptedNodeEnvs as string[];
  }
}