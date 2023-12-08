# Changelog

## [1.1.21] - 2023-11-24
### Fixed
- Apparently version 1.1.20 was published without being build first, so it didn't actually include all the modifications. This version fixes that.
- Also, added a `npmpublish` script to the `package.json` so it builds and then publishes

## [1.1.20] - 2023-11-23
### Fixed
- [fix: escape single quotes in enum values](https://github.com/mancku/strapi-plugin-schemas-to-ts/pull/36)
  - Fixed so enum values with single quotes are not a problem anymore.

- [strapi 4.14 - change source folder](https://github.com/mancku/strapi-plugin-schemas-to-ts/pull/29)
  - Strapi 4.14 introduced a change that "broke" the execution of the plugin. This PR fixes that.

### Changed
- [Commit b3da788cc954e376b3a699ad9536e7e25d920614](https://github.com/mancku/strapi-plugin-schemas-to-ts/commit/b3da788cc954e376b3a699ad9536e7e25d920614)
  - Added prettier as a configuration option, so it can be disabled.

- [Replace console.log with a configurable logger service](https://github.com/mancku/strapi-plugin-schemas-to-ts/pull/39)
  - Added logger as a configuraion option, so it can be adjusted.

## [1.1.10] - 2023-07-27
### Fixed
- [Commit 12ca71eb11d50d9ae220004a320f9d87f8a2a5ae](https://github.com/mancku/strapi-plugin-schemas-to-ts/commit/12ca71eb11d50d9ae220004a320f9d87f8a2a5ae)
  - AdminPanelRelationPropertyModification should never be an array.

### Changed
- [Commit 0392ca7a7e7049f63bf71bf0b2369d06f1194149](https://github.com/mancku/strapi-plugin-schemas-to-ts/commit/0392ca7a7e7049f63bf71bf0b2369d06f1194149)
  - Updated and fixed dependencies.

## [1.1.9] - 2023-07-27
### Fixed
- [Commit 3f987af161dab7985720365cac2dcfa6f6efa591](https://github.com/mancku/strapi-plugin-schemas-to-ts/commit/3f987af161dab7985720365cac2dcfa6f6efa591)
  - Converting to pascal case after replacing invalid chars would result in losing the underscore in snake case values, so the pascal case would not work properly. Modifying the order would first properly  convert to pascal case and then remove the remaining unwanted chars.

## [1.1.8] - 2023-07-27
### Changed
- [Commit ba5d35ddb5b9cdc86f7ec53297d6529772c264ba](https://github.com/mancku/strapi-plugin-schemas-to-ts/commit/ba5d35ddb5b9cdc86f7ec53297d6529772c264ba)
  - Improved enum keys naming by making them Pacal case. This way there won't be any further inconsistency where some keys starts with upper case and some with lower case.

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