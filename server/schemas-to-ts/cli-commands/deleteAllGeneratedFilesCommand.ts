import yargs from "yargs";
import { LogLevel } from "../../models/logLevel";
import { StrapiPaths } from "../../models/strapiPaths";
import { FileHelpers } from "../fileHelpers";
import { Logger } from "../logger";
import { SharedCommandsConfiguration } from "./sharedCommandsConfiguration";

type DeleteAllGeneratedFilesArguments = {
  "strapi-root-path": string;
} & {
  logLevel: string;
};
type DeleteAllGeneratedFilesConfiguration = yargs.Argv<DeleteAllGeneratedFilesArguments>;

export class DeleteAllGeneratedFilesCommand {
  public static configureCommand(yargs: yargs.Argv<{}>): void | DeleteAllGeneratedFilesConfiguration | PromiseLike<DeleteAllGeneratedFilesConfiguration> {
    return yargs
      .option('strapi-root-path', SharedCommandsConfiguration.strapiRootPathConfiguration())
      .option('logLevel', SharedCommandsConfiguration.logLevelConfiguration());
  }

  public static executeCommand(argv: yargs.ArgumentsCamelCase<DeleteAllGeneratedFilesArguments>): void {
    if (argv.strapiRootPath) {
      console.log(`Executing script at path: ${argv.strapiRootPath}`);
      const strapiPaths: StrapiPaths = new StrapiPaths(argv.strapiRootPath).buildFromRootPath();
      const logger: Logger = new Logger(LogLevel[argv.logLevel]);
      FileHelpers.deleteUnnecessaryGeneratedInterfaces(strapiPaths, logger);
    } else {
      console.error('strapi-root-path parameter was missing');
    }
  }
}