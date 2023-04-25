In Simple Scaffold v1.0, the entire codebase was overhauled, yet usage remains mostly the same
between versions. With these notable exceptions:

- Some of the argument names have changed
- Template syntax has been improved
- The command to run Scaffold has been simplified from `new SimpleScaffold(opts).run()` to
  `SimpleScaffold(opts)`, which now returns a promise that you can await to know when the process
  has been completed.

## Argument changes

- `locals` has been renamed to `data`. The appropriate command line args have been updated as well
  to `--data` | `-d`.
- Additional options have been added to both CLI and Node interfaces. See the [readme](/README.md)
  for more information.

## Template syntax changes

Simple Scaffold still uses Handlebars.js to handle template content and file names. However, helpers
have been added to remove the need for you to pre-process the template data on simple use-cases such
as case type manipulation (converting to camel case, snake case, etc)

See the readme for the full information on how to use these helpers and which are available.
