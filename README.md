# Strapi Plugin Schemas to TS

Strapi-Plugin-Schemas-to-TS is a plugin for Strapi v4 that automatically converts your Strapi schemas into Typescript interfaces. It scans all schema files at each server start and generates the corresponding Typescript interface files.

## Features

- Automatically generates Typescript interfaces from Strapi schemas
- Scans for new or updated Strapi schema files at each server start
- Provides accurate Typescript interfaces based on your Strapi schema files

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
- Components interfaces will be created in `src/components/{component collection name}/{componentInterfacesFolderName}`. The `componentInterfacesFolderName` value is a config property of this plugin. The default value is **interfaces**.
- Common interfaces will be created inside `src/{commonInterfacesFolderName}/strapi-plugin-schemas-to-ts`. The `commonInterfacesFolderName` value is a config property of this plugin. The default value is **common**.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.