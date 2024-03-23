import { Strapi } from '@strapi/strapi';
import { PluginConfig } from './models/pluginConfig';
import { pluginName } from './models/pluginName';
import { StrapiPaths } from './models/strapiPaths';
import { Converter } from './schemas-to-ts/converter';

export default ({ strapi }: { strapi: Strapi }) => {
  const config: PluginConfig = strapi.config.get(`plugin.${pluginName}`);
  const strapiPaths: StrapiPaths = configureStrapiPaths(strapi);
  
  const converter = new Converter(config, strapi.config.info.strapi, strapiPaths);
  converter.SchemasToTs();
};

function configureStrapiPaths(strapi: Strapi) {
  const strapiPaths: StrapiPaths = new StrapiPaths(strapi.dirs.app.root);
  strapiPaths.src = strapi.dirs.app.src;
  strapiPaths.api = strapi.dirs.app.api;
  strapiPaths.components = strapi.dirs.app.components;
  return strapiPaths;
}
