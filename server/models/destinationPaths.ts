import { StrapiDirectories } from '@strapi/strapi';
import path from 'path';
import { FileHelpers } from '../schemas-to-ts/fileHelpers';
import { PluginConfig } from './pluginConfig';
import { pluginName } from './pluginName';

export class DestinationPaths {
  public commons?: string;
  public apis?: string;
  public components?: string;
  public readonly useForApisAndComponents: boolean;
  public readonly componentInterfacesFolderName: string = 'interfaces';
  
  private readonly apisFolderName: string = 'api';
  private readonly commonFolderName: string = 'common';
  private readonly componentsFolderName: string = 'components';

  constructor(config: PluginConfig, strapiPaths: StrapiDirectories) {
    let useDefaultFolders: boolean = true;
    let destinationFolder: string = config.destinationFolder;
    if (destinationFolder) {
      destinationFolder = this.getFinalDestinationFolder(destinationFolder, strapiPaths);
      this.commons = FileHelpers.ensureFolderPathExistRecursive(destinationFolder, this.commonFolderName);
      this.apis = FileHelpers.ensureFolderPathExistRecursive(destinationFolder, this.apisFolderName);
      this.components = FileHelpers.ensureFolderPathExistRecursive(destinationFolder, this.componentsFolderName);
      useDefaultFolders = false;
    }

    if (useDefaultFolders) {
      this.commons = FileHelpers.ensureFolderPathExistRecursive(strapiPaths.app.src, this.commonFolderName, config.commonInterfacesFolderName);
    }

    this.useForApisAndComponents = !!destinationFolder;
  }

  private getFinalDestinationFolder(destinationFolder: string, strapiPaths: StrapiDirectories) {
    if (destinationFolder.startsWith(strapiPaths.app.root)) {
      destinationFolder = this.removeStrapiRootPathFromFullPath(destinationFolder, strapiPaths.app.root);
    }

    destinationFolder = path.join(strapiPaths.app.root, destinationFolder);
    this.assertDestinationIsInsideStrapi(destinationFolder, strapiPaths);

    destinationFolder = FileHelpers.normalizeWithoutTrailingSeparator(destinationFolder);
    this.assertDestinationIsNotStrapiCoreFolder(destinationFolder, strapiPaths);

    const relativeRoute: string = this.removeStrapiRootPathFromFullPath(destinationFolder, strapiPaths.app.root);
    const folders: string[] = relativeRoute.split(path.sep).filter(part => part !== '');
    destinationFolder = FileHelpers.ensureFolderPathExistRecursive(strapiPaths.app.root, ...folders);
    return destinationFolder;
  }

  private assertDestinationIsInsideStrapi(destinationFolder: string, strapiPaths: StrapiDirectories) {
    if (!destinationFolder.startsWith(strapiPaths.app.root)) {
      throw new Error(`${pluginName} ⚠️  The destination folder is not inside the Strapi project: '${destinationFolder}'`);
    }
  }

  private removeStrapiRootPathFromFullPath(destinationFolder: string, strapiRootPath: string): string {
    return path.relative(strapiRootPath, destinationFolder);
  }

  private assertDestinationIsNotStrapiCoreFolder(destinationFolder: string, strapiPaths: StrapiDirectories) {
    if (destinationFolder === strapiPaths.app.root) {
      throw new Error(`${pluginName} ⚠️  The given destinationFolder is the same as the Strapi root`);
    }

    if (destinationFolder=== strapiPaths.app.src) {
      throw new Error(`${pluginName} ⚠️  The given destinationFolder is the same as the Strapi src`);
    }
    
    if (destinationFolder.startsWith(strapiPaths.app.api)) {
      throw new Error(`${pluginName} ⚠️  The given destinationFolder is inside the Strapi api`);
    }
    
    if (destinationFolder.startsWith(strapiPaths.app.components)) {
      throw new Error(`${pluginName} ⚠️  The given destinationFolder is inside the Strapi components`);
    }
    
    if (destinationFolder.startsWith(strapiPaths.app.extensions)) {
      throw new Error(`${pluginName} ⚠️  The given destinationFolder is inside the Strapi extensions`);
    }
    
    if (destinationFolder.startsWith(strapiPaths.app.policies)) {
      throw new Error(`${pluginName} ⚠️  The given destinationFolder is inside the Strapi policies`);
    }
    
    if (destinationFolder.startsWith(strapiPaths.app.middlewares)) {
      throw new Error(`${pluginName} ⚠️  The given destinationFolder is inside the Strapi middlewares`);
    }
    
    if (destinationFolder.startsWith(strapiPaths.app.config)) {
      throw new Error(`${pluginName} ⚠️  The given destinationFolder is inside the Strapi config`);
    }
    
    if (destinationFolder.startsWith(strapiPaths.dist.root)) {
      throw new Error(`${pluginName} ⚠️  The given destinationFolder is inside the Strapi dist`);
    }
    
    if (destinationFolder.startsWith(strapiPaths.static.public)) {
      throw new Error(`${pluginName} ⚠️  The given destinationFolder is inside the Strapi static`);
    }
  }
}
