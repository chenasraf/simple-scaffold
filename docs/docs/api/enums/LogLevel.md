---
id: "LogLevel"
title: "Enumeration: LogLevel"
sidebar_label: "LogLevel"
sidebar_position: 0
custom_edit_url: null
---

The amount of information to log when generating scaffold.
When not `None`, the selected level will be the lowest level included.

For example, level `Info` (2) will include `Info`, `Warning` and `Error`, but not `Debug`; and `Warning` will only
show `Warning` and `Error`.

**`Default`**

`2 (info)`

## Enumeration Members

### Debug

• **Debug** = ``1``

Debugging information. Very verbose and only recommended for troubleshooting.

#### Defined in

[types.ts:281](https://github.com/chenasraf/simple-scaffold/blob/3343df7/src/types.ts#L281)

___

### Error

• **Error** = ``4``

Errors, such as missing files, bad replacement token syntax, or un-writable directories.

#### Defined in

[types.ts:291](https://github.com/chenasraf/simple-scaffold/blob/3343df7/src/types.ts#L291)

___

### Info

• **Info** = ``2``

The regular level of logging. Major actions are logged to show the scaffold progress.

**`Default`**

```ts

```

#### Defined in

[types.ts:287](https://github.com/chenasraf/simple-scaffold/blob/3343df7/src/types.ts#L287)

___

### None

• **None** = ``0``

Silent output

#### Defined in

[types.ts:279](https://github.com/chenasraf/simple-scaffold/blob/3343df7/src/types.ts#L279)

___

### Warning

• **Warning** = ``3``

Warnings such as when file fails to replace token values properly in template.

#### Defined in

[types.ts:289](https://github.com/chenasraf/simple-scaffold/blob/3343df7/src/types.ts#L289)
