# Changelog

## [1.1.7] - 2023-07-23
### Changed
- [Commit bb858179e17317e00f5f826a2ae72226e3b6d29b](https://github.com/mancku/strapi-plugin-schemas-to-ts/commit/bb858179e17317e00f5f826a2ae72226e3b6d29b)
  - Added a configuration property to allow to always add the 'Component' suffix to components names

## [1.1.6] - 2023-07-23
### Fixed
- [Fixed name conflicts between components and components and content types](https://github.com/mancku/strapi-plugin-schemas-to-ts/pull/24)

## [1.1.5] - 2023-07-19
### Fixed
- [Fixed circular dependency reference for plain interfaces](https://github.com/mancku/strapi-plugin-schemas-to-ts/pull/21)

## [1.1.4] - 2023-07-16
### Fixed
- [Fixed enum naming](https://github.com/mancku/strapi-plugin-schemas-to-ts/pull/17)

## [1.1.3] - 2023-07-11
### Fixed
- [Avoiding adding createdAt, updatedAt and publishedAt to components](https://github.com/mancku/strapi-plugin-schemas-to-ts/pull/13)

## [1.1.2] - 2023-07-11
### Changed
**Commit [52bc7477107c0d31f41a698646e08f29d7f7a6f9](https://github.com/mancku/strapi-plugin-schemas-to-ts/commit/52bc7477107c0d31f41a698646e08f29d7f7a6f9)**: **Modified interface builder to generate enumerations as Typescript enums.**

Strapi enumeration schema attributes weren't being generated as Typescript enums. Now they are, so they can be referenced outside the schema interfaces and used as regular enums.


## [1.1.1] - 2023-07-11
### Fixed
- [Added missing large MediaFormat for Media formats](https://github.com/mancku/strapi-plugin-schemas-to-ts/pull/3)
- [Added missing content types createdAt, updatedAt and publishedAt attributes](https://github.com/mancku/strapi-plugin-schemas-to-ts/pull/6)
- [Fixed circular relation error](https://github.com/mancku/strapi-plugin-schemas-to-ts/pull/5)
### Documentation
- [Added Changelog](https://github.com/mancku/strapi-plugin-schemas-to-ts/commit/d6ebfcbf2b949681c104d1bbde41d873fe9fb672)

## [1.1.0] - 2023-05-24
### Changed
- **Commit [cb165a9651e1ca18948cc5a9535f05c69475628d](https://github.com/mancku/strapi-plugin-schemas-to-ts/commit/cb165a9651e1ca18948cc5a9535f05c69475628d)**
  - Modified how commonFolderModelsPath variable is build 
  - Deleted componentInterfacesFolderName config property
### Documentation
- [Added "How it works", "How to set it up" & "Acknowledgements" sections](https://github.com/mancku/strapi-plugin-schemas-to-ts/commit/1c0ec7544c07e76527b06fc301982edadc904e07)

## [1.0.4] - 2023-05-23
### ⚠️ Versions 1.0.4 and below shall be avoided