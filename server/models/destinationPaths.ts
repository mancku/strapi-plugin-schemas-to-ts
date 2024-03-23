import path from 'path';
import { FileHelpers } from '../schemas-to-ts/fileHelpers';
import { PluginConfig } from './pluginConfig';
import { pluginName } from './pluginName';
import { StrapiPaths } from './strapiPaths';

export class DestinationPaths {
  public commons?: string;
  public apis?: string;
  public components?: string;
  public readonly useForApis: boolean;

  private readonly componentInterfacesFolderName: string = 'interfaces';
  private readonly commonFolderName: string = 'common';

  constructor(config: PluginConfig, strapiPaths: StrapiPaths) {
    let useDefaultFolders: boolean = true;
    let destinationFolder: string = config.destinationFolder;
    if (destinationFolder) {
      destinationFolder = this.getFinalDestinationFolder(destinationFolder, strapiPaths);
      this.commons = FileHelpers.ensureFolderPathExistRecursive(destinationFolder, this.commonFolderName);
      this.apis = FileHelpers.ensureFolderPathExistRecursive(destinationFolder, 'api');
      this.components = FileHelpers.ensureFolderPathExistRecursive(destinationFolder, 'components');
      useDefaultFolders = false;
    }

    if (useDefaultFolders) {
      this.components = FileHelpers.ensureFolderPathExistRecursive(strapiPaths.components, this.componentInterfacesFolderName);
      this.commons = FileHelpers.ensureFolderPathExistRecursive(strapiPaths.src, this.commonFolderName, config.commonInterfacesFolderName);
    }

    this.useForApis = !!destinationFolder;
  }

  private getFinalDestinationFolder(destinationFolder: string, strapiPaths: StrapiPaths) {
    if (destinationFolder.startsWith(strapiPaths.root)) {
      destinationFolder = this.removeStrapiRootPathFromFullPath(destinationFolder, strapiPaths.root);
    }

    destinationFolder = path.join(strapiPaths.root, destinationFolder);
    this.assertDestinationIsInsideStrap(destinationFolder, strapiPaths);

    destinationFolder = FileHelpers.normalizeWithoutTrailingSeparator(destinationFolder);
    this.assertDestinationIsNotStrapiRoot(destinationFolder, strapiPaths);

    const relativeRoute: string = this.removeStrapiRootPathFromFullPath(destinationFolder, strapiPaths.root);
    const folders: string[] = relativeRoute.split(path.sep).filter(part => part !== '');
    destinationFolder = FileHelpers.ensureFolderPathExistRecursive(strapiPaths.root, ...folders);
    return destinationFolder;
  }

  private assertDestinationIsNotStrapiRoot(destinationFolder: string, strapiPaths: StrapiPaths) {
    if (destinationFolder === strapiPaths.root) {
      throw new Error(`${pluginName} ⚠️  The given destinationFolder is the same as the Strapi root`);
    }
  }

  private assertDestinationIsInsideStrap(destinationFolder: string, strapiPaths: StrapiPaths) {
    if (!destinationFolder.startsWith(strapiPaths.root)) {
      throw new Error(`${pluginName} ⚠️  The destination folder is not inside the Strapi project: '${destinationFolder}'`);
    }
  }

  private removeStrapiRootPathFromFullPath(destinationFolder: string, strapiRootPath: string): string {
    return path.relative(strapiRootPath, destinationFolder);
  }
}
