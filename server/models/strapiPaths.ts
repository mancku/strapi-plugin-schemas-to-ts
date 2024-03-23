import path from 'path';
import { FileHelpers } from '../schemas-to-ts/fileHelpers';

export class StrapiPaths {
  public root: string;
  public src: string;
  public api: string;
  public components: string;

  constructor(rootPath: string) {
    rootPath = FileHelpers.normalizeWithoutTrailingSeparator(rootPath);
    this.root = rootPath;
  }

  public buildFromRootPath(): StrapiPaths {
    const strapiPaths: StrapiPaths = new StrapiPaths(this.root);
    strapiPaths.src = path.join(this.root, 'src');
    strapiPaths.api = path.join(strapiPaths.src, 'api');
    strapiPaths.components = path.join(strapiPaths.src, 'components');
    return strapiPaths;
  }
}

