<h1 align="center">Simple Scaffold</h1>

<h2 align="center">

[GitHub](https://github.com/chenasraf/simple-scaffold) |
[Documentation](https://chenasraf.github.io/simple-scaffold) |
[NPM](https://npmjs.com/package/simple-scaffold) | [casraf.dev](https://casraf.dev)

![version](https://img.shields.io/github/package-json/v/chenasraf/simple-scaffold/master?label=version)
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

![sample animation](media/intro.gif)

</div>

---

## Quick Start

### Local Templates

The fastest way to get started is to use `npx` to immediately start a scaffold process.

Prepare any templates you want to use - for example, in the directory `templates/component`; and use
that in the CLI args. Here is a simple example file:

`templates/component/{{ pascalName name }}.tsx`

```tsx
// Created: {{ now | 'yyyy-MM-dd' }}
import React from 'react'

export default {{pascalCase name}}: React.FC = (props) => {
  return (
    <div className="{{camelCase name}}">{{pascalCase name}} Component</div>
  )
}
```

To generate the template output, run:

```shell
# generate single component
npx simple-scaffold@latest \
  -t templates/component -o src/components PageWrapper
```

This will immediately create the following file: `src/components/PageWrapper.tsx`

```tsx
// Created: 2077/01/01
import React from 'react'

export default PageWrapper: React.FC = (props) => {
  return (
    <div className="pageWrapper">PageWrapper Component</div>
  )
}
```

### Remote Templates

Another quick way to start is to re-use someone else's (or your own) work using a template
repository.

Here is an example for loading the example component templates in this very repository:

```shell
npx simple-scaffold@latest \
  -gh chenasraf/simple-scaffold#examples/test-input/scaffold.config.js:component \
  PageWrapper

# equivalent to:
npx simple-scaffold@latest \
  -c https://github.com/chenasraf/simple-scaffold.git#examples/test-input/scaffold.config.js:component \
  PageWrapper
```

When template name (`:component`) is omitted, `default` is used.

See more at the [CLI documentation](https://chenasraf.github.io/simple-scaffold/pages/cli.html)

## Documentation

See full documentation [here](https://chenasraf.github.io/simple-scaffold).

- [Command Line Interface (CLI) usage](https://chenasraf.github.io/simple-scaffold/pages/cli.html)
- [Node.js usage](https://chenasraf.github.io/simple-scaffold/pages/node.html)
- [Templates](https://chenasraf.github.io/simple-scaffold/pages/templates.html)
- [Configuration Files](https://chenasraf.github.io/simple-scaffold/pages/configuration_files.html)
- [Migrating v0.x to v1.x](https://chenasraf.github.io/simple-scaffold/pages/migration.html)

## Contributing

I am developing this package on my free time, so any support, whether code, issues, or just stars is
very helpful to sustaining its life. If you are feeling incredibly generous and would like to donate
just a small amount to help sustain this project, I would be very very thankful!

<a href='https://ko-fi.com/casraf' target='_blank'>
  <img height='36' style='border:0px;height:36px;'
    src='https://cdn.ko-fi.com/cdn/kofi1.png?v=3'
    alt='Buy Me a Coffee at ko-fi.com' />
</a>

I welcome any issues or pull requests on GitHub. If you find a bug, or would like a new feature,
don't hesitate to open an appropriate issue and I will do my best to reply promptly.

If you are a developer and want to contribute code, here are some starting tips:

1. Fork this repository
2. Run `yarn install`
3. Run `yarn dev` to start file watch mode
4. Make any changes you would like
5. Create tests for your changes
6. Update the relevant documentation (readme, code comments, type comments)
7. Create a PR on upstream

Some tips on getting around the code:

- Use `yarn dev` for development - it runs TypeScript compile in watch mode, allowing you to make
  changes and immediately be able to try them using `yarn cmd`.
- Use `yarn build` to build the output once
- Use `yarn test` to run tests
- Use `yarn cmd` to use the CLI feature of Simple Scaffold from within the root directory, enabling
  you to test different behaviors. See `yarn cmd -h` for more information.

  > This requires an updated build, and does not trigger one itself. From here you have several
  > options:
  >
  > - Run `yarn dev` to watch for file changes and build automatically
  > - Run `yarn build` before running this to trigger a one-time build
  > - Run `yarn build-cmd` which triggers a build right before running `yarn cmd` automatically with
  >   the rest of the given arguments.

- Use `yarn build-docs` to build the documentation once
- Use `yarn watch-docs` to start docs in watch mode
- To see the documentation, currently you have to serve the directory yourself with a static web
  server (like node's built in serve, VS code's "Go Live" mode, etc)
