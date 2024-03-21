import path from 'path';

export class StrapiPaths {
  public root: string;
  public src: string;
  public api: string;
  public components: string;

  public static fromRootPath(rootPath: string): StrapiPaths {
    const strapiPaths: StrapiPaths = new StrapiPaths();
    strapiPaths.root = rootPath;
    strapiPaths.src = path.join(rootPath, 'src');
    strapiPaths.api = path.join(strapiPaths.src, 'api');
    strapiPaths.components = path.join(strapiPaths.src, 'components');
    return strapiPaths;
  }
}