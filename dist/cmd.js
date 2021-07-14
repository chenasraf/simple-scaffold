var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./scaffold"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var scaffold_1 = __importDefault(require("./scaffold"));
    scaffold_1.default({
        name: "sample_app",
        outputPath: "examples/test-output",
        templates: ["examples/test-input/Component"],
        overwrite: true,
        data: {
            property: "myProp",
            value: "10",
        },
    });
    scaffold_1.default({
        name: "sample_app_with_subdir",
        outputPath: "examples/test-output",
        templates: ["examples/test-input/Component"],
        createSubfolder: true,
        data: {
            property: "myProp",
            value: "10",
        },
    });
});
//# sourceMappingURL=cmd.js.map