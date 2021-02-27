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
}
export default SimpleScaffold;
