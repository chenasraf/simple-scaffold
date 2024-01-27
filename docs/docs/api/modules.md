---
id: "modules"
title: "simple-scaffold"
sidebar_label: "Exports"
sidebar_position: 0.5
custom_edit_url: null
---

## Enumerations

- [LogLevel](enums/LogLevel.md)

## Interfaces

- [ScaffoldCmdConfig](interfaces/ScaffoldCmdConfig.md)
- [ScaffoldConfig](interfaces/ScaffoldConfig.md)

## Config

### FileResponse

Ƭ **FileResponse**\<`T`\>: `T` \| [`FileResponseHandler`](modules.md#fileresponsehandler)\<`T`\>

Represents a response for file path information.
Can either be:

1. `T` - static value
2. A function with the following signature which returns `T`:
   ```typescript
   (fullPath: string, basedir: string, basename: string) => T
   ```

**`See`**

[FileResponseHandler](modules.md#fileresponsehandler)

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[types.ts:324](https://github.com/chenasraf/simple-scaffold/blob/3343df7/src/types.ts#L324)

___

### FileResponseHandler

Ƭ **FileResponseHandler**\<`T`\>: (`fullPath`: `string`, `basedir`: `string`, `basename`: `string`) => `T`

A function that takes path information about file, and returns a value of type `T`

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | The return type for the function |

#### Type declaration

▸ (`fullPath`, `basedir`, `basename`): `T`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fullPath` | `string` | The full path of the current file |
| `basedir` | `string` | The directory containing the current file |
| `basename` | `string` | The name of the file |

##### Returns

`T`

#### Defined in

[types.ts:306](https://github.com/chenasraf/simple-scaffold/blob/3343df7/src/types.ts#L306)

## Helpers

### CaseHelpers

Ƭ **CaseHelpers**: ``"camelCase"`` \| ``"hyphenCase"`` \| ``"kebabCase"`` \| ``"lowerCase"`` \| ``"pascalCase"`` \| ``"snakeCase"`` \| ``"startCase"`` \| ``"upperCase"``

The names of the available helper functions that relate to text capitalization.

These are available for `subfolderNameHelper`.

| Helper name  | Example code            | Example output |
| ------------ | ----------------------- | -------------- |
| [None]       | `{{ name }}`            | my name        |
| `camelCase`  | `{{ camelCase name }}`  | myName         |
| `snakeCase`  | `{{ snakeCase name }}`  | my_name        |
| `startCase`  | `{{ startCase name }}`  | My Name        |
| `kebabCase`  | `{{ kebabCase name }}`  | my-name        |
| `hyphenCase` | `{{ hyphenCase name }}` | my-name        |
| `pascalCase` | `{{ pascalCase name }}` | MyName         |
| `upperCase`  | `{{ upperCase name }}`  | MY NAME        |
| `lowerCase`  | `{{ lowerCase name }}`  | my name        |

**`See`**

 - [DefaultHelpers](modules.md#defaulthelpers)
 - [DateHelpers](modules.md#datehelpers)
 - [ScaffoldConfig](interfaces/ScaffoldConfig.md)
 - [ScaffoldConfig.subFolderNameHelper](interfaces/ScaffoldConfig.md#subfoldernamehelper)

#### Defined in

[types.ts:195](https://github.com/chenasraf/simple-scaffold/blob/3343df7/src/types.ts#L195)

___

### DateHelpers

Ƭ **DateHelpers**: ``"date"`` \| ``"now"``

The names of the available helper functions that relate to dates.

| Helper name                      | Description                                                      | Example code                                                     | Example output     |
| -------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------ |
| `now`                            | Current date with format                                         | `{{ now "yyyy-MM-dd HH:mm" }}`                                   | `2042-01-01 15:00` |
| `now` (with offset)              | Current date with format, and with offset                        | `{{ now "yyyy-MM-dd HH:mm" -1 "hours" }}`                        | `2042-01-01 14:00` |
| `date`                           | Custom date with format                                          | `{{ date "2042-01-01T15:00:00Z" "yyyy-MM-dd HH:mm" }}`           | `2042-01-01 15:00` |
| `date` (with offset)             | Custom date with format, and with offset                         | `{{ date "2042-01-01T15:00:00Z" "yyyy-MM-dd HH:mm" -1 "days" }}` | `2041-31-12 15:00` |
| `date` (with date from `--data`) | Custom date with format, with data from the `data` config option | `{{ date myCustomDate "yyyy-MM-dd HH:mm" }}`                     | `2042-01-01 12:00` |

Further details:

- We use [`date-fns`](https://date-fns.org/docs/) for parsing/manipulating the dates. If you want
  more information on the date tokens to use, refer to
  [their format documentation](https://date-fns.org/docs/format).

- The date helper format takes the following arguments:

  ```typescript
  (
    date: string,
    format: string,
    offsetAmount?: number,
    offsetType?: "years" | "months" | "weeks" | "days" | "hours" | "minutes" | "seconds"
  )
  ```

- **The now helper** (for current time) takes the same arguments, minus the first one (`date`) as it is implicitly
  the current date.

**`See`**

 - [DefaultHelpers](modules.md#defaulthelpers)
 - [CaseHelpers](modules.md#casehelpers)
 - [ScaffoldConfig](interfaces/ScaffoldConfig.md)

#### Defined in

[types.ts:242](https://github.com/chenasraf/simple-scaffold/blob/3343df7/src/types.ts#L242)

___

### DefaultHelpers

Ƭ **DefaultHelpers**: [`CaseHelpers`](modules.md#casehelpers) \| [`DateHelpers`](modules.md#datehelpers)

The names of all the available helper functions in templates.
Simple-Scaffold provides some built-in text transformation filters usable by Handlebars.js.

For example, you may use `{{ snakeCase name }}` inside a template file or filename, and it will
replace `My Name` with `my_name` when producing the final value.

**`See`**

 - [CaseHelpers](modules.md#casehelpers)
 - [DateHelpers](modules.md#datehelpers)
 - [ScaffoldConfig](interfaces/ScaffoldConfig.md)

#### Defined in

[types.ts:257](https://github.com/chenasraf/simple-scaffold/blob/3343df7/src/types.ts#L257)

___

### Helper

Ƭ **Helper**: `HelperDelegate`

Helper function, see https://handlebarsjs.com/guide/#custom-helpers

#### Defined in

[types.ts:264](https://github.com/chenasraf/simple-scaffold/blob/3343df7/src/types.ts#L264)

## Main

### Scaffold

▸ **Scaffold**(`config`): `Promise`\<`void`\>

Create a scaffold using given `options`.

#### Create files
To create a file structure to output, use any directory and file structure you would like.
Inside folder names, file names or file contents, you may place `{{ var }}` where `var` is either
`name` which is the scaffold name you provided or one of the keys you provided in the `data` option.

The contents and names will be replaced with the transformed values so you can use your original structure as a
boilerplate for other projects, components, modules, or even single files.

The files will maintain their structure, starting from the directory containing the template (or the template itself
if it is already a directory), and will output from that directory into the directory defined by `config.output`.

#### Helpers
Helpers are functions you can use to transform your `{{ var }}` contents into other values without having to
pre-define the data and use a duplicated key.

Any functions you provide in `helpers` option will also be available to you to make custom formatting as you see fit
(for example, formatting a date)

For available default values, see [DefaultHelpers](modules.md#defaulthelpers).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`ScaffoldConfig`](interfaces/ScaffoldConfig.md) | The main configuration object |

#### Returns

`Promise`\<`void`\>

A promise that resolves when the scaffold is complete

**`See`**

 - [DefaultHelpers](modules.md#defaulthelpers)
 - [CaseHelpers](modules.md#casehelpers)
 - [DateHelpers](modules.md#datehelpers)

#### Defined in

[scaffold.ts:55](https://github.com/chenasraf/simple-scaffold/blob/3343df7/src/scaffold.ts#L55)

## Other

### default

Renames and re-exports [Scaffold](modules.md#scaffold)

___

### AsyncResolver

Ƭ **AsyncResolver**\<`T`, `R`\>: [`Resolver`](modules.md#resolver)\<`T`, `Promise`\<`R`\> \| `R`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `R` | `T` |

#### Defined in

[types.ts:373](https://github.com/chenasraf/simple-scaffold/blob/3343df7/src/types.ts#L373)

___

### ConfigLoadConfig

Ƭ **ConfigLoadConfig**: [`LogConfig`](modules.md#logconfig) & `Pick`\<[`ScaffoldCmdConfig`](interfaces/ScaffoldCmdConfig.md), ``"config"``\> & \{ `isRemote`: `boolean`  }

#### Defined in

[types.ts:379](https://github.com/chenasraf/simple-scaffold/blob/3343df7/src/types.ts#L379)

___

### LogConfig

Ƭ **LogConfig**: `Pick`\<[`ScaffoldConfig`](interfaces/ScaffoldConfig.md), ``"quiet"`` \| ``"verbose"``\>

#### Defined in

[types.ts:376](https://github.com/chenasraf/simple-scaffold/blob/3343df7/src/types.ts#L376)

___

### MinimalConfig

Ƭ **MinimalConfig**: `Pick`\<[`ScaffoldCmdConfig`](interfaces/ScaffoldCmdConfig.md), ``"name"`` \| ``"key"``\>

#### Defined in

[types.ts:382](https://github.com/chenasraf/simple-scaffold/blob/3343df7/src/types.ts#L382)

___

### Resolver

Ƭ **Resolver**\<`T`, `R`\>: `R` \| (`value`: `T`) => `R`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `R` | `T` |

#### Defined in

[types.ts:370](https://github.com/chenasraf/simple-scaffold/blob/3343df7/src/types.ts#L370)

___

### ScaffoldConfigFile

Ƭ **ScaffoldConfigFile**: [`AsyncResolver`](modules.md#asyncresolver)\<[`ScaffoldCmdConfig`](interfaces/ScaffoldCmdConfig.md), [`ScaffoldConfigMap`](modules.md#scaffoldconfigmap)\>

The scaffold config file is either:
- A [ScaffoldConfigMap](modules.md#scaffoldconfigmap) object
- A function that returns a [ScaffoldConfigMap](modules.md#scaffoldconfigmap) object
- A promise that resolves to a [ScaffoldConfigMap](modules.md#scaffoldconfigmap) object
- A function that returns a promise that resolves to a [ScaffoldConfigMap](modules.md#scaffoldconfigmap) object

#### Defined in

[types.ts:367](https://github.com/chenasraf/simple-scaffold/blob/3343df7/src/types.ts#L367)

___

### ScaffoldConfigMap

Ƭ **ScaffoldConfigMap**: `Record`\<`string`, [`ScaffoldConfig`](interfaces/ScaffoldConfig.md)\>

A mapping of scaffold template keys to their configurations.

Each configuration is a [ScaffoldConfig](interfaces/ScaffoldConfig.md) object.

The key is the name of the template, and the value is the configuration for that template.

When no template key is provided to the scaffold command, the "default" template is used.

**`See`**

[ScaffoldConfig](interfaces/ScaffoldConfig.md)

#### Defined in

[types.ts:359](https://github.com/chenasraf/simple-scaffold/blob/3343df7/src/types.ts#L359)
