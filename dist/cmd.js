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
})(this, function() {
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

var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
        };
        this.config = Object.assign({}, DefaultConfig, config);
        var DefaultLocals = {
            Name: this.config.name[0].toUpperCase() + this.config.name.slice(1),
            name: this.config.name[0].toLowerCase() + this.config.name.slice(1)
        };
        this.locals = Object.assign({}, DefaultLocals, config.locals);
    }
    SimpleScaffold.prototype.parseLocals = function (text) {
        var template = handlebars.compile(text, {
            noEscape: true
        });
        return template(this.locals);
    };
    SimpleScaffold.prototype.fileList = function (input) {
        var _i, input_1, checkPath, files, idx, cleanCheckPath, _a, files_1, file;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _i = 0, input_1 = input;
                    _b.label = 1;
                case 1:
                    if (!(_i < input_1.length)) return [3 /*break*/, 6];
                    checkPath = input_1[_i];
                    files = glob.sync(checkPath).map(function (g) { return g[0] == '/' ? g : path.join(process.cwd(), g); });
                    idx = checkPath.indexOf('*');
                    cleanCheckPath = checkPath;
                    if (idx >= 0) {
                        cleanCheckPath = checkPath.slice(0, idx - 1);
                    }
                    _a = 0, files_1 = files;
                    _b.label = 2;
                case 2:
                    if (!(_a < files_1.length)) return [3 /*break*/, 5];
                    file = files_1[_a];
                    return [4 /*yield*/, { base: cleanCheckPath, file: file }];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _a++;
                    return [3 /*break*/, 2];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    };
    SimpleScaffold.prototype.getFileContents = function (filePath) {
        return fs.readFileSync(filePath).toString();
    };
    SimpleScaffold.prototype.getOutputPath = function (file, basePath) {
        var out;
        if (typeof this.config.output === 'function') {
            out = this.config.output(file, basePath);
        }
        else {
            var outputDir = this.config.output + ("/" + this.config.name + "/");
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
        fs.writeFileSync(filePath, fileContents, { encoding: 'utf-8' });
    };
    SimpleScaffold.prototype.run = function () {
        console.log("Generating scaffold: " + this.config.name + "...");
        var templates = this.fileList(this.config.templates);
        var fileConf, count = 0;
        while (fileConf = templates.next().value) {
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

Object.defineProperty(exports, "__esModule", { value: true });
var scaffold_1 = __webpack_require__(1);
var args = process.argv.slice(2);
var ScaffoldCmd = /** @class */ (function () {
    function ScaffoldCmd() {
        this.config = this.getOptionsFromArgs();
    }
    ScaffoldCmd.prototype.getOptionsFromArgs = function () {
        var _this = this;
        var skipNext = false;
        var options = {};
        args.forEach(function (arg, i) {
            if (skipNext) {
                skipNext = false;
                return;
            }
            if (arg.slice(0, 2) == '--') {
                skipNext = true;
                var value = void 0;
                if (arg.indexOf('=') >= 0) {
                    value = arg.split('=').slice(1).join('');
                }
                else if (args.length >= i + 1 && args[i + 1] && args[i + 1].slice(0, 2) !== '--') {
                    value = args[i + 1];
                }
                else {
                    value = 'true';
                }
                var argName = arg.slice(2);
                options[argName] = _this.getArgValue(argName, value, options);
            }
            else {
                if (!options.name) {
                    options.name = arg;
                }
                else {
                    throw new TypeError("Invalid argument: " + arg);
                }
            }
        });
        if (!['name', 'templates', 'output'].every(function (o) { return options[o] !== undefined; })) {
            throw new Error("Config is missing keys: " + JSON.stringify(options));
        }
        return options;
    };
    ScaffoldCmd.prototype.getArgValue = function (arg, value, options) {
        switch (arg) {
            case 'templates':
                return (options.templates || []).concat([value]);
            case 'output':
                return value;
            case 'locals':
                var split = value.split(',');
                var locals = options.locals || {};
                for (var _i = 0, split_1 = split; _i < split_1.length; _i++) {
                    var item = split_1[_i];
                    var _a = item.split('='), k = _a[0], v = _a[1];
                    locals[k] = v;
                }
                return locals;
            default:
                throw TypeError("arguments invalid for config: arg=`" + arg + "`, value=`" + value + "`");
        }
    };
    ScaffoldCmd.prototype.run = function () {
        var config = this.config;
        console.info('Config:', config);
        var scf = new scaffold_1.default({
            name: config.name,
            templates: config.templates,
            output: config.output,
            locals: config.locals,
        }).run();
    };
    return ScaffoldCmd;
}());
new ScaffoldCmd().run();


/***/ })
/******/ ]);
});
//# sourceMappingURL=cmd.js.map