import _ from "lodash";
import path from 'path';
import yargs from "yargs";
import { LogLevel } from "../../models/logLevel";
import { PluginConfig, defaultPluginConfig } from "../../models/pluginConfig";
import { StrapiPaths } from "../../models/strapiPaths";
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
      .option('logLevel', SharedCommandsConfiguration.logLevelConfiguration());
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
      };

      const strapiPaths: StrapiPaths = StrapiPaths.fromRootPath(argv.strapiRootPath);
      const libraryVersion = GenerateInterfacesCommand.getStrapiVersion(strapiPaths);
      const converter = new Converter(config, libraryVersion, strapiPaths);
      converter.SchemasToTs();
    } else {
      console.error('strapi-root-path parameter was missing');
    }
  }

  private static getStrapiVersion(strapiPaths: StrapiPaths) {
    const packageJson = require(path.join(strapiPaths.root, './package.json'));
    const libraryVersion = packageJson.dependencies['@strapi/strapi'];
    return libraryVersion;
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