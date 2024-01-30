"use strict";(self.webpackChunksimple_scaffold_docs=self.webpackChunksimple_scaffold_docs||[]).push([[306],{5513:(e,s,l)=>{l.r(s),l.d(s,{assets:()=>t,contentTitle:()=>r,default:()=>o,frontMatter:()=>i,metadata:()=>c,toc:()=>h});var n=l(1527),d=l(8672);const i={id:"modules",title:"simple-scaffold",sidebar_label:"Exports",sidebar_position:.5,custom_edit_url:null},r=void 0,c={id:"api/modules",title:"simple-scaffold",description:"Interfaces",source:"@site/docs/api/modules.md",sourceDirName:"api",slug:"/api/modules",permalink:"/simple-scaffold/docs/api/modules",draft:!1,unlisted:!1,editUrl:null,tags:[],version:"current",sidebarPosition:.5,frontMatter:{id:"modules",title:"simple-scaffold",sidebar_label:"Exports",sidebar_position:.5,custom_edit_url:null},sidebar:"docs",previous:{title:"Readme",permalink:"/simple-scaffold/docs/api/"},next:{title:"ScaffoldCmdConfig",permalink:"/simple-scaffold/docs/api/interfaces/ScaffoldCmdConfig"}},t={},h=[{value:"Interfaces",id:"interfaces",level:2},{value:"Main",id:"main",level:2},{value:"Scaffold",id:"scaffold",level:3},{value:"Create files",id:"create-files",level:4},{value:"Helpers",id:"helpers",level:4},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Config",id:"config",level:2},{value:"FileResponseHandler",id:"fileresponsehandler",level:3},{value:"Type parameters",id:"type-parameters",level:4},{value:"Type declaration",id:"type-declaration",level:4},{value:"Parameters",id:"parameters-1",level:5},{value:"Returns",id:"returns-1",level:5},{value:"Defined in",id:"defined-in-1",level:4},{value:"FileResponse",id:"fileresponse",level:3},{value:"Type parameters",id:"type-parameters-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"Helpers",id:"helpers-1",level:2},{value:"CaseHelpers",id:"casehelpers",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"DateHelpers",id:"datehelpers",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"DefaultHelpers",id:"defaulthelpers",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"Helper",id:"helper",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"Logging",id:"logging",level:2},{value:"LogLevel",id:"loglevel",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"Other",id:"other",level:2},{value:"LogLevel",id:"loglevel-1",level:3},{value:"Type declaration",id:"type-declaration-1",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"ScaffoldConfigMap",id:"scaffoldconfigmap",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"ScaffoldConfigFile",id:"scaffoldconfigfile",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"default",id:"default",level:3}];function a(e){const s={a:"a",code:"code",h2:"h2",h3:"h3",h4:"h4",h5:"h5",hr:"hr",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,d.a)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(s.h2,{id:"interfaces",children:"Interfaces"}),"\n",(0,n.jsxs)(s.ul,{children:["\n",(0,n.jsx)(s.li,{children:(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/interfaces/ScaffoldConfig",children:"ScaffoldConfig"})}),"\n",(0,n.jsx)(s.li,{children:(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/interfaces/ScaffoldCmdConfig",children:"ScaffoldCmdConfig"})}),"\n"]}),"\n",(0,n.jsx)(s.h2,{id:"main",children:"Main"}),"\n",(0,n.jsx)(s.h3,{id:"scaffold",children:"Scaffold"}),"\n",(0,n.jsxs)(s.p,{children:["\u25b8 ",(0,n.jsx)(s.strong,{children:"Scaffold"}),"(",(0,n.jsx)(s.code,{children:"config"}),"): ",(0,n.jsx)(s.code,{children:"Promise"}),"<",(0,n.jsx)(s.code,{children:"void"}),">"]}),"\n",(0,n.jsxs)(s.p,{children:["Create a scaffold using given ",(0,n.jsx)(s.code,{children:"options"}),"."]}),"\n",(0,n.jsx)(s.h4,{id:"create-files",children:"Create files"}),"\n",(0,n.jsxs)(s.p,{children:["To create a file structure to output, use any directory and file structure you would like.\nInside folder names, file names or file contents, you may place ",(0,n.jsx)(s.code,{children:"{{ var }}"})," where ",(0,n.jsx)(s.code,{children:"var"})," is either\n",(0,n.jsx)(s.code,{children:"name"})," which is the scaffold name you provided or one of the keys you provided in the ",(0,n.jsx)(s.code,{children:"data"})," option."]}),"\n",(0,n.jsx)(s.p,{children:"The contents and names will be replaced with the transformed values so you can use your original structure as a\nboilerplate for other projects, components, modules, or even single files."}),"\n",(0,n.jsxs)(s.p,{children:["The files will maintain their structure, starting from the directory containing the template (or the template itself\nif it is already a directory), and will output from that directory into the directory defined by ",(0,n.jsx)(s.code,{children:"config.output"}),"."]}),"\n",(0,n.jsx)(s.h4,{id:"helpers",children:"Helpers"}),"\n",(0,n.jsxs)(s.p,{children:["Helpers are functions you can use to transform your ",(0,n.jsx)(s.code,{children:"{{ var }}"})," contents into other values without having to\npre-define the data and use a duplicated key."]}),"\n",(0,n.jsxs)(s.p,{children:["Any functions you provide in ",(0,n.jsx)(s.code,{children:"helpers"})," option will also be available to you to make custom formatting as you see fit\n(for example, formatting a date)"]}),"\n",(0,n.jsxs)(s.p,{children:["For available default values, see ",(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/modules#defaulthelpers",children:"DefaultHelpers"}),"."]}),"\n",(0,n.jsx)(s.h4,{id:"parameters",children:"Parameters"}),"\n",(0,n.jsxs)(s.table,{children:[(0,n.jsx)(s.thead,{children:(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.th,{style:{textAlign:"left"},children:"Name"}),(0,n.jsx)(s.th,{style:{textAlign:"left"},children:"Type"}),(0,n.jsx)(s.th,{style:{textAlign:"left"},children:"Description"})]})}),(0,n.jsx)(s.tbody,{children:(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{style:{textAlign:"left"},children:(0,n.jsx)(s.code,{children:"config"})}),(0,n.jsx)(s.td,{style:{textAlign:"left"},children:(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/interfaces/ScaffoldConfig",children:(0,n.jsx)(s.code,{children:"ScaffoldConfig"})})}),(0,n.jsx)(s.td,{style:{textAlign:"left"},children:"The main configuration object"})]})})]}),"\n",(0,n.jsx)(s.h4,{id:"returns",children:"Returns"}),"\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.code,{children:"Promise"}),"<",(0,n.jsx)(s.code,{children:"void"}),">"]}),"\n",(0,n.jsx)(s.p,{children:"A promise that resolves when the scaffold is complete"}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.strong,{children:(0,n.jsx)(s.code,{children:"See"})})}),"\n",(0,n.jsxs)(s.ul,{children:["\n",(0,n.jsx)(s.li,{children:(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/modules#defaulthelpers",children:"DefaultHelpers"})}),"\n",(0,n.jsx)(s.li,{children:(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/modules#casehelpers",children:"CaseHelpers"})}),"\n",(0,n.jsx)(s.li,{children:(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/modules#datehelpers",children:"DateHelpers"})}),"\n"]}),"\n",(0,n.jsx)(s.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.a,{href:"https://github.com/chenasraf/simple-scaffold/blob/548b710/src/scaffold.ts#L55",children:"scaffold.ts:55"})}),"\n",(0,n.jsx)(s.h2,{id:"config",children:"Config"}),"\n",(0,n.jsx)(s.h3,{id:"fileresponsehandler",children:"FileResponseHandler"}),"\n",(0,n.jsxs)(s.p,{children:["\u01ac ",(0,n.jsx)(s.strong,{children:"FileResponseHandler"}),"<",(0,n.jsx)(s.code,{children:"T"}),">: (",(0,n.jsx)(s.code,{children:"fullPath"}),": ",(0,n.jsx)(s.code,{children:"string"}),", ",(0,n.jsx)(s.code,{children:"basedir"}),": ",(0,n.jsx)(s.code,{children:"string"}),", ",(0,n.jsx)(s.code,{children:"basename"}),": ",(0,n.jsx)(s.code,{children:"string"}),") => ",(0,n.jsx)(s.code,{children:"T"})]}),"\n",(0,n.jsxs)(s.p,{children:["A function that takes path information about file, and returns a value of type ",(0,n.jsx)(s.code,{children:"T"})]}),"\n",(0,n.jsx)(s.h4,{id:"type-parameters",children:"Type parameters"}),"\n",(0,n.jsxs)(s.table,{children:[(0,n.jsx)(s.thead,{children:(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.th,{style:{textAlign:"left"},children:"Name"}),(0,n.jsx)(s.th,{style:{textAlign:"left"},children:"Description"})]})}),(0,n.jsx)(s.tbody,{children:(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{style:{textAlign:"left"},children:(0,n.jsx)(s.code,{children:"T"})}),(0,n.jsx)(s.td,{style:{textAlign:"left"},children:"The return type for the function"})]})})]}),"\n",(0,n.jsx)(s.h4,{id:"type-declaration",children:"Type declaration"}),"\n",(0,n.jsxs)(s.p,{children:["\u25b8 (",(0,n.jsx)(s.code,{children:"fullPath"}),", ",(0,n.jsx)(s.code,{children:"basedir"}),", ",(0,n.jsx)(s.code,{children:"basename"}),"): ",(0,n.jsx)(s.code,{children:"T"})]}),"\n",(0,n.jsx)(s.h5,{id:"parameters-1",children:"Parameters"}),"\n",(0,n.jsxs)(s.table,{children:[(0,n.jsx)(s.thead,{children:(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.th,{style:{textAlign:"left"},children:"Name"}),(0,n.jsx)(s.th,{style:{textAlign:"left"},children:"Type"}),(0,n.jsx)(s.th,{style:{textAlign:"left"},children:"Description"})]})}),(0,n.jsxs)(s.tbody,{children:[(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{style:{textAlign:"left"},children:(0,n.jsx)(s.code,{children:"fullPath"})}),(0,n.jsx)(s.td,{style:{textAlign:"left"},children:(0,n.jsx)(s.code,{children:"string"})}),(0,n.jsx)(s.td,{style:{textAlign:"left"},children:"The full path of the current file"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{style:{textAlign:"left"},children:(0,n.jsx)(s.code,{children:"basedir"})}),(0,n.jsx)(s.td,{style:{textAlign:"left"},children:(0,n.jsx)(s.code,{children:"string"})}),(0,n.jsx)(s.td,{style:{textAlign:"left"},children:"The directory containing the current file"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{style:{textAlign:"left"},children:(0,n.jsx)(s.code,{children:"basename"})}),(0,n.jsx)(s.td,{style:{textAlign:"left"},children:(0,n.jsx)(s.code,{children:"string"})}),(0,n.jsx)(s.td,{style:{textAlign:"left"},children:"The name of the file"})]})]})]}),"\n",(0,n.jsx)(s.h5,{id:"returns-1",children:"Returns"}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.code,{children:"T"})}),"\n",(0,n.jsx)(s.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.a,{href:"https://github.com/chenasraf/simple-scaffold/blob/548b710/src/types.ts#L305",children:"types.ts:305"})}),"\n",(0,n.jsx)(s.hr,{}),"\n",(0,n.jsx)(s.h3,{id:"fileresponse",children:"FileResponse"}),"\n",(0,n.jsxs)(s.p,{children:["\u01ac ",(0,n.jsx)(s.strong,{children:"FileResponse"}),"<",(0,n.jsx)(s.code,{children:"T"}),">: ",(0,n.jsx)(s.code,{children:"T"})," | ",(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/modules#fileresponsehandler",children:(0,n.jsx)(s.code,{children:"FileResponseHandler"})}),"<",(0,n.jsx)(s.code,{children:"T"}),">"]}),"\n",(0,n.jsx)(s.p,{children:"Represents a response for file path information.\nCan either be:"}),"\n",(0,n.jsxs)(s.ol,{children:["\n",(0,n.jsxs)(s.li,{children:[(0,n.jsx)(s.code,{children:"T"})," - static value"]}),"\n",(0,n.jsxs)(s.li,{children:["A function with the following signature which returns ",(0,n.jsx)(s.code,{children:"T"}),":","\n",(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{className:"language-typescript",children:"(fullPath: string, basedir: string, basename: string) => T\n"})}),"\n"]}),"\n"]}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.strong,{children:(0,n.jsx)(s.code,{children:"See"})})}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/modules#fileresponsehandler",children:"FileResponseHandler"})}),"\n",(0,n.jsx)(s.h4,{id:"type-parameters-1",children:"Type parameters"}),"\n",(0,n.jsxs)(s.table,{children:[(0,n.jsx)(s.thead,{children:(0,n.jsx)(s.tr,{children:(0,n.jsx)(s.th,{style:{textAlign:"left"},children:"Name"})})}),(0,n.jsx)(s.tbody,{children:(0,n.jsx)(s.tr,{children:(0,n.jsx)(s.td,{style:{textAlign:"left"},children:(0,n.jsx)(s.code,{children:"T"})})})})]}),"\n",(0,n.jsx)(s.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.a,{href:"https://github.com/chenasraf/simple-scaffold/blob/548b710/src/types.ts#L321",children:"types.ts:321"})}),"\n",(0,n.jsx)(s.h2,{id:"helpers-1",children:"Helpers"}),"\n",(0,n.jsx)(s.h3,{id:"casehelpers",children:"CaseHelpers"}),"\n",(0,n.jsxs)(s.p,{children:["\u01ac ",(0,n.jsx)(s.strong,{children:"CaseHelpers"}),": ",(0,n.jsx)(s.code,{children:'"camelCase"'})," | ",(0,n.jsx)(s.code,{children:'"hyphenCase"'})," | ",(0,n.jsx)(s.code,{children:'"kebabCase"'})," | ",(0,n.jsx)(s.code,{children:'"lowerCase"'})," | ",(0,n.jsx)(s.code,{children:'"pascalCase"'})," | ",(0,n.jsx)(s.code,{children:'"snakeCase"'})," | ",(0,n.jsx)(s.code,{children:'"startCase"'})," | ",(0,n.jsx)(s.code,{children:'"upperCase"'})]}),"\n",(0,n.jsx)(s.p,{children:"The names of the available helper functions that relate to text capitalization."}),"\n",(0,n.jsxs)(s.p,{children:["These are available for ",(0,n.jsx)(s.code,{children:"subfolderNameHelper"}),"."]}),"\n",(0,n.jsxs)(s.table,{children:[(0,n.jsx)(s.thead,{children:(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.th,{children:"Helper name"}),(0,n.jsx)(s.th,{children:"Example code"}),(0,n.jsx)(s.th,{children:"Example output"})]})}),(0,n.jsxs)(s.tbody,{children:[(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:"[None]"}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"{{ name }}"})}),(0,n.jsx)(s.td,{children:"my name"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"camelCase"})}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"{{ camelCase name }}"})}),(0,n.jsx)(s.td,{children:"myName"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"snakeCase"})}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"{{ snakeCase name }}"})}),(0,n.jsx)(s.td,{children:"my_name"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"startCase"})}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"{{ startCase name }}"})}),(0,n.jsx)(s.td,{children:"My Name"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"kebabCase"})}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"{{ kebabCase name }}"})}),(0,n.jsx)(s.td,{children:"my-name"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"hyphenCase"})}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"{{ hyphenCase name }}"})}),(0,n.jsx)(s.td,{children:"my-name"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"pascalCase"})}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"{{ pascalCase name }}"})}),(0,n.jsx)(s.td,{children:"MyName"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"upperCase"})}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"{{ upperCase name }}"})}),(0,n.jsx)(s.td,{children:"MY NAME"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"lowerCase"})}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"{{ lowerCase name }}"})}),(0,n.jsx)(s.td,{children:"my name"})]})]})]}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.strong,{children:(0,n.jsx)(s.code,{children:"See"})})}),"\n",(0,n.jsxs)(s.ul,{children:["\n",(0,n.jsx)(s.li,{children:(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/modules#defaulthelpers",children:"DefaultHelpers"})}),"\n",(0,n.jsx)(s.li,{children:(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/modules#datehelpers",children:"DateHelpers"})}),"\n",(0,n.jsx)(s.li,{children:(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/interfaces/ScaffoldConfig",children:"ScaffoldConfig"})}),"\n",(0,n.jsx)(s.li,{children:(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/interfaces/ScaffoldConfig#subdirhelper",children:"ScaffoldConfig.subdirHelper"})}),"\n"]}),"\n",(0,n.jsx)(s.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.a,{href:"https://github.com/chenasraf/simple-scaffold/blob/548b710/src/types.ts#L189",children:"types.ts:189"})}),"\n",(0,n.jsx)(s.hr,{}),"\n",(0,n.jsx)(s.h3,{id:"datehelpers",children:"DateHelpers"}),"\n",(0,n.jsxs)(s.p,{children:["\u01ac ",(0,n.jsx)(s.strong,{children:"DateHelpers"}),": ",(0,n.jsx)(s.code,{children:'"date"'})," | ",(0,n.jsx)(s.code,{children:'"now"'})]}),"\n",(0,n.jsx)(s.p,{children:"The names of the available helper functions that relate to dates."}),"\n",(0,n.jsxs)(s.table,{children:[(0,n.jsx)(s.thead,{children:(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.th,{children:"Helper name"}),(0,n.jsx)(s.th,{children:"Description"}),(0,n.jsx)(s.th,{children:"Example code"}),(0,n.jsx)(s.th,{children:"Example output"})]})}),(0,n.jsxs)(s.tbody,{children:[(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"now"})}),(0,n.jsx)(s.td,{children:"Current date with format"}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:'{{ now "yyyy-MM-dd HH:mm" }}'})}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"2042-01-01 15:00"})})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsxs)(s.td,{children:[(0,n.jsx)(s.code,{children:"now"})," (with offset)"]}),(0,n.jsx)(s.td,{children:"Current date with format, and with offset"}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:'{{ now "yyyy-MM-dd HH:mm" -1 "hours" }}'})}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"2042-01-01 14:00"})})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"date"})}),(0,n.jsx)(s.td,{children:"Custom date with format"}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:'{{ date "2042-01-01T15:00:00Z" "yyyy-MM-dd HH:mm" }}'})}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"2042-01-01 15:00"})})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsxs)(s.td,{children:[(0,n.jsx)(s.code,{children:"date"})," (with offset)"]}),(0,n.jsx)(s.td,{children:"Custom date with format, and with offset"}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:'{{ date "2042-01-01T15:00:00Z" "yyyy-MM-dd HH:mm" -1 "days" }}'})}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"2041-31-12 15:00"})})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsxs)(s.td,{children:[(0,n.jsx)(s.code,{children:"date"})," (with date from ",(0,n.jsx)(s.code,{children:"--data"}),")"]}),(0,n.jsxs)(s.td,{children:["Custom date with format, with data from the ",(0,n.jsx)(s.code,{children:"data"})," config option"]}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:'{{ date myCustomDate "yyyy-MM-dd HH:mm" }}'})}),(0,n.jsx)(s.td,{children:(0,n.jsx)(s.code,{children:"2042-01-01 12:00"})})]})]})]}),"\n",(0,n.jsx)(s.p,{children:"Further details:"}),"\n",(0,n.jsxs)(s.ul,{children:["\n",(0,n.jsxs)(s.li,{children:["\n",(0,n.jsxs)(s.p,{children:["We use ",(0,n.jsx)(s.a,{href:"https://date-fns.org/docs/",children:(0,n.jsx)(s.code,{children:"date-fns"})})," for parsing/manipulating the dates. If you want\nmore information on the date tokens to use, refer to\n",(0,n.jsx)(s.a,{href:"https://date-fns.org/docs/format",children:"their format documentation"}),"."]}),"\n"]}),"\n",(0,n.jsxs)(s.li,{children:["\n",(0,n.jsx)(s.p,{children:"The date helper format takes the following arguments:"}),"\n",(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{className:"language-typescript",children:'(\n  date: string,\n  format: string,\n  offsetAmount?: number,\n  offsetType?: "years" | "months" | "weeks" | "days" | "hours" | "minutes" | "seconds"\n)\n'})}),"\n"]}),"\n",(0,n.jsxs)(s.li,{children:["\n",(0,n.jsxs)(s.p,{children:[(0,n.jsx)(s.strong,{children:"The now helper"})," (for current time) takes the same arguments, minus the first one (",(0,n.jsx)(s.code,{children:"date"}),") as it is implicitly\nthe current date."]}),"\n"]}),"\n"]}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.strong,{children:(0,n.jsx)(s.code,{children:"See"})})}),"\n",(0,n.jsxs)(s.ul,{children:["\n",(0,n.jsx)(s.li,{children:(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/modules#defaulthelpers",children:"DefaultHelpers"})}),"\n",(0,n.jsx)(s.li,{children:(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/modules#casehelpers",children:"CaseHelpers"})}),"\n",(0,n.jsx)(s.li,{children:(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/interfaces/ScaffoldConfig",children:"ScaffoldConfig"})}),"\n"]}),"\n",(0,n.jsx)(s.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.a,{href:"https://github.com/chenasraf/simple-scaffold/blob/548b710/src/types.ts#L236",children:"types.ts:236"})}),"\n",(0,n.jsx)(s.hr,{}),"\n",(0,n.jsx)(s.h3,{id:"defaulthelpers",children:"DefaultHelpers"}),"\n",(0,n.jsxs)(s.p,{children:["\u01ac ",(0,n.jsx)(s.strong,{children:"DefaultHelpers"}),": ",(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/modules#casehelpers",children:(0,n.jsx)(s.code,{children:"CaseHelpers"})})," | ",(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/modules#datehelpers",children:(0,n.jsx)(s.code,{children:"DateHelpers"})})]}),"\n",(0,n.jsx)(s.p,{children:"The names of all the available helper functions in templates.\nSimple-Scaffold provides some built-in text transformation filters usable by Handlebars.js."}),"\n",(0,n.jsxs)(s.p,{children:["For example, you may use ",(0,n.jsx)(s.code,{children:"{{ snakeCase name }}"})," inside a template file or filename, and it will\nreplace ",(0,n.jsx)(s.code,{children:"My Name"})," with ",(0,n.jsx)(s.code,{children:"my_name"})," when producing the final value."]}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.strong,{children:(0,n.jsx)(s.code,{children:"See"})})}),"\n",(0,n.jsxs)(s.ul,{children:["\n",(0,n.jsx)(s.li,{children:(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/modules#casehelpers",children:"CaseHelpers"})}),"\n",(0,n.jsx)(s.li,{children:(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/modules#datehelpers",children:"DateHelpers"})}),"\n",(0,n.jsx)(s.li,{children:(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/interfaces/ScaffoldConfig",children:"ScaffoldConfig"})}),"\n"]}),"\n",(0,n.jsx)(s.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.a,{href:"https://github.com/chenasraf/simple-scaffold/blob/548b710/src/types.ts#L251",children:"types.ts:251"})}),"\n",(0,n.jsx)(s.hr,{}),"\n",(0,n.jsx)(s.h3,{id:"helper",children:"Helper"}),"\n",(0,n.jsxs)(s.p,{children:["\u01ac ",(0,n.jsx)(s.strong,{children:"Helper"}),": ",(0,n.jsx)(s.code,{children:"HelperDelegate"})]}),"\n",(0,n.jsxs)(s.p,{children:["Helper function, see ",(0,n.jsx)(s.a,{href:"https://handlebarsjs.com/guide/#custom-helpers",children:"https://handlebarsjs.com/guide/#custom-helpers"})]}),"\n",(0,n.jsx)(s.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.a,{href:"https://github.com/chenasraf/simple-scaffold/blob/548b710/src/types.ts#L258",children:"types.ts:258"})}),"\n",(0,n.jsx)(s.h2,{id:"logging",children:"Logging"}),"\n",(0,n.jsx)(s.h3,{id:"loglevel",children:"LogLevel"}),"\n",(0,n.jsxs)(s.p,{children:["\u01ac ",(0,n.jsx)(s.strong,{children:"LogLevel"}),": typeof ",(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/modules#loglevel",children:(0,n.jsx)(s.code,{children:"LogLevel"})}),"[keyof typeof ",(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/modules#loglevel",children:(0,n.jsx)(s.code,{children:"LogLevel"})}),"]"]}),"\n",(0,n.jsxs)(s.p,{children:["The amount of information to log when generating scaffold.\nWhen not ",(0,n.jsx)(s.code,{children:"None"}),", the selected level will be the lowest level included."]}),"\n",(0,n.jsxs)(s.p,{children:["For example, level ",(0,n.jsx)(s.code,{children:"Info"})," (2) will include ",(0,n.jsx)(s.code,{children:"Info"}),", ",(0,n.jsx)(s.code,{children:"Warning"})," and ",(0,n.jsx)(s.code,{children:"Error"}),", but not ",(0,n.jsx)(s.code,{children:"Debug"}),"; and ",(0,n.jsx)(s.code,{children:"Warning"})," will only\nshow ",(0,n.jsx)(s.code,{children:"Warning"})," and ",(0,n.jsx)(s.code,{children:"Error"}),"."]}),"\n",(0,n.jsxs)(s.p,{children:["You may use either the number or the name of the level.\nFor example, ",(0,n.jsx)(s.code,{children:"2"})," or ",(0,n.jsx)(s.code,{children:"info"})," are both valid."]}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.strong,{children:(0,n.jsx)(s.code,{children:"Default"})})}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.code,{children:"2 (info)"})}),"\n",(0,n.jsx)(s.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.a,{href:"https://github.com/chenasraf/simple-scaffold/blob/548b710/src/types.ts#L260",children:"types.ts:260"})}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.a,{href:"https://github.com/chenasraf/simple-scaffold/blob/548b710/src/types.ts#L291",children:"types.ts:291"})}),"\n",(0,n.jsx)(s.h2,{id:"other",children:"Other"}),"\n",(0,n.jsx)(s.h3,{id:"loglevel-1",children:"LogLevel"}),"\n",(0,n.jsxs)(s.p,{children:["\u2022 ",(0,n.jsx)(s.code,{children:"Const"})," ",(0,n.jsx)(s.strong,{children:"LogLevel"}),": ",(0,n.jsx)(s.code,{children:"Object"})]}),"\n",(0,n.jsx)(s.h4,{id:"type-declaration-1",children:"Type declaration"}),"\n",(0,n.jsxs)(s.table,{children:[(0,n.jsx)(s.thead,{children:(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.th,{style:{textAlign:"left"},children:"Name"}),(0,n.jsx)(s.th,{style:{textAlign:"left"},children:"Type"}),(0,n.jsx)(s.th,{style:{textAlign:"left"},children:"Description"})]})}),(0,n.jsxs)(s.tbody,{children:[(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{style:{textAlign:"left"},children:(0,n.jsx)(s.code,{children:"none"})}),(0,n.jsx)(s.td,{style:{textAlign:"left"},children:(0,n.jsx)(s.code,{children:'"none"'})}),(0,n.jsx)(s.td,{style:{textAlign:"left"},children:"Silent output"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{style:{textAlign:"left"},children:(0,n.jsx)(s.code,{children:"debug"})}),(0,n.jsx)(s.td,{style:{textAlign:"left"},children:(0,n.jsx)(s.code,{children:'"debug"'})}),(0,n.jsx)(s.td,{style:{textAlign:"left"},children:"Debugging information. Very verbose and only recommended for troubleshooting."})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{style:{textAlign:"left"},children:(0,n.jsx)(s.code,{children:"info"})}),(0,n.jsx)(s.td,{style:{textAlign:"left"},children:(0,n.jsx)(s.code,{children:'"info"'})}),(0,n.jsxs)(s.td,{style:{textAlign:"left"},children:["The regular level of logging. Major actions are logged to show the scaffold progress. ",(0,n.jsx)(s.strong,{children:(0,n.jsx)(s.code,{children:"Default"})})," ",(0,n.jsx)(s.code,{children:"ts "})]})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{style:{textAlign:"left"},children:(0,n.jsx)(s.code,{children:"warning"})}),(0,n.jsx)(s.td,{style:{textAlign:"left"},children:(0,n.jsx)(s.code,{children:'"warning"'})}),(0,n.jsx)(s.td,{style:{textAlign:"left"},children:"Warnings such as when file fails to replace token values properly in template."})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{style:{textAlign:"left"},children:(0,n.jsx)(s.code,{children:"error"})}),(0,n.jsx)(s.td,{style:{textAlign:"left"},children:(0,n.jsx)(s.code,{children:'"error"'})}),(0,n.jsx)(s.td,{style:{textAlign:"left"},children:"Errors, such as missing files, bad replacement token syntax, or un-writable directories."})]})]})]}),"\n",(0,n.jsx)(s.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.a,{href:"https://github.com/chenasraf/simple-scaffold/blob/548b710/src/types.ts#L260",children:"types.ts:260"})}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.a,{href:"https://github.com/chenasraf/simple-scaffold/blob/548b710/src/types.ts#L291",children:"types.ts:291"})}),"\n",(0,n.jsx)(s.hr,{}),"\n",(0,n.jsx)(s.h3,{id:"scaffoldconfigmap",children:"ScaffoldConfigMap"}),"\n",(0,n.jsxs)(s.p,{children:["\u01ac ",(0,n.jsx)(s.strong,{children:"ScaffoldConfigMap"}),": ",(0,n.jsx)(s.code,{children:"Record"}),"<",(0,n.jsx)(s.code,{children:"string"}),", ",(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/interfaces/ScaffoldConfig",children:(0,n.jsx)(s.code,{children:"ScaffoldConfig"})}),">"]}),"\n",(0,n.jsx)(s.p,{children:"A mapping of scaffold template keys to their configurations."}),"\n",(0,n.jsxs)(s.p,{children:["Each configuration is a ",(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/interfaces/ScaffoldConfig",children:"ScaffoldConfig"})," object."]}),"\n",(0,n.jsx)(s.p,{children:"The key is the name of the template, and the value is the configuration for that template."}),"\n",(0,n.jsx)(s.p,{children:'When no template key is provided to the scaffold command, the "default" template is used.'}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.strong,{children:(0,n.jsx)(s.code,{children:"See"})})}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/interfaces/ScaffoldConfig",children:"ScaffoldConfig"})}),"\n",(0,n.jsx)(s.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.a,{href:"https://github.com/chenasraf/simple-scaffold/blob/548b710/src/types.ts#L373",children:"types.ts:373"})}),"\n",(0,n.jsx)(s.hr,{}),"\n",(0,n.jsx)(s.h3,{id:"scaffoldconfigfile",children:"ScaffoldConfigFile"}),"\n",(0,n.jsxs)(s.p,{children:["\u01ac ",(0,n.jsx)(s.strong,{children:"ScaffoldConfigFile"}),": ",(0,n.jsx)(s.code,{children:"AsyncResolver"}),"<",(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/interfaces/ScaffoldCmdConfig",children:(0,n.jsx)(s.code,{children:"ScaffoldCmdConfig"})}),", ",(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/modules#scaffoldconfigmap",children:(0,n.jsx)(s.code,{children:"ScaffoldConfigMap"})}),">"]}),"\n",(0,n.jsx)(s.p,{children:"The scaffold config file is either:"}),"\n",(0,n.jsxs)(s.ul,{children:["\n",(0,n.jsxs)(s.li,{children:["A ",(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/modules#scaffoldconfigmap",children:"ScaffoldConfigMap"})," object"]}),"\n",(0,n.jsxs)(s.li,{children:["A function that returns a ",(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/modules#scaffoldconfigmap",children:"ScaffoldConfigMap"})," object"]}),"\n",(0,n.jsxs)(s.li,{children:["A promise that resolves to a ",(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/modules#scaffoldconfigmap",children:"ScaffoldConfigMap"})," object"]}),"\n",(0,n.jsxs)(s.li,{children:["A function that returns a promise that resolves to a ",(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/modules#scaffoldconfigmap",children:"ScaffoldConfigMap"})," object"]}),"\n"]}),"\n",(0,n.jsx)(s.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,n.jsx)(s.p,{children:(0,n.jsx)(s.a,{href:"https://github.com/chenasraf/simple-scaffold/blob/548b710/src/types.ts#L381",children:"types.ts:381"})}),"\n",(0,n.jsx)(s.hr,{}),"\n",(0,n.jsx)(s.h3,{id:"default",children:"default"}),"\n",(0,n.jsxs)(s.p,{children:["Renames and re-exports ",(0,n.jsx)(s.a,{href:"/simple-scaffold/docs/api/modules#scaffold",children:"Scaffold"})]})]})}function o(e={}){const{wrapper:s}={...(0,d.a)(),...e.components};return s?(0,n.jsx)(s,{...e,children:(0,n.jsx)(a,{...e})}):a(e)}},8672:(e,s,l)=>{l.d(s,{Z:()=>c,a:()=>r});var n=l(959);const d={},i=n.createContext(d);function r(e){const s=n.useContext(i);return n.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function c(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:r(e.components),n.createElement(i.Provider,{value:s},e.children)}}}]);