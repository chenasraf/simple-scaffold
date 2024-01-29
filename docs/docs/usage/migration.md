---
title: Migration
---

## v1.x to v2.x

### CLI option changes

- The `:template_key` syntax has been removed. You can still use `-k template_key` to achieve the
  same result.
- Several changes to how remote configs are loaded via CLI:
  - The `--github` (`-gh`) flag has been replaced by a generic `--git` (`-g`) one, which handles any
    git URL. Providing a partial GitHub path will default to trying to find the project on GitHub,
    e.g. `-g username/project`
  - The `#template_file` syntax has been removed, you may use `--config` or `-c` to tell Simple
    Scaffold which file to look for inside the git project. There is a default file priority list
    which can find the file for you if it is in one of the supported filenames.
- `verbose` can now take the names `debug`, `info`, `warn`, `error` or `none` (case insensitive) or
  as usual by using the numbering from before.
- All boolean flags no longer take a value. `-q` instead of `-q 1` or `-q true`, `-s` instead of
  `-s 1`, `-w` instead of `-w 1`, etc.

### Behavior changes

- Data is no longer auto-populated with `Name` (PascalCase) by default. You can just use the helper
  in your templates contents and file names, simply use `{{ pascalCase name }}` instead of
  `{{ Name }}`. `Name` was arbitrary and it is confusing (is it `Title Case`? `PascalCase`? only
  reading the docs can tell). Alternatively, you can inject the transformed name into your `data`
  manually using a scaffold config file, by using the Node API or by appending the data to the CLI
  invocation.

## v0.x to v1.x

In Simple Scaffold v1.0, the entire codebase was overhauled, yet usage remains mostly the same
between versions. With these notable exceptions:

- Some of the argument names have changed
- Template syntax has been improved
- The command to run Scaffold has been simplified from `new SimpleScaffold(opts).run()` to
  `SimpleScaffold(opts)`, which now returns a promise that you can await to know when the process
  has been completed.

### Argument changes

- `locals` has been renamed to `data`. The appropriate command line args have been updated as well
  to `--data` | `-d`.
- Additional options have been added to both CLI and Node interfaces. See
  [Command Line Interface (CLI) usage](https://chenasraf.github.io/simple-scaffold/docs/usage/cli)
  and [Node.js usage](https://chenasraf.github.io/simple-scaffold/docs/usage/node) for more
  information.

### Template syntax changes

Simple Scaffold still uses Handlebars.js to handle template content and file names. However, helpers
have been added to remove the need for you to pre-process the template data on simple use-cases such
as case type manipulation (converting to camel case, snake case, etc)

See the readme for the full information on how to use these helpers and which are available.
