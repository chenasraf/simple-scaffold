#!/usr/bin/env node
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.library=t():e.library=t()}(global,(function(){return(()=>{"use strict";var e={784:(e,t,o)=>{Object.defineProperty(t,"__esModule",{value:!0});var r=o(493),n=o(127),i=o(67),a=o(622);function s(e){return e.startsWith("/")?e:[process.cwd(),e].join(a.sep)}function l(e){return!e||!e.trim().length||["true","1","on"].includes(e.trim())}var u=[{name:"name",alias:"n",type:String,description:"Component output name",defaultOption:!0},{name:"templates",alias:"t",type:s,typeLabel:"{underline File}[]",description:"A glob pattern of template files to load.\nA template file may be of any type and extension, and supports Handlebars as a parsing engine for the file names and contents, so you may customize both with variables from your configuration.",multiple:!0},{name:"output",alias:"o",type:s,typeLabel:"{underline File}",description:"The output directory to put the new files in. They will attempt to maintain their regular structure as they are found, if possible."},{name:"locals",alias:"l",description:"A JSON string for the template to use in parsing.",typeLabel:"{underline JSON string}",type:function(e){return JSON.parse(e)}},{name:"overwrite",alias:"w",description:"Whether to overwrite files when they are found to already exist. {bold default=true}",type:l,typeLabel:"{underline Boolean}",defaultValue:!0},{name:"create-sub-folder",alias:"S",typeLabel:"{underline Boolean}",description:"Whether to create a subdirectory with \\{\\{Name\\}\\} in the {underline output} directory. {bold default=true}",type:l,defaultValue:!0},{name:"help",alias:"h",type:Boolean,description:"Display this help message"}],c=n(u,{camelCase:!0}),p=[{header:"Scaffold Generator",content:"Generate scaffolds for your project based on file templates.\nUsage: {bold simple-scaffold} {underline scaffold-name} {underline [options]}"},{header:"Options",optionList:u}];null===c.createSubFolder&&(c.createSubFolder=!0),!c.help&&c.name||(console.log(i(p)),process.exit(0)),console.info("Config:",c),new r.default({name:c.name,templates:c.templates,output:c.output,locals:c.locals,createSubfolder:c.createSubFolder,overwrite:c.overwrite}).run()},493:function(e,t,o){var r=this&&this.__assign||function(){return(r=Object.assign||function(e){for(var t,o=1,r=arguments.length;o<r;o++)for(var n in t=arguments[o])Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);return e}).apply(this,arguments)};Object.defineProperty(t,"__esModule",{value:!0});var n=o(747),i=o(622),a=o(878),s=o(778),l=function(){function e(e){this.locals={};var t={name:"scaffold",templates:[],output:process.cwd(),createSubfolder:!0,overwrite:!0};this.config=r(r({},t),e);var o={Name:this.config.name[0].toUpperCase()+this.config.name.slice(1),name:this.config.name[0].toLowerCase()+this.config.name.slice(1)};this.locals=r(r({},o),e.locals)}return e.prototype.parseLocals=function(e){try{return s.compile(e,{noEscape:!0})(this.locals)}catch(t){return console.warn("Problem using Handlebars, returning unmodified content"),e}},e.prototype.fileList=function(e){for(var t=[],o=0,r=e;o<r.length;o++){var n=r[o],s=a.sync(n,{dot:!0}).map((function(e){return"/"==e[0]?e:i.join(process.cwd(),e)})),l=n.indexOf("*"),u=n;l>=0&&(u=n.slice(0,l-1));for(var c=0,p=s;c<p.length;c++){var f=p[c];t.push({base:u,file:f})}}return t},e.prototype.getFileContents=function(e){return console.log(n.readFileSync(e)),n.readFileSync(e).toString()},e.prototype.getOutputPath=function(e,t){var o;if("function"==typeof this.config.output)o=this.config.output(e,t);else{var r=this.config.output+(this.config.createSubfolder?"/"+this.config.name+"/":"/"),n=e.indexOf(t),a=e;n>=0&&(a=e!==t?e.slice(n+t.length+1):i.basename(e)),o=r+a}return this.parseLocals(o)},e.prototype.writeFile=function(e,t){var o=i.dirname(e);this.writeDirectory(o,e),n.writeFile(e,t,{encoding:"utf-8"},(function(e){if(e)throw e}))},e.prototype.shouldWriteFile=function(e){var t,o,r="boolean"==typeof this.config.overwrite?this.config.overwrite:null===(o=(t=this.config).overwrite)||void 0===o?void 0:o.call(t,e);return!n.existsSync(e)||!1!==r},e.prototype.run=function(){console.log("Generating scaffold: "+this.config.name+"...");var e,t=this.fileList(this.config.templates),o=0;console.log("Template files:",t);for(var r=0,i=t;r<i.length;r++){e=i[r];var a=void 0,s=void 0,l=void 0,u=void 0,c=void 0;try{if(o++,u=e.file,c=e.base,a=this.getOutputPath(u,c),n.lstatSync(u).isDirectory()){this.writeDirectory(a,u);continue}s=this.getFileContents(u),l=this.parseLocals(s),this.shouldWriteFile(a)?(console.info("Writing:",{file:u,base:c,outputPath:a,outputContents:l.replace("\n","\\n")}),this.writeFile(a,l)):console.log("Skipping file "+a)}catch(e){throw console.error("Error while processing file:",{file:u,base:c,contents:s,outputPath:a,outputContents:l}),e}}if(!o)throw new Error("No files to scaffold!");console.log("Done")},e.prototype.writeDirectory=function(e,t){var o=i.dirname(e);n.existsSync(o)||this.writeDirectory(o,e),n.existsSync(e)||(console.info("Creating directory:",{file:t,outputPath:e}),n.mkdirSync(e))},e}();t.default=l},127:e=>{e.exports=require("command-line-args")},67:e=>{e.exports=require("command-line-usage")},747:e=>{e.exports=require("fs")},878:e=>{e.exports=require("glob")},778:e=>{e.exports=require("handlebars")},622:e=>{e.exports=require("path")}},t={};return function o(r){if(t[r])return t[r].exports;var n=t[r]={exports:{}};return e[r].call(n.exports,n,n.exports,o),n.exports}(784)})()}));
//# sourceMappingURL=cmd.js.map