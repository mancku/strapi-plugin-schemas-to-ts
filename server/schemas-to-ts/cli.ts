#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { LogLevel } from '../models/logLevel';
import { StrapiPaths } from '../models/strapiPaths';
import { CommonHelpers } from './commonHelpers';
import { FileHelpers } from './fileHelpers';
import { Logger } from './logger';

yargs(hideBin(process.argv))
  .command(
    'deleteAllGeneratedFiles [strapi-root-path]',
    `Deletes all files that has a first line with the text '${CommonHelpers.headerComment.trimEnd()}'`,
    (yargs) => {
      return yargs.positional('strapi-root-path', {
        describe: 'Path to the Strapi project root',
        type: 'string',
        demandOption: true,
      });
    },
    (argv) => {
      console.log('argv', argv);

      if (argv.strapiRootPath) {
        console.log(`Executing script at path: ${argv.strapiRootPath}`);
        const strapiPaths: StrapiPaths = StrapiPaths.fromRootPath(argv.strapiRootPath);
        FileHelpers.deleteUnnecessaryGeneratedInterfaces(strapiPaths, new Logger(LogLevel.Verbose));
      } else {
        console.error('strapi-root-path parameter was missing');
      }
    }
  )
  .demandCommand(1)
  .help()
  .argv;