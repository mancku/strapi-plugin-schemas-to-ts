import { Strapi } from '@strapi/strapi';
import { Converter } from './converter/converter';
import { PluginConfig } from './models/pluginConfig';

export const pluginName: string = 'strapi-to-ts';

export default ({ strapi }: { strapi: Strapi }) => {
  const config: PluginConfig = strapi.config.get(`plugin.${pluginName}`);
  Converter.SchemasToTs(config);
};
