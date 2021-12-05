# Migrating from 0.x to 1.0

In Simple Scaffold v1.0, the entire codebase was overhauled, yet usage remains mostly the same
between versions. With these notable exceptions:

- Some of the argument names have changed
- Template syntax has been improved

## Argument changes

- `locals` has been renamed to `data`. The appropriate command line args have been updated as
  well to `--data` | `-d`.

## Template syntax changes

Simple Scaffold still uses Handlebars.js to handle template content and file names. However, helpers
have been added to remove the need for you to pre-process the template data on simple use-cases such
as case type manipulation (converting to camel case, snake case, etc)

See the readme for the full information on how to use these helpers and which are available.
