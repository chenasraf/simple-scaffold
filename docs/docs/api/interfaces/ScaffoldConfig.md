---
id: "ScaffoldConfig"
title: "Interface: ScaffoldConfig"
sidebar_label: "ScaffoldConfig"
sidebar_position: 0
custom_edit_url: null
---

The config object for defining a scaffolding group.

**`See`**

 - [Node.js usage](https://chenasraf.github.io/simple-scaffold/docs/usage/node|)
 - [CLI usage](https://chenasraf.github.io/simple-scaffold/docs/usage/cli|)
 - [DefaultHelpers](../modules.md#defaulthelpers)
 - [CaseHelpers](../modules.md#casehelpers)
 - [DateHelpers](../modules.md#datehelpers)

## Properties

### name

• **name**: `string`

Name to be passed to the generated files. `{{name}}` and `{{Name}}` inside contents and file names will be replaced
accordingly.

#### Defined in

[types.ts:19](https://github.com/chenasraf/simple-scaffold/blob/d9508cd/src/types.ts#L19)

___

### templates

• **templates**: `string`[]

Template files to use as input. You may provide multiple files, each of which can be a relative or absolute path,
or a glob pattern for multiple file matching easily.

**`Default`**

```ts
Current working directory
```

#### Defined in

[types.ts:27](https://github.com/chenasraf/simple-scaffold/blob/d9508cd/src/types.ts#L27)

___

### output

• **output**: [`FileResponse`](../modules.md#fileresponse)\<`string`\>

Path to output to. If `createSubFolder` is `true`, the subfolder will be created inside this path.

May also be a [FileResponseHandler](../modules.md#fileresponsehandler) which returns a new output path to override the default one.

**`See`**

 - [FileResponse](../modules.md#fileresponse)
 - [FileResponseHandler](../modules.md#fileresponsehandler)

#### Defined in

[types.ts:37](https://github.com/chenasraf/simple-scaffold/blob/d9508cd/src/types.ts#L37)

___

### createSubFolder

• `Optional` **createSubFolder**: `boolean`

Whether to create subfolder with the input name.

When `true`, you may also use [subFolderNameHelper](ScaffoldConfig.md#subfoldernamehelper) to determine a pre-process helper on
the directory name.

**`Default`**

`false`

#### Defined in

[types.ts:47](https://github.com/chenasraf/simple-scaffold/blob/d9508cd/src/types.ts#L47)

___

### data

• `Optional` **data**: `Record`\<`string`, `any`\>

Add custom data to the templates. By default, only your app name is included as `{{name}}` and `{{Name}}`.

This can be any object that will be usable by Handlebars.

#### Defined in

[types.ts:54](https://github.com/chenasraf/simple-scaffold/blob/d9508cd/src/types.ts#L54)

___

### overwrite

• `Optional` **overwrite**: [`FileResponse`](../modules.md#fileresponse)\<`boolean`\>

Enable to override output files, even if they already exist.

You may supply a function to this option, which can take the arguments `(fullPath, baseDir, baseName)` and returns
a boolean for each file.

May also be a [FileResponseHandler](../modules.md#fileresponsehandler) which returns a boolean value per file.

**`See`**

 - [FileResponse](../modules.md#fileresponse)
 - [FileResponseHandler](../modules.md#fileresponsehandler)

**`Default`**

`false`

#### Defined in

[types.ts:69](https://github.com/chenasraf/simple-scaffold/blob/d9508cd/src/types.ts#L69)

___

### quiet

• `Optional` **quiet**: `boolean`

Suppress output logs (Same as `verbose: 0` or `verbose: LogLevel.None`)

**`See`**

[verbose](ScaffoldConfig.md#verbose)

#### Defined in

[types.ts:75](https://github.com/chenasraf/simple-scaffold/blob/d9508cd/src/types.ts#L75)

___

### verbose

• `Optional` **verbose**: [`LogLevel`](../enums/LogLevel.md)

Determine amount of logs to display.

The values are: `0 (none) | 1 (debug) | 2 (info) | 3 (warn) | 4 (error)`. The provided level will display messages
of the same level or higher.

**`See`**

[LogLevel](../enums/LogLevel.md)

**`Default`**

`2 (info)`

#### Defined in

[types.ts:87](https://github.com/chenasraf/simple-scaffold/blob/d9508cd/src/types.ts#L87)

___

### dryRun

• `Optional` **dryRun**: `boolean`

Don't emit files. This is good for testing your scaffolds and making sure they don't fail, without having to write
actual file contents or create directories.

**`Default`**

`false`

#### Defined in

[types.ts:95](https://github.com/chenasraf/simple-scaffold/blob/d9508cd/src/types.ts#L95)

___

### helpers

• `Optional` **helpers**: `Record`\<`string`, `HelperDelegate`\>

Additional helpers to add to the template parser. Provide an object whose keys are the name of the function to add,
and the value is the helper function itself. The signature of helpers is as follows:
```typescript
(text: string, ...args: any[]) => string
```

A full example might be:

```typescript
Scaffold({
  //...
  helpers: {
    upperKebabCase: (text) => kebabCase(text).toUpperCase()
  }
})
```

Which will allow:

```
{{ upperKebabCase "my value" }}
```

To transform to:

```
MY-VALUE
```

See [DefaultHelpers](../modules.md#defaulthelpers) for a list of all the built-in available helpers.

Simple Scaffold uses Handlebars.js, so all the syntax from there is supported. See
[their docs](https://handlebarsjs.com/guide/#custom-helpers) for more information.

**`See`**

 - [DefaultHelpers](../modules.md#defaulthelpers)
 - [CaseHelpers](../modules.md#casehelpers)
 - [DateHelpers](../modules.md#datehelpers)
 - [Templates](https://chenasraf.github.io/simple-scaffold/pages/templates.html)

#### Defined in

[types.ts:137](https://github.com/chenasraf/simple-scaffold/blob/d9508cd/src/types.ts#L137)

___

### subFolderNameHelper

• `Optional` **subFolderNameHelper**: `string`

Default transformer to apply to subfolder name when using `createSubFolder: true`. Can be one of the default
capitalization helpers, or a custom one you provide to `helpers`. Defaults to `undefined`, which means no
transformation is done.

**`See`**

 - [createSubFolder](ScaffoldConfig.md#createsubfolder)
 - [CaseHelpers](../modules.md#casehelpers)
 - [DefaultHelpers](../modules.md#defaulthelpers)

#### Defined in

[types.ts:148](https://github.com/chenasraf/simple-scaffold/blob/d9508cd/src/types.ts#L148)

## Methods

### beforeWrite

▸ **beforeWrite**(`content`, `rawContent`, `outputPath`): `undefined` \| `string` \| `Buffer` \| `Promise`\<`undefined` \| `string` \| `Buffer`\>

This callback runs right before content is being written to the disk. If you supply this function, you may return
a string that represents the final content of your file, you may process the content as you see fit. For example,
you may run formatters on a file, fix output in edge-cases not supported by helpers or data, etc.

If the return value of this function is `undefined`, the original content will be used.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `content` | `Buffer` | The original template after token replacement |
| `rawContent` | `Buffer` | The original template before token replacement |
| `outputPath` | `string` | The final output path of the processed file |

#### Returns

`undefined` \| `string` \| `Buffer` \| `Promise`\<`undefined` \| `string` \| `Buffer`\>

The final output of the file
contents-only, after further modifications - or `undefined` to use the original content (i.e. `content.toString()`)

#### Defined in

[types.ts:164](https://github.com/chenasraf/simple-scaffold/blob/d9508cd/src/types.ts#L164)
