import { Strapi } from '@strapi/strapi';
import { PluginConfig } from './models/pluginConfig';
import { pluginName } from './models/pluginName';
import { StrapiPaths } from './models/strapiPaths';
import { Converter } from './schemas-to-ts/converter';

export default ({ strapi }: { strapi: Strapi }) => {
  const config: PluginConfig = strapi.config.get(`plugin.${pluginName}`);
  const strapiPaths: StrapiPaths = {
    root: strapi.dirs.app.root,
    src: strapi.dirs.app.src,
    api: strapi.dirs.app.api,
    components: strapi.dirs.app.components,
  };
  const converter = new Converter(config, strapi.config.info.strapi, strapiPaths);
  converter.SchemasToTs();
};