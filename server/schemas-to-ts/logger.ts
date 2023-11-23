import chalk from 'chalk';
import { LogLevel } from '../models/logLevel';

export class Logger {
  constructor(private minimumLevel: LogLevel) { }

  public verbose(...args: any[]) {
    if (this.minimumLevel <= LogLevel.Verbose) {
      console.log(chalk.gray('VERBOSE:'), ...args);
    }
  }

  public debug(...args: any[]) {
    if (this.minimumLevel <= LogLevel.Debug) {
      console.log(chalk.blue('DEBUG:'), ...args);
    }
  }

  public information(...args: any[]) {
    if (this.minimumLevel <= LogLevel.Information) {
      console.log(chalk.green('INFO:'), ...args);
    }
  }

  public error(...args: any[]) {
    if (this.minimumLevel <= LogLevel.Error) {
      console.log(chalk.red('ERROR:'), ...args);
    }
  }
}
