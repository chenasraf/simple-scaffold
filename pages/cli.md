## Available flags

The following is the help text from the `simple-scaffold` binary. To see this and more information
anytime, add the `-h` or `--help` flag to your call, e.g. `npx simple-scaffold@latest -h`.

```text
Usage: simple-scaffold [options]

Create structured files based on templates.

Options:

  --help|-h                       Display help information

  --name|-n                       Name to be passed to the generated files. {{name}} and
                                  {{Name}} inside contents and file names will be replaced
                                  accordingly.

  --config|-c                     Filename to load config from instead of passing
                                  arguments to CLI or using a Node.js script. You may pass a
                                  JSON or JS file, with a relative or absolute path.

  --output|-o                     Path to output to. If --create-sub-folder is enabled,
                                  the subfolder will be created inside this path.
                                  (default: current dir)

  --templates|-t                  Template files to use as input. You may provide multiple
                                  files, each of which can be a relative or absolute path, or a
                                  glob pattern for multiple file matching easily.

  --overwrite|-w                  Enable to override output files, even if they already
                                  exist. (default: false)

  --data|-d                       Add custom data to the templates. By default, only your
                                  app name is included.

  --append-data|-D                Append additional custom data to the templates, which
                                  will overwrite --data, using an alternate syntax, which is
                                  easier to use with CLI: -D key1=string -D key2:=raw

  --create-sub-folder|-s          Create subfolder with the input name
                                  (default: false)

  --sub-folder-name-helper|-sh    Default helper to apply to subfolder name when using
                                  `--create-sub-folder true`.

  --quiet|-q                      Suppress output logs (Same as --verbose 0)
                                  (default: false)

  --verbose|-v                    Determine amount of logs to display. The values are:
                                  0 (none) | 1 (debug) | 2 (info) | 3 (warn) | 4
                                  (error). The provided level will display messages of
                                  the same level or higher. (default:
                                  2)

  --dry-run|-dr                   Don't emit files. This is good for testing your
                                  scaffolds and making sure they don't fail, without having to
                                  write actual file contents or create directories.
                                  (default: false)
```

> See
> [Configuration Files](https://chenasraf.githun.io/simple-scaffold/pages/docs/docs/configuration_files.md)
> for organizing multiple scaffold types into easy-to-maintain files

You can also add this as a script in your `package.json`:

```json
{
  "scripts": {
    "scaffold": "npx simple-scaffold@latest -t scaffolds/component/**/* -o src/components -d '{\"myProp\": \"propName\", \"myVal\": 123}'"
  }
}
```