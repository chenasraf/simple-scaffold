<h1 align="center">Simple Scaffold</h1>

<h2 align="center">

[GitHub](https://github.com/chenasraf/simple-scaffold) |
[Documentation](https://chenasraf.github.io/simple-scaffold) |
[NPM](https://npmjs.com/package/simple-scaffold) | [casraf.dev](https://casraf.dev)

![latest](https://img.shields.io/github/package-json/v/chenasraf/simple-scaffold/master?label=latest)
![pre](https://img.shields.io/github/package-json/v/chenasraf/simple-scaffold/pre?label=pre)
![build](https://img.shields.io/github/actions/workflow/status/chenasraf/simple-scaffold/release.yml?branch=master)

</h2>

Looking to streamline your workflow and get your projects up and running quickly? Look no further
than Simple Scaffold - the easy-to-use NPM package that simplifies the process of organizing and
copying your commonly-created files.

With its agnostic and un-opinionated approach, Simple Scaffold can handle anything from a few simple
files to an entire app boilerplate setup. Plus, with the power of **Handlebars.js** syntax, you can
easily replace custom data and personalize your files to fit your exact needs. But that's not all -
you can also use it to loop through data, use conditions, and write custom functions using helpers.

Don't waste any more time manually copying and pasting files - let Simple Scaffold do the heavy
lifting for you and start building your projects faster and more efficiently today!

<div align="center">

![Intro](https://chenasraf.github.io/simple-scaffold/img/intro.gif)

</div>

---

## Quick Start

### Local Templates

The fastest way to get started is to use `npx` to immediately start a scaffold process.

Prepare any templates you want to use - for example, in the directory `templates/component`; and use
that in the CLI args. Here is a simple example file:

Simple Scaffold will maintain any file and directory structure you try to generate.

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

To generate the template output, run:

```sh
# generate single component
$ npx simple-scaffold@latest \
  -t templates/component -o src/components PageWrapper
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

### Configuration Files

You can also use a config file to more easily maintain all your scaffold definitions.

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
$ npx simple-scaffold@latest -c scaffold.config.js PageWrapper
```

This will allow you to avoid needing to remember which configs are needed or to store them in a
1-liner in `packqge.json` which can get pretty long and messy, which is harder to maintain.

Also, this allows you to define more complex scaffolds with logic without having to use the Node.js
API directly. (Of course you always have the option to still do so if you wish)

See more at the [CLI documentation](https://chenasraf.github.io/simple-scaffold/docs/usage/cli) and
[Configuration Files](https://chenasraf.github.io/simple-scaffold/docs/usage/configuration_files).

### Remote Configurations

Another quick way to start is to re-use someone else's (or your own) work using a template
repository.

A remote config can be loaded in one of these ways:

- If it's on GitHub, you can use `-g user/repository_name`
- If it's on another git server (such as GitLab), you can use
  `-g https://example.com/user/repository_name.git`

Configurations can hold multiple scaffold groups. Each group can be accessed using its key by
supplying the `--key` or `-k` argument, like so:

```sh
-g user/repository_name -c scaffold.js -k key_name`.
```

Here is an example for loading the example component templates in this very repository:

```sh
$ npx simple-scaffold@latest \
  -g chenasraf/simple-scaffold \
  -k component \
  PageWrapper

# equivalent to:
$ npx simple-scaffold@latest \
  -g https://github.com/chenasraf/simple-scaffold.git \
  -c scaffold.config.js \
  -k component \
  PageWrapper
```

When template name (`-k component`) is omitted, `default` is used.

See more at the [CLI documentation](https://chenasraf.github.io/simple-scaffold/docs/usage/cli) and
[Configuration Files](https://chenasraf.github.io/simple-scaffold/docs/usage/configuration_files).

## Documentation

See full documentation [here](https://chenasraf.github.io/simple-scaffold).

- [Command Line Interface (CLI) usage](https://chenasraf.github.io/simple-scaffold/docs/usage/cli)
- [Node.js usage](https://chenasraf.github.io/simple-scaffold/docs/usage/node)
- [Templates](https://chenasraf.github.io/simple-scaffold/docs/usage/templates)
- [Configuration Files](https://chenasraf.github.io/simple-scaffold/docs/usage/configuration_files)
- [Migration](https://chenasraf.github.io/simple-scaffold/docs/usage/migration)

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

- Use `pnpm dev` for development - it runs TypeScript compile in watch mode, allowing you to make
  changes and immediately be able to try them using `pnpm cmd`.
- Use `pnpm build` to build the output once
- Use `pnpm test` to run tests
- Use `pnpm cmd` to use the CLI feature of Simple Scaffold from within the root directory, enabling
  you to test different behaviors. See `pnpm cmd -h` for more information.

  > This requires an updated build, and does not trigger one itself. From here you have several
  > options:
  >
  > - Run `pnpm dev` to watch for file changes and build automatically
  > - Run `pnpm build` before running this to trigger a one-time build
  > - Run `pnpm build-cmd` which triggers a build right before running `pnpm cmd` automatically with
  >   the rest of the given arguments.

- Use `pnpm build-docs` to build the documentation once
- Use `pnpm watch-docs` to start docs in watch mode
- To see the documentation, currently you have to serve the directory yourself with a static web
  server (like node's built in serve, VS code's "Go Live" mode, etc)
