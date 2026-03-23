<p align="center">
  <img src="https://chenasraf.github.io//simple-scaffold/img/logo-lg.png" alt="Logo" />
</p>

<h2 align="center">

[GitHub](https://github.com/chenasraf/simple-scaffold) |
[Documentation](https://chenasraf.github.io/simple-scaffold) |
[NPM](https://npmjs.com/package/simple-scaffold) | [casraf.dev](https://casraf.dev)

![master](https://img.shields.io/github/package-json/v/chenasraf/simple-scaffold/master?label=master)
![build](https://img.shields.io/github/actions/workflow/status/chenasraf/simple-scaffold/release.yml?branch=master)

</h2>

Simple Scaffold is a file scaffolding tool. You define templates once, then generate files from them whenever you need — whether it's a single component or an entire app boilerplate.

Templates use **Handlebars.js** syntax, so you can inject data, loop over lists, use conditionals, and write custom helpers. It works as a CLI or as a Node.js library, and it doesn't care what kind of files you're generating.

<div align="center">

![Intro](https://chenasraf.github.io/simple-scaffold/img/intro.gif)

</div>

---

## Documentation

See full documentation [here](https://chenasraf.github.io/simple-scaffold).

- [Command Line Interface (CLI) usage](https://chenasraf.github.io/simple-scaffold/docs/usage/cli)
- [Node.js usage](https://chenasraf.github.io/simple-scaffold/docs/usage/node)
- [Templates](https://chenasraf.github.io/simple-scaffold/docs/usage/templates)
- [Configuration Files](https://chenasraf.github.io/simple-scaffold/docs/usage/configuration_files)
- [Migration](https://chenasraf.github.io/simple-scaffold/docs/usage/migration)

## Getting Started

### Cheat Sheet

A quick rundown of common usage scenarios:

- Remote template config file on GitHub:

  ```sh
  npx simple-scaffold -g username/repository -c scaffold.js -k component NewComponentName
  ```

- Local template config file:

  ```sh
  npx simple-scaffold -c scaffold.js -k component NewComponentName
  ```

- Local one-time usage:

  ```sh
  npx simple-scaffold -t templates/component -o src/components NewComponentName
  ```

### Remote Configurations

The fastest way to get started is to is to re-use someone else's (or your own) work using a template
repository.

A remote config can be loaded in one of these ways:

- For templates hosted on GitHub, the syntax is `-g user/repository_name`
- For other Git platforms like GitLab, use `-g https://example.com/user/repository_name.git`

These remote configurations support multiple scaffold groups, which can be specified using the
`--key` or `-k` argument:

```sh
$ npx simple-scaffold \
  -g chenasraf/simple-scaffold \
  -k component \
  PageWrapper

# equivalent to:
$ npx simple-scaffold \
  -g https://github.com/chenasraf/simple-scaffold.git \
  -c scaffold.config.js \
  -k component \
  PageWrapper
```

By default, the template name is set to `default` when the `--key` option is not provided.

See information about each option and flag using the `--help` flag, or read the
[CLI documentation](https://chenasraf.github.io/simple-scaffold/docs/usage/cli). For information
about how configuration files work, [see below](#configuration-files).

### Configuration Files

You can use a config file to more easily maintain all your scaffold definitions.

`scaffold.config.js`

```js
module.exports = {
  // use "default" to avoid needing to specify key
  // in this case the key is "component"
  component: {
    templates: ["templates/component"],
    output: "src/components",
    data: {
      // ...
    },
  },
}
```

Then call your scaffold like this:

```sh
$ npx simple-scaffold -c scaffold.config.js PageWrapper
```

This will allow you to avoid needing to remember which configs are needed or to store them in a
one-liner in `package.json` which can get pretty long and messy, and harder to maintain.

Also, this allows you to define more complex scaffolds with logic without having to use the Node.js
API directly. (Of course you always have the option to still do so if you wish)

More information can be found at the
[Configuration Files documentation](https://chenasraf.github.io/simple-scaffold/docs/usage/configuration_files).

### Templates Structure

Templates are **any file** in the a directory given to `--templates`.

Simple Scaffold will maintain any file and directory structure you try to generate, while replacing
any tokens such as `{{ name }}` or other custom-data using
[Handlebars.js](https://handlebarsjs.com/).

`templates/component/{{ pascalName name }}.tsx`

```tsx
// Created: {{ now 'yyyy-MM-dd' }}
import React from 'react'

export default {{pascalCase name}}: React.FC = (props) => {
  return (
    <div className="{{camelCase name}}">{{pascalCase name}} Component</div>
  )
}
```

To generate the template output once without saving a configuration file, run:

```sh
# generate single component
$ npx simple-scaffold \
  -t templates/component \
  -o src/components \
  PageWrapper
```

This will immediately create the following file: `src/components/PageWrapper.tsx`

```tsx
// Created: 2077-01-01
import React from 'react'

export default PageWrapper: React.FC = (props) => {
  return (
    <div className="pageWrapper">PageWrapper Component</div>
  )
}
```

## Contributing

I am developing this package on my free time, so any support, whether code, issues, or just stars is
very helpful to sustaining its life. If you are feeling incredibly generous and would like to donate
just a small amount to help sustain this project, I would be very very thankful!

<a href='https://ko-fi.com/casraf' target='_blank'>
  <img
    height='36'
    src='https://cdn.ko-fi.com/cdn/kofi1.png?v=3'
    alt='Buy Me a Coffee at ko-fi.com' 
  />
</a>

I welcome any issues or pull requests on GitHub. If you find a bug, or would like a new feature,
don't hesitate to open an appropriate issue and I will do my best to reply promptly.

If you are a developer and want to contribute code, here are some starting tips:

1. Fork this repository
2. Run `pnpm install`
3. Run `pnpm dev` to start file watch mode
4. Make any changes you would like
5. Create tests for your changes
6. Update the relevant documentation (readme, code comments, type comments)
7. Create a PR on upstream

Some tips on getting around the code:

- Use `pnpm cmd` to use the CLI feature of Simple Scaffold from within the root directory, enabling
  you to test different behaviors. See `pnpm cmd -h` for more information.
- Use `pnpm test` to run tests
- Use `pnpm docs:build` to build the documentation once
- Use `pnpm docs:watch` to start docs in watch mode
- Use `pnpm build` to build the output
