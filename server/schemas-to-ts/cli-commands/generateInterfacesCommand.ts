import _ from "lodash";
import path from 'path';
import yargs from "yargs";
import { LogLevel } from "../../models/logLevel";
import { PluginConfig, defaultPluginConfig } from "../../models/pluginConfig";
import { StrapiPaths } from "../../models/strapiPaths";
import { Converter } from "../converter";

export class GenerateInterfacesCommand {
  public static configureCommand(yargs: yargs.Argv<{}>): void | yargs.Argv<{ "strapi-root-path": string; } & { acceptedNodeEnvs: string[] | (string | number)[]; } & { commonInterfacesFolderName: string; } & { alwaysAddEnumSuffix: boolean; } & { alwaysAddComponentSuffix: boolean; } & { usePrettierIfAvailable: boolean; } & { logLevel: string; }> | PromiseLike<yargs.Argv<{ "strapi-root-path": string; } & { acceptedNodeEnvs: string[] | (string | number)[]; } & { commonInterfacesFolderName: string; } & { alwaysAddEnumSuffix: boolean; } & { alwaysAddComponentSuffix: boolean; } & { usePrettierIfAvailable: boolean; } & { logLevel: string; }>> {
    return yargs
      .option('strapi-root-path', {
        describe: 'Path to the Strapi project root',
        type: 'string',
        demandOption: true,
      })
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
      .option('logLevel', {
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
      });
  }

  public static executeCommand(argv: yargs.ArgumentsCamelCase<{ "strapi-root-path": string; } & { acceptedNodeEnvs: string[] | (string | number)[]; } & { commonInterfacesFolderName: string; } & { alwaysAddEnumSuffix: boolean; } & { alwaysAddComponentSuffix: boolean; } & { usePrettierIfAvailable: boolean; } & { logLevel: string; }>): void {
    if (argv.strapiRootPath) {
      if (!Array.isArray(argv.acceptedNodeEnvs)) {
        argv.acceptedNodeEnvs = new Array<string>();
      }

      argv.acceptedNodeEnvs = argv.acceptedNodeEnvs
        .flatMap(item => item.split(','));

      // If the execution doesn't have an environment, the empty one must be accepted
      argv.acceptedNodeEnvs.push('');

      // Only different values will be accepted
      argv.acceptedNodeEnvs = _.uniq(argv.acceptedNodeEnvs);

      const config: PluginConfig = {
        acceptedNodeEnvs: argv.acceptedNodeEnvs as string[],
        alwaysAddComponentSuffix: argv.alwaysAddComponentSuffix,
        alwaysAddEnumSuffix: argv.alwaysAddEnumSuffix,
        commonInterfacesFolderName: argv.commonInterfacesFolderName,
        usePrettierIfAvailable: argv.usePrettierIfAvailable,
        logLevel: LogLevel[argv.logLevel],
      };

      const strapiPaths: StrapiPaths = StrapiPaths.fromRootPath(argv.strapiRootPath);
      const packageJson = require(path.join(strapiPaths.root, './package.json'));
      const libraryVersion = packageJson.dependencies['@strapi/strapi'];
      const converter = new Converter(config, libraryVersion, strapiPaths);
      converter.SchemasToTs();
    } else {
      console.error('strapi-root-path parameter was missing');
    }
  }

}