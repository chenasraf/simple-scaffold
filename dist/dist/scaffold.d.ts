import IScaffold from './index';
declare class SimpleScaffold {
    config: IScaffold.Config;
    locals: IScaffold.Config['locals'];
    constructor(config: IScaffold.Config);
    private parseLocals;
    private fileList;
    private getFileContents;
    private getOutputPath;
    private writeFile;
    run(): void;
}
export default SimpleScaffold;
