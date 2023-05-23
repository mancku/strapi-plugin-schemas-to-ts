import { Strapi } from '@strapi/strapi';
import { PluginConfig } from './models/pluginConfig';
import { Converter } from './schemas-to-ts/converter';

export const pluginName: string = 'schemas-to-ts';

export default ({ strapi }: { strapi: Strapi }) => {
  const config: PluginConfig = strapi.config.get(`plugin.${pluginName}`);
  const converter = new Converter(config);
  converter.SchemasToTs();
};
