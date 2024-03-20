import fs from 'fs';
import path from 'path';
import { LogLevel } from '../models/logLevel';
import { CommonHelpers } from './commonHelpers';
import { Logger } from './logger';

export class FileHelpers {
  private static readonly srcFolderPath = strapi.dirs.app.src;
  private static readonly rootFolderPath = strapi.dirs.app.root;

  public static ensureFolderPathExistRecursive(...subfolders: string[]): string {
    let folder = this.srcFolderPath;
    for (const subfolder of subfolders) {
      folder = path.join(folder, subfolder);
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
      }
    }

    return folder;
  }

  public static folderExists(folderPath: string): boolean {
    try {
      return fs.statSync(folderPath).isDirectory();
    } catch (err) {
      return false;
    }
  }


  public static fileExists(filePath: string): boolean {
    try {
      return fs.statSync(filePath).isFile();
    } catch {
      return false;
    }
  }

  public static writeInterfaceFile(folderPath: string, fileName: string, interfacesFileContent: string, logger: Logger): string {
    let writeFile = true;
    const destinationPath: string = path.join(folderPath, fileName);
    if (FileHelpers.fileExists(destinationPath)) {
      const fileContent: string = fs.readFileSync(destinationPath, 'utf8');
      if (fileContent === interfacesFileContent) {
        logger.debug(`File ${destinationPath} is up to date.`);
        writeFile = false;
      }
    }

    if (writeFile) {
      logger.debug(`Writing file ${destinationPath}`);
      fs.writeFileSync(destinationPath, interfacesFileContent, 'utf8');
    }

    return destinationPath;
  }

  public static getRelativePath(fromPath: string, toPath: string): string {
    let stat = fs.statSync(fromPath);
    if (stat.isDirectory()) {
      // path.relative works better with file paths, so we add an unexisting file to the route
      fromPath += '/.dumbFile.txt';
    }

    stat = fs.statSync(toPath);
    if (stat.isDirectory()) {
      toPath += '/.dumbFile.txt';
    }

    const relativePath = path.relative(path.dirname(fromPath), path.dirname(toPath));
    return relativePath === '' ? './' : relativePath;
  }

  public static deleteUnnecessaryGeneratedInterfaces(logger?: Logger, filesToKeep?: string[]) {
    if (!logger) {
      logger = new Logger(LogLevel.Verbose);
    }

    // Array of exact paths to exclude
    const excludedPaths: string[] = [
      path.join(this.rootFolderPath, 'node_modules'),
      path.join(this.rootFolderPath, 'public'),
      path.join(this.rootFolderPath, 'database'),
      path.join(this.rootFolderPath, 'dist'),
      path.join(this.srcFolderPath, 'plugins'),
      path.join(this.srcFolderPath, 'admin'),
    ];

    // Function to recursively search for files
    function searchFiles(dir: string): void {
      logger.verbose('path.resolve(dir)', path.resolve(dir));
      logger.verbose('path.basename(dir)', path.basename(dir));

      // Skip the directory if it's in the excluded paths or begins with '.' (.git, .cache, .vscode...)
      if (excludedPaths.includes(path.resolve(dir)) || path.basename(dir).startsWith('.')) {
        return;
      }

      const files: string[] = fs.readdirSync(dir);

      for (const file of files) {
        const filePath: string = path.join(dir, file);
        const stat: fs.Stats = fs.statSync(filePath);

        if (stat.isDirectory()) {
          searchFiles(filePath); // Recursively search in sub-directory
        } else if (filesToKeep.includes(filePath)) {
          return;
        } else if (path.extname(file) === '.ts') {
          checkAndDeleteFile(filePath);
        }
      }
    }

    // Function to check the first line of the file and delete if it matches
    function checkAndDeleteFile(filePath: string): void {
      const firstLine: string = fs.readFileSync(filePath, 'utf8').split('\n')[0];
      if (CommonHelpers.compareIgnoringLineBreaks(firstLine, CommonHelpers.headerComment)) {
        fs.unlinkSync(filePath); // Delete the file
        logger.debug(`Deleted: ${filePath}`);
      }
    }

    // Start the search
    searchFiles(this.rootFolderPath);
  }
}