/// <reference types="node" />
import { IScaffold } from "./index.d";
declare class SimpleScaffold {
    config: IScaffold.Config;
    locals: IScaffold.Config["locals"];
    constructor(config: IScaffold.Config);
    private parseLocals;
    private fileList;
    private getFileContents;
    private getOutputPath;
    private writeFile;
    private shouldWriteFile;
    run(): void;
    private writeDirectory;
    _log(method: keyof typeof console, ...args: any[]): void;
    log(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
}
export default SimpleScaffold;
