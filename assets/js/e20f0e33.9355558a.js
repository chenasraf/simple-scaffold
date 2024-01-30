"use strict";(self.webpackChunksimple_scaffold_docs=self.webpackChunksimple_scaffold_docs||[]).push([[360],{4660:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>r,contentTitle:()=>l,default:()=>f,frontMatter:()=>t,metadata:()=>c,toc:()=>a});var s=i(1527),o=i(8672);const t={title:"Configuration Files"},l=void 0,c={id:"usage/configuration_files",title:"Configuration Files",description:"If you want to have reusable configurations which are complex and don't fit into command lines",source:"@site/docs/usage/configuration_files.md",sourceDirName:"usage",slug:"/usage/configuration_files",permalink:"/simple-scaffold/docs/usage/configuration_files",draft:!1,unlisted:!1,editUrl:"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/usage/configuration_files.md",tags:[],version:"current",frontMatter:{title:"Configuration Files"},sidebar:"docs",previous:{title:"CLI Usage",permalink:"/simple-scaffold/docs/usage/cli"},next:{title:"Examples",permalink:"/simple-scaffold/docs/usage/examples"}},r={},a=[{value:"Creating config files",id:"creating-config-files",level:2},{value:"Using a config file",id:"using-a-config-file",level:2},{value:"Supported file types",id:"supported-file-types",level:3},{value:"Git/GitHub Templates",id:"gitgithub-templates",level:3},{value:"Use In Node.js",id:"use-in-nodejs",level:2}];function d(e){const n={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",ul:"ul",...(0,o.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.p,{children:"If you want to have reusable configurations which are complex and don't fit into command lines\neasily, or just want to manage your templates easier, you can use configuration files to load your\nscaffolding configurations."}),"\n",(0,s.jsx)(n.h2,{id:"creating-config-files",children:"Creating config files"}),"\n",(0,s.jsxs)(n.p,{children:["Configuration files should be valid ",(0,s.jsx)(n.code,{children:".js"}),"/",(0,s.jsx)(n.code,{children:".mjs"}),"/",(0,s.jsx)(n.code,{children:".cjs"}),"/",(0,s.jsx)(n.code,{children:".json"})," files that contain valid Scaffold\nconfigurations."]}),"\n",(0,s.jsx)(n.p,{children:"Each file hold multiple scaffolds. Each scaffold is a key, and its value is the configuration. For\nexample:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:'module.exports = {\n  component: {\n    templates: ["templates/component"],\n    output: "src/components",\n  },\n}\n'})}),"\n",(0,s.jsxs)(n.p,{children:["The configuration contents are identical to the\n",(0,s.jsx)(n.a,{href:"https://chenasraf.github.io/simple-scaffold/docs/usage/node",children:"Node.js configuration structure"}),":"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:"interface ScaffoldConfig {\n  name: string\n  templates: string[]\n  output: FileResponse<string>\n  subdir?: boolean\n  git?: string\n  config?: string\n  key?: string\n  data?: Record<string, any>\n  overwrite?: FileResponse<boolean>\n  quiet?: boolean\n  verbose?: LogLevel\n  dryRun?: boolean\n  helpers?: Record<string, Helper>\n  subdirHelper?: DefaultHelpers | string\n  beforeWrite?(\n    content: Buffer,\n    rawContent: Buffer,\n    outputPath: string,\n  ): string | Buffer | undefined | Promise<string | Buffer | undefined>\n}\n"})}),"\n",(0,s.jsxs)(n.p,{children:["If you want to supply functions inside the configurations, you must use a ",(0,s.jsx)(n.code,{children:".js"}),"/",(0,s.jsx)(n.code,{children:".cjs"}),"/",(0,s.jsx)(n.code,{children:".mjs"})," file\nas JSON does not support non-primitives."]}),"\n",(0,s.jsxs)(n.p,{children:["A ",(0,s.jsx)(n.code,{children:".js"})," file can be just like a ",(0,s.jsx)(n.code,{children:".json"})," file, make sure to export the final configuration:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:'/** @type {import(\'simple-scaffold\').ScaffoldConfigFile} */\nmodule.exports = {\n  component: {\n    templates: ["templates/component"],\n    output: "src/components",\n  },\n}\n'})}),"\n",(0,s.jsxs)(n.p,{children:["Another feature of using a JS file is you can export a function which will be loaded with the CMD\nconfig provided to Simple Scaffold. The ",(0,s.jsx)(n.code,{children:"extra"})," key contains any values not consumed by built-in\nflags, so you can pre-process your args before outputting a config:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:'/** @type {import(\'simple-scaffold\').ScaffoldConfigFile} */\nmodule.exports = (config) => {\n  console.log("Config:", config)\n  return {\n    component: {\n      templates: ["templates/component"],\n      output: "src/components",\n    },\n  }\n}\n'})}),"\n",(0,s.jsx)(n.h2,{id:"using-a-config-file",children:"Using a config file"}),"\n",(0,s.jsxs)(n.p,{children:["Once your config is created, you can use it by providing the file name to the ",(0,s.jsx)(n.code,{children:"--config"})," (or ",(0,s.jsx)(n.code,{children:"-c"}),"\nfor brevity), optionally alongside ",(0,s.jsx)(n.code,{children:"--key"})," or ",(0,s.jsx)(n.code,{children:"-k"}),", denoting the key to use as the config object, as\nyou define in your config:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-sh",children:"simple-scaffold -c <file> -k <template_key>\n"})}),"\n",(0,s.jsx)(n.p,{children:"For example:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-sh",children:"simple-scaffold -c scaffold.json -k component MyComponentName\n"})}),"\n",(0,s.jsxs)(n.p,{children:["If you don't want to supply a template/config name (e.g. ",(0,s.jsx)(n.code,{children:"component"}),"), ",(0,s.jsx)(n.code,{children:"default"})," will be used:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:"/** @type {import('simple-scaffold').ScaffoldConfigFile} */\nmodule.exports = {\n  default: {\n    // ...\n  },\n}\n"})}),"\n",(0,s.jsx)(n.p,{children:"And then:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-sh",children:"# will use 'default' template\nsimple-scaffold -c scaffold.json MyComponentName\n"})}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:"When the filename is omitted, the following files will be tried in order:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.code,{children:"scaffold.config.*"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.code,{children:"scaffold.*"})}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["Where ",(0,s.jsx)(n.code,{children:"*"})," denotes any supported file extension, in the priority listed in\n",(0,s.jsx)(n.a,{href:"#supported-file-types",children:"Supported file types"})]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:["When the ",(0,s.jsx)(n.code,{children:"template_key"})," is ommitted, ",(0,s.jsx)(n.code,{children:"default"})," will be used as default."]}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(n.h3,{id:"supported-file-types",children:"Supported file types"}),"\n",(0,s.jsx)(n.p,{children:"Any importable file is supported, depending on your build process."}),"\n",(0,s.jsx)(n.p,{children:"Common files include:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.code,{children:"*.mjs"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.code,{children:"*.cjs"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.code,{children:"*.js"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.code,{children:"*.json"})}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"When filenames are ommited when loading configs, these are the file extensions that will be\nautomatically tried, by the specified order of priority."}),"\n",(0,s.jsxs)(n.p,{children:["Note that you might need to find the correct extension of ",(0,s.jsx)(n.code,{children:".js"}),", ",(0,s.jsx)(n.code,{children:".cjs"})," or ",(0,s.jsx)(n.code,{children:".mjs"})," depending on your\nbuild process and your package type (for example, packages with ",(0,s.jsx)(n.code,{children:'"type": "module"'})," in their\n",(0,s.jsx)(n.code,{children:"package.json"})," might be required to use ",(0,s.jsx)(n.code,{children:".mjs"}),".)"]}),"\n",(0,s.jsx)(n.h3,{id:"gitgithub-templates",children:"Git/GitHub Templates"}),"\n",(0,s.jsx)(n.p,{children:"You may specify a git or GitHub url to use remote templates."}),"\n",(0,s.jsxs)(n.p,{children:["The command line option is ",(0,s.jsx)(n.code,{children:"--git"})," or ",(0,s.jsx)(n.code,{children:"-g"}),"."]}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"You may specify a full git or HTTPS git URL, which will be tried"}),"\n",(0,s.jsx)(n.li,{children:"You may specify a git username and project if the project is on GitHub"}),"\n"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-sh",children:"# GitHub shorthand\nsimple-scaffold -g <username>/<project_name> [-c <filename>] [-k <template_key>]\n\n# Any git URL, git:// and https:// are supported\nsimple-scaffold -g git://gitlab.com/<username>/<project_name> [-c <filename>] [-k <template_key>]\nsimple-scaffold -g https://gitlab.com/<username>/<project_name>.git [-c <filename>] [-k <template_key>]\n"})}),"\n",(0,s.jsx)(n.h2,{id:"use-in-nodejs",children:"Use In Node.js"}),"\n",(0,s.jsx)(n.p,{children:"You can also start a scaffold from Node.js with a remote file or URL config."}),"\n",(0,s.jsxs)(n.p,{children:["Just use the ",(0,s.jsx)(n.code,{children:"Scaffold.fromConfig"})," function:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-ts",children:'Scaffold.fromConfig(\n  "scaffold.config.js", // file or HTTPS git URL\n  {\n    // name of the generated component\n    name: "My Component",\n    // key to load from the config\n    key: "component",\n  },\n  {\n    // other config overrides\n  },\n)\n'})})]})}function f(e={}){const{wrapper:n}={...(0,o.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(d,{...e})}):d(e)}},8672:(e,n,i)=>{i.d(n,{Z:()=>c,a:()=>l});var s=i(959);const o={},t=s.createContext(o);function l(e){const n=s.useContext(t);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:l(e.components),s.createElement(t.Provider,{value:n},e.children)}}}]);