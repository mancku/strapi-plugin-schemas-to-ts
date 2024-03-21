#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { DeleteAllGeneratedFilesCommand } from './cli-commands/deleteAllGeneratedFilesCommand';
import { GenerateInterfacesCommand } from './cli-commands/generateInterfacesCommand';
import { CommonHelpers } from './commonHelpers';

yargs(hideBin(process.argv))
  .command(
    'deleteAllGeneratedFiles [strapi-root-path]',
    `Deletes all files that has a first line with the text '${CommonHelpers.headerComment.trimEnd()}'`,
    (yargs) => DeleteAllGeneratedFilesCommand.configureCommand(yargs),
    (argv) => DeleteAllGeneratedFilesCommand.executeCommand(argv),
  ).command(
    'generateInterfaces [strapi-root-path]',
    'Description of the second command',
    (yargs) => GenerateInterfacesCommand.configureCommand(yargs),
    (argv) => GenerateInterfacesCommand.executeCommand(argv),
  )
  .demandCommand(1)
  .help()
  .argv;
