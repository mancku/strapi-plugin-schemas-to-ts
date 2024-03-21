import yargs from "yargs";
import { LogLevel } from "../../models/logLevel";
import { StrapiPaths } from "../../models/strapiPaths";
import { FileHelpers } from "../fileHelpers";
import { Logger } from "../logger";

export class DeleteAllGeneratedFilesCommand {
  public static configureCommand(yargs: yargs.Argv<{}>): void | yargs.Argv<{ "strapi-root-path": string; }> | PromiseLike<yargs.Argv<{ "strapi-root-path": string; }>> {
    return yargs.positional('strapi-root-path', {
      describe: 'Path to the Strapi project root',
      type: 'string',
      demandOption: true,
    });
  }

  public static executeCommand(argv: yargs.ArgumentsCamelCase<{ "strapi-root-path": string; }>): void {
    if (argv.strapiRootPath) {
      console.log(`Executing script at path: ${argv.strapiRootPath}`);
      const strapiPaths: StrapiPaths = StrapiPaths.fromRootPath(argv.strapiRootPath);
      FileHelpers.deleteUnnecessaryGeneratedInterfaces(strapiPaths, new Logger(LogLevel.Verbose));
    } else {
      console.error('strapi-root-path parameter was missing');
    }
  }
}