import { PluginConfig } from '../../models/pluginConfig';
import { CommonHelpers } from '../commonHelpers';
import { InterfaceBuilder } from "./interfaceBuilder";
import { PostV414InterfaceBuilder } from './postV414InterfaceBuilder';
import { PreV414InterfaceBuilder } from './preV414InterfaceBuilder';

export class InterfaceBuilderFactory {
  public static getInterfaceBuilder(strapiVersion: string, commonHelpers: CommonHelpers, config: PluginConfig): InterfaceBuilder {
    commonHelpers.logger.debug(`Detected Strapi version ${strapiVersion} for interface building`);
    if (this.isStrapiVersionGreaterThanOrEqual(strapiVersion, '4.14')) {
      return new PostV414InterfaceBuilder(commonHelpers, config);
    } else {
      return new PreV414InterfaceBuilder(commonHelpers, config);
    }
  }

  private static isStrapiVersionGreaterThanOrEqual(strapiVersion: string, version: string): boolean {
    const strapiVersionParts = strapiVersion.split('.').map(Number);
    const versionParts = version.split('.').map(Number);

    for (let i = 0; i < Math.max(versionParts.length, strapiVersionParts.length); i++) {
      const versionPart = i < versionParts.length ? versionParts[i] : 0;
      const strapiVersionPart = i < strapiVersionParts.length ? strapiVersionParts[i] : 0;

      if (strapiVersionPart > versionPart) {
        return true;
      }
      if (strapiVersionPart < versionPart) {
        return false;
      }
    }

    return true; // Versions are equal
  }
}