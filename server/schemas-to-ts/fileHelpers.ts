import fs from 'fs';
import path from 'path';

export class FileHelpers {
  public static ensureFolderPathExistRecursive(...subfolders: string[]): string {
    let folder = strapi.dirs.app.src;
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

  public static writeInterfaceFile(folderPath: string, fileName: string, interfacesFileContent: string) {
    let writeFile = true;
    const destinationPath: string = path.join(folderPath, fileName);
    if (FileHelpers.fileExists(destinationPath)) {
      const fileContent: string = fs.readFileSync(destinationPath, 'utf8');
      if (fileContent === interfacesFileContent) {
        console.log(`File ${destinationPath} is up to date.`);
        writeFile = false;
      }
    }
    if (writeFile) {
      console.log(`Writing file ${destinationPath}`);
      fs.writeFileSync(destinationPath, interfacesFileContent, 'utf8');
    }
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
}