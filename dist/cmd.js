#!/usr/bin/env node
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["library"] = factory();
	else
		root["library"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __webpack_require__(2);
var path = __webpack_require__(0);
var glob = __webpack_require__(3);
var handlebars = __webpack_require__(4);
var SimpleScaffold = /** @class */ (function () {
    function SimpleScaffold(config) {
        this.locals = {};
        var DefaultConfig = {
            name: 'scaffold',
            templates: [],
            output: process.cwd(),
            createSubfolder: true,
        };
        this.config = __assign({}, DefaultConfig, config);
        var DefaultLocals = {
            Name: this.config.name[0].toUpperCase() + this.config.name.slice(1),
            name: this.config.name[0].toLowerCase() + this.config.name.slice(1)
        };
        this.locals = __assign({}, DefaultLocals, config.locals);
    }
    SimpleScaffold.prototype.parseLocals = function (text) {
        var template = handlebars.compile(text, {
            noEscape: true
        });
        return template(this.locals);
    };
    SimpleScaffold.prototype.fileList = function (input) {
        var output = [];
        for (var _i = 0, input_1 = input; _i < input_1.length; _i++) {
            var checkPath = input_1[_i];
            var files = glob.sync(checkPath, { dot: true })
                .map(function (g) { return g[0] == '/' ? g : path.join(process.cwd(), g); });
            var idx = checkPath.indexOf('*');
            var cleanCheckPath = checkPath;
            if (idx >= 0) {
                cleanCheckPath = checkPath.slice(0, idx - 1);
            }
            for (var _a = 0, files_1 = files; _a < files_1.length; _a++) {
                var file = files_1[_a];
                output.push({ base: cleanCheckPath, file: file });
            }
        }
        return output;
    };
    SimpleScaffold.prototype.getFileContents = function (filePath) {
        console.log(fs.readFileSync(filePath));
        return fs.readFileSync(filePath).toString();
    };
    SimpleScaffold.prototype.getOutputPath = function (file, basePath) {
        var out;
        if (typeof this.config.output === 'function') {
            out = this.config.output(file, basePath);
        }
        else {
            var outputDir = this.config.output + (this.config.createSubfolder ? "/" + this.config.name + "/" : '/');
            var idx = file.indexOf(basePath);
            var relativeFilePath = file;
            if (idx >= 0) {
                relativeFilePath = file.slice(idx + basePath.length + 1);
            }
            out = outputDir + relativeFilePath;
        }
        return this.parseLocals(out);
    };
    SimpleScaffold.prototype.writeFile = function (filePath, fileContents) {
        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath));
        }
        console.info('Writing file:', filePath);
        fs.writeFile(filePath, fileContents, { encoding: 'utf-8' }, function (err) {
            if (err) {
                throw err;
            }
        });
    };
    SimpleScaffold.prototype.run = function () {
        console.log("Generating scaffold: " + this.config.name + "...");
        var templates = this.fileList(this.config.templates);
        var fileConf, count = 0;
        for (var _i = 0, templates_1 = templates; _i < templates_1.length; _i++) {
            fileConf = templates_1[_i];
            count++;
            var file = fileConf.file, base = fileConf.base;
            var outputPath = this.getOutputPath(file, base);
            var contents = this.getFileContents(file);
            var outputContents = this.parseLocals(contents);
            this.writeFile(outputPath, outputContents);
            console.info('Parsing:', { file: file, base: base, outputPath: outputPath, outputContents: outputContents.replace("\n", "\\n") });
        }
        if (!count) {
            throw new Error('No files to scaffold!');
        }
        console.log('Done');
    };
    return SimpleScaffold;
}());
exports.default = SimpleScaffold;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("glob");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("handlebars");

/***/ }),
/* 5 */,
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var scaffold_1 = __webpack_require__(1);
var cliArgs = __webpack_require__(7);
var cliUsage = __webpack_require__(8);
var path = __webpack_require__(0);
function localsParser(content) {
    var _a;
    var _b = content.split('='), key = _b[0], value = _b[1];
    return _a = {}, _a[key] = value, _a;
}
function filePathParser(content) {
    if (content.startsWith('/')) {
        return content;
    }
    return [process.cwd(), content].join(path.sep);
}
var defs = [
    { name: 'name', alias: 'n', type: String, description: 'Component output name', defaultOption: true },
    { name: 'templates', alias: 't', type: filePathParser, multiple: true },
    { name: 'output', alias: 'o', type: filePathParser, multiple: true },
    { name: 'locals', alias: 'l', multiple: true, type: localsParser },
    { name: 'create-sub-folder', alias: 'S', type: function (text) { return text && text.trim().length ? ['true', '1', 'on'].includes(text.trim()) : true; } },
    { name: 'help', alias: 'h', type: Boolean, description: 'Display this help message' },
];
var args = cliArgs(defs, { camelCase: true });
var help = [
    { header: 'Scaffold Generator', content: 'Generate scaffolds for your project based on file templates.' },
    { header: 'Options', optionList: defs }
];
args.locals = (args.locals || []).reduce(function (all, cur) { return (__assign({}, all, cur)); }, {});
if (args.createSubFolder === null) {
    args.createSubFolder = true;
}
console.info('Config:', args);
if (args.help || !args.name) {
    console.log(cliUsage(help));
    process.exit(0);
}
new scaffold_1.default({
    name: args.name,
    templates: args.templates,
    output: args.output,
    locals: args.locals,
    createSubfolder: args.createSubFolder,
}).run();


/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("command-line-args");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("command-line-usage");

/***/ })
/******/ ]);
});
//# sourceMappingURL=cmd.js.map