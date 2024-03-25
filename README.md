# Strapi Plugin Schemas to TS
![NPM Version](https://img.shields.io/npm/v/strapi-plugin-schemas-to-ts)
![NPM Downloads](https://img.shields.io/npm/dw/strapi-plugin-schemas-to-ts)


Strapi-Plugin-Schemas-to-TS is a plugin for **Strapi v4** that automatically **converts your Strapi schemas into Typescript interfaces**.

## Features
- Automatically generates Typescript interfaces from Strapi schemas
- Scans for new or updated Strapi schema files at each server start
- Provides accurate Typescript interfaces based on your Strapi schema files
- Automatically deletes interfaces generated in previous executions that are not valid anymore.

## How it works
In every execution of the Strapi server, it reads all files containing schema definitions, both content types and components. Then generates Typescript interfaces based on those definitions. 

The interfaces will only be generated if they don't exist or if there have been changes. Otherwise they will be skipped, preventing the Strapi server to restart (in development) when modifying files.

At the end of the process will delete all interfaces generated in previous executions that are no longer valid, due for instace to a class or component being removed or renamed.

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

While the previous example is enough to get it working, there are other properties that can be configured. Their default values are the ones in this example:

```typescript
export default {
  // ...
  'schemas-to-ts': {
    enabled: true,
    config: {
      acceptedNodeEnvs: ["development"],
      commonInterfacesFolderName: 'schemas-to-ts',
      alwaysAddEnumSuffix: false,
      alwaysAddComponentSuffix: false,
      usePrettierIfAvailable: true,
      logLevel: 2,
      destinationFolder: undefined,
    }
  },
  // ...
}
```

- acceptedNodeEnvs ➡️ An array with all the environments (process.env.NODE_ENV) in which the interfaces will be generated.
- commonInterfacesFolderName ➡️ The `common` interfaces (see below) will be generated in the `./src/common/{commonInterfacesFolderName}` folder. If there's no value assigned to this property, or in case the value is empty ("") it will use the default value, so it will be `./src/common/schemas-to-ts`.
- alwaysAddEnumSuffix ➡️ Set to true will generate all enums with an `Enum` suffix. For instance: `CarType` would become `CarTypeEnum`.
- alwaysAddComponentSuffix ➡️ Set to true will generate all components with a `Component` suffix. For instance: `CarBrand` would become `CarBrandComponent`.
- usePrettierIfAvailable: ➡️ Will look for prettier configuration in the Strapi root project and if available will apply that prettier configuration to the generated interfaces.
- logLevel ➡️ Set the value of the log level:
  - None = 0,
  - Verbose = 1,
  - Debug = 2,
  - Information = 3,
  - Error = 4
- destinationFolder ➡️ Undefined by default, if it holds a value, it's expected to be a subfolder path within the Strapi folder. This folder will be the destination folder for all the generated interfaces. **If this option is set, it will superseed the one set in `commonInterfacesFolderName`**.
  
  Inside the destination folder, 3 subfolders will be created:
  - **apis** will have all the interfaces generated from Content Types.
  - **commons** will have all the common interfaces. See [Interfaces sources](#interfaces-sources)
  - **components** will have a subfolder for each component group, and inside there will be the interfaces for each group.
  
  Also, a number of rules have been created to ensure the destination path is valid:
  - The path must be inside the Strapi project that's being executed. That prevents things like setting './../../' as a path
  - The path can't be the root folder of the Strapi project.
  - The path can't be the src folder of the Strapi project.
  - The path can't be any of this folders, nor can it be inside any of them:
    - Strapi api folder
    - Strapi components folder
    - Strapi extensions folder
    - Strapi policies folder
    - Strapi middlewares folder
    - Strapi config folder
    - Strapi dist folder
    - Strapi public folder for static files
  
  Apart from that, almost any text will be valid.
  Some examples of valid values are:
  - "src/common/schemas-to-ts"
  - "generated-interfaces"
  - "workspace/interfaces"
  

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

## Enums
Strapi enumeration attributes will be generated as typescript enums. However there are some considerations regarding enum names:
- If the alwaysAddEnumSuffix is set to true, the enum will be generated as explained in the config description.
- Same would happen if the enum name collides with any interface name generated from that schema.
- Typescript enum options only allow letters and numbers in their name, so any other character would be eliminated, and vowels would be stripped off their accents.
- There are many versions of Strapi that allows to have enum attributes in components with numeric values. As the values get converted to typescript enum options, a numeric one would nor be valid. To avoid that error, any time an enum option is numeric, it'll have an underscore as a prefix.

Here's an example of the last two points:
```ts
export enum Year {
  Starting2012 = 'Starting-2012',
  _2013 = '2013',
  Ending2014 = 'Ending-2014'
}
```

## Interfaces paths
- API interfaces will be created in the same folder as their schemas. The name of the file will be the same as the singular name property in the schema.
- Components interfaces will be created in `src/components/{component collection name}/interfaces`. The `component collection name ` value is the folder where the component schema is located.
- Common interfaces will be created inside `src/common/{commonInterfacesFolderName}`. The `commonInterfacesFolderName` value is a config property of this plugin.

## CLI
The Cli allows to execute some functions without the need to run Strapi. As the Cli has been added to the **scripts** and the **bin** sections of the **package.json**, it can be executed with `schemas-to-ts`.

As it provides help, this command will print it out:
```sh
schemas-to-ts --help
```

All command parameters are **case sensitive** and can be written both in *camel case* and in *kebab case*. You can see more about command parameters using the help:
 ```sh
 schemas-to-ts {CommandName} --help
 ```

### Delete All Generated Files. Command name: `deleteAllGeneratedFiles`
This command deletes all files that have a first line with the text '**// Interface automatically generated by schemas-to-ts**'.  It allows this parameters:
- **strapi-root-path** (Required) ➡️ Path to the Strapi project root.
- **logLevel** (Optional) ➡️ Sets the log level. Options are None, Verbose, Debug, Information, and Error. Defaults to the plugin configuration.

Examples:
```sh
schemas-to-ts deleteAllGeneratedFiles --strapi-root-path /path/to/strapi
```

```sh
schemas-to-ts deleteAllGeneratedFiles --strapi-root-path /path/to/strapi --logLevel Information
```

### Generate Interfaces. Command name: `generateInterfaces`
This command generates TypeScript interfaces for your Strapi project. It allows this parameters:
- **strapi-root-path** (Required) ➡️ Path to the Strapi project root.
- **acceptedNodeEnvs** (Optional) ➡️ Array of accepted Node environments. Defaults to the environments defined in the plugin configuration. The values can be separated by comma or by space.
- **commonInterfacesFolderName** (Optional) ➡️ Name of the folder where common interfaces will be stored. Defaults to the value in the plugin configuration.
- **alwaysAddEnumSuffix** (Optional) ➡️ Whether to always add an enum suffix to enum names. Defaults to the plugin configuration.
- **alwaysAddComponentSuffix** (Optional) ➡️ Whether to always add a component suffix to component names. Defaults to the plugin configuration.
- **usePrettierIfAvailable** (Optional) ➡️ Whether to use Prettier for formatting if available. Defaults to the plugin configuration.
- **logLevel** (Optional) ➡️ Sets the log level. Options are None, Verbose, Debug, Information, and Error. Defaults to the plugin configuration.
- **destinationFolder** (Optional) ➡️ Sets the destination folder. Defaults to the plugin configuration.

Examples:
```sh
schemas-to-ts generateInterfaces  --strapi-root-path /path/to/strapi
```

```sh
schemas-to-ts generateInterfaces  --strapi-root-path /path/to/strapi --acceptedNodeEnvs staging development,test --commonInterfacesFolderName interfaces --alwaysAddEnumSuffix true --alwaysAddComponentSuffix false --usePrettierIfAvailable false --logLevel Information
```

```sh
schemas-to-ts generateInterfaces  --strapi-root-path /path/to/strapi --acceptedNodeEnvs staging development,test --destinationFolder src/schemas-to-ts --alwaysAddEnumSuffix true --alwaysAddComponentSuffix false --usePrettierIfAvailable false --logLevel Information
```



## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog
Please, review the [changelog](CHANGELOG.md) to know about the differences between published versions of this project.

## Acknowledgements
This project began as a fork of the [Types-4-Strapi](https://github.com/francescolorenzetti/types-4-strapi) created by [Francesco Lorenzetti](https://github.com/francescolorenzetti), but at the end it was so different on it's purpose (being a plugin Vs being executed on demand) and there was so much new code that I turned it into a new whole project. However the algorithm to convert the schema into an interface is heavily inspired in Francesco's work.