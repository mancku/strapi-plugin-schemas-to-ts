# Strapi Plugin Schemas to TS

Strapi-Plugin-Schemas-to-TS is a plugin for **Strapi v4** that automatically **converts your Strapi schemas into Typescript interfaces**.

## Features
- Automatically generates Typescript interfaces from Strapi schemas
- Scans for new or updated Strapi schema files at each server start
- Provides accurate Typescript interfaces based on your Strapi schema files

## How it works
In every execution of the Strapi server, it reads all files containing schema definitions, both content types and components. Then generates Typescript interfaces based on those definitions. The interfaces will only be generated if they don't exist or if there have been changes. Otherwise they will be skipped, preventing the Strapi server to restart (in development) when modifying files.

## How to set it up
Here are the instructions to install and configure the package:

### Installation
To install the plugin execute either one of the following commands:
```sh
# Using Yarn
yarn add strapi-plugin-schemas-to-ts

# Using NPM
npm install strapi-plugin-schemas-to-ts
```

### Configuration
The plugin needs to be configured in the `./config/plugins.ts` file of Strapi. The file might need to be created if it does not exists. In that file, the plugin must be enabled in order for it to work:

```typescript
export default {
  // ...
  'schemas-to-ts': {
    enabled: true,
  },
  // ...
}
```

While the previous example is enough to get it work, there are 3 different properties that can be configured. Their default values are the ones in this example:
```typescript
export default {
  // ...
  'schemas-to-ts': {
    enabled: true,
    config: {
      acceptedNodeEnvs: ["development"],
      commonInterfacesFolderName: "schemas-to-ts",
      verboseLogs: false,
    }
  },
  // ...
}
```

- acceptedNodeEnvs ➡️ An array with all the environments (process.env.NODE_ENV) in which the interfaces will be generated.
- commonInterfacesFolderName ➡️ The `common` interfaces (see below) will be generated in the `./src/common/{commonInterfacesFolderName}` folder. If there's no value assigned to this property, or in case the value is empty ("") it will use the default value, so it will be `./src/common/schemas-to-ts`.
- verboseLogs ➡️ Set to true to get additional console logs during the execution of the plugin.

## Interfaces sources
There are 3 different interface sources: API, Component & Common.
- API ➡️ genereted from the schema.json files of collecion and single types.
- Component ➡️ genereted from the components.
- Common ➡️ Interfaces for Strapi default data structures.
  - **Media** is the interface for the items on the Media Library of Strapi.
  - **MediaFormat** is the interface for the formats property of the Media interface.
  - **User** is the interface for the user (user-permissions) schema of Strapi.
  - **Payload** is the interface to represent the pagination of Strapi collections.
  - **BeforeRunEvent** & **AfterRunEvent** are the interfaces for the representation of data in the BeforeXXXX and AfterXXXX methods of lifecycles.
  - **AdminPanelRelationPropertyModification** is a generic interface also related with lifecycles: when a relation between two entities is modified in the admin panel of Strapi, that modification will reach the lifecycles in the form of this  interface.

## Interfaces types
For every schema, different types of interfaces will be generated. That is because Strapi v4 does not always represent the data using the same structure.
- Standard ➡️ the object is split between the id property and then the rest of the properties are inside an `attributes` property.
- Plain ➡️ there's no `attributes` property, so the id property and the rest of the properties are at the same level.
- No Relations ➡️ Properties that are a relationship to other API interface will be of type number instead of their type being the interface of their relationship.
- AdminPanelLifeCycle ➡️ Properties of an API interface that are a relationship to other API interface will be of type AdminPanelRelationPropertyModification and then the plain interface of the current Schema.

## Interfaces paths
- API interfaces will be created in the same folder as their schemas. The name of the file will be the same as the singular name property in the schema.
- Components interfaces will be created in `src/components/{component collection name}/interfaces`. The `component collection name ` value is the folder where the component schema is located.
- Common interfaces will be created inside `src/common/{commonInterfacesFolderName}`. The `commonInterfacesFolderName` value is a config property of this plugin.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements
This project began as a fork of the [Types-4-Strapi](https://github.com/francescolorenzetti/types-4-strapi) created by [Francesco Lorenzetti](https://github.com/francescolorenzetti), but at the end it was so different on it's purpose (being a plugin Vs being executed on demand) and there was so much new code that I turned it into a new whole project. However the algorithm to convert the schema into an interface is heavily inspired in Francesco's work.