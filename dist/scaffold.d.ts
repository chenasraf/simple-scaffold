declare type FileResponseFn<T> = (fullPath: string, basedir: string, basename: string) => T;
export declare type FileResponse<T> = T | FileResponseFn<T>;
export interface ScaffoldConfig {
    name: string;
    templates: string[];
    outputPath: FileResponse<string>;
    createSubfolder?: boolean;
    data?: Record<string, string>;
    overwrite?: FileResponse<boolean>;
    silent?: boolean;
}
export declare function Scaffold(config: ScaffoldConfig): Promise<void>;
export default Scaffold;
