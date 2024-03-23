import path from 'path';
import { FileHelpers } from '../schemas-to-ts/fileHelpers';
import { PluginConfig } from './pluginConfig';
import { StrapiPaths } from './strapiPaths';

export class DestinationPaths {
  public commons?: string;
  public apis?: string;
  public components?: string;
  public readonly useForApisAndComponents: boolean;

  private readonly componentInterfacesFolderName: string = 'interfaces';
  private readonly commonFolderName: string = 'common';

  constructor(config: PluginConfig, strapiPaths: StrapiPaths) {
    let useDefaultFolders: boolean = true;
    let destinationFolder: string = config.destinationFolder;
    if (destinationFolder) {
      if (destinationFolder.startsWith(strapiPaths.root)) {
        destinationFolder = this.removeStrapiRootPathFromFullPath(destinationFolder, strapiPaths.root);
      }

      destinationFolder = path.join(strapiPaths.root, destinationFolder);
      if (!destinationFolder.startsWith(strapiPaths.root)) {
        throw new Error(`The destination folder is not inside the Strapi project: '${destinationFolder}'`);
      }

      const relativeRoute: string = this.removeStrapiRootPathFromFullPath(destinationFolder, strapiPaths.root);
      const folders: string[] = relativeRoute.split(path.sep).filter(part => part !== '');
      destinationFolder = FileHelpers.ensureFolderPathExistRecursive(strapiPaths.root, ...folders);

      this.commons = FileHelpers.ensureFolderPathExistRecursive(destinationFolder, this.commonFolderName);
      this.apis = FileHelpers.ensureFolderPathExistRecursive(destinationFolder, 'api');
      this.components = FileHelpers.ensureFolderPathExistRecursive(destinationFolder, 'components');
      useDefaultFolders = false;
    }

    if (useDefaultFolders) {
      this.components = FileHelpers.ensureFolderPathExistRecursive(strapiPaths.components, this.componentInterfacesFolderName);
      this.commons = FileHelpers.ensureFolderPathExistRecursive(strapiPaths.src, this.commonFolderName, config.commonInterfacesFolderName);
    }

    this.useForApisAndComponents = !!destinationFolder;
  }

  private removeStrapiRootPathFromFullPath(destinationFolder: string, strapiRootPath: string): string {
    return path.relative(strapiRootPath, destinationFolder);
  }
}
