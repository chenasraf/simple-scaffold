const path = require("path")

/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
  name: "Simple Scaffold",
  entryPoints: ["src/index.ts"],
  includeVersion: true,
  categorizeByGroup: false,
  sort: ["visibility"],
  categoryOrder: ["Main", "*"],
  media: "media",
  githubPages: true,
  entryPointStrategy: "expand",
  out: "docs",
  excludePrivate: true,
  excludeProtected: true,
  excludeInternal: true,
  gaID: "GTM-KHQS9TQ",
  validation: {
    invalidLink: true,
  },
  plugin: ["@knodes/typedoc-plugin-pages"],
  customCss: "src/docs.css",
  options: "typedoc.config.js",
  logLevel: "Verbose",
  pluginPages: {
    logLevel: "Verbose",
    pages: [
      {
        name: "Configuration",
        source: "README.md",
        childrenDir: path.join(process.cwd(), "pages"),
        childrenOutputDir: "./",
        children: [
          {
            name: "CLI usage",
            source: "cli.md",
          },
          {
            name: "Node.js usage",
            source: "node.md",
          },
          {
            name: "Templates",
            source: "templates.md",
          },
          {
            name: "Configuration Files",
            source: "configuration_files.md",
          },
          {
            name: "Migrating v0.x to v1.x",
            source: "migration.md",
          },
        ],
      },
      {
        name: "Changelog",
        source: "./CHANGELOG.md",
      },
    ],
  },
}
