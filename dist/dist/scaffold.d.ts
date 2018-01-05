import IScaffold from './index';
declare class SimpleScaffold {
    private config;
    private locals;
    constructor(config: IScaffold.IConfig);
    private parseLocals(text);
    private fileList(input);
    private getFileContents(filePath);
    private getOutputPath(file, basePath);
    private writeFile(filePath, fileContents);
    run(): void;
}
export default SimpleScaffold;
