import { StrapiDirectories } from "@strapi/strapi";
import yargs from "yargs";
import { LogLevel } from "../../models/logLevel";
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
      const strapiDirectories: StrapiDirectories = FileHelpers.buildStrapiDirectoriesFromRootPath(argv.strapiRootPath);
      const logger: Logger = new Logger(LogLevel[argv.logLevel]);
      FileHelpers.deleteUnnecessaryGeneratedInterfaces(strapiDirectories, logger);
    } else {
      console.error('strapi-root-path parameter was missing');
    }
  }
}