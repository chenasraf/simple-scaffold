import { themes as prismThemes } from "prism-react-renderer"
import type { Config } from "@docusaurus/types"
import type * as Preset from "@docusaurus/preset-classic"

const config: Config = {
  title: "Simple Scaffold",
  tagline: "Generate any file structure - from single components to entire app boilerplates, with a single command.",
  favicon: "img/favicon.svg",

  // Set the production url of your site here
  url: "https://chenasraf.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/simple-scaffold",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "chenasraf", // Usually your GitHub org/user name.
  projectName: "simple-scaffold", // Usually your repo name.

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  plugins: [
    [
      "docusaurus-plugin-typedoc",

      // Plugin / TypeDoc options
      {
        entryPoints: ["../src/index.ts"],
        tsconfig: "../tsconfig.json",

        // typedoc options
        watch: process.env.NODE_ENV === "development",
        excludePrivate: true,
        excludeProtected: true,
        excludeInternal: true,
        // includeVersion: true,
        categorizeByGroup: false,
        sort: ["visibility"],
        categoryOrder: ["Main", "*"],
        media: "media",
        entryPointStrategy: "expand",
        validation: {
          invalidLink: true,
        },
      },
    ],
  ],

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/chenasraf/simple-scaffold/blob/master/docs",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
        googleTagManager: {
          containerId: "GTM-KHQS9TQ",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "Simple Scaffold",
      logo: {
        alt: "Simple Scaffold",
        src: "img/logo.svg",
      },
      items: [
        {
          position: "left",
          type: "docSidebar",
          sidebarId: "api",
          label: "API",
          to: "docs/api",
        },
        {
          position: "left",
          type: "docSidebar",
          sidebarId: "usage",
          label: "Usage",
          to: "docs/usage",
        },
        // {
        //   position: "left",
        //   type: "docSidebar",
        //   sidebarId: "docs",
        // },
        // {
        //   label: "API",
        //   href: "/docs/api",
        //   position: "left",
        // },
        // {
        //   label: "Usage",
        //   href: "/docs/usage",
        //   position: "left",
        // },
        {
          href: "https://npmjs.com/package/simple-scaffold",
          label: "NPM",
          position: "right",
        },
        {
          href: "https://github.com/chenasraf/simple-scaffold",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Tutorial",
              to: "/docs/intro",
            },
          ],
        },
        {
          title: "More from @casraf",
          items: [
            {
              label: "Massarg - CLI Argument Parser",
              href: "https://chenasraf.github.io/massarg",
            },
            {
              label: "Website",
              href: "https://casraf.dev",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "npm",
              href: "https://npmjs.com/package/simple-scaffold",
            },
            {
              label: "GitHub",
              href: "https://github.com/chenasraf/simple-scaffold",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Chen Asraf. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
}

export default config
