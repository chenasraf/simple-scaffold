import IScaffold from './index';
declare class SimpleScaffold {
    config: IScaffold.Config;
    locals: IScaffold.Config['locals'];
    constructor(config: IScaffold.Config);
    private parseLocals(text);
    private fileList(input);
    private getFileContents(filePath);
    private getOutputPath(file, basePath);
    private writeFile(filePath, fileContents);
    run(): void;
}
export default SimpleScaffold;
