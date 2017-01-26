import { ReferencedResource } from "./server-types";
export declare class NewResource extends ReferencedResource {
    constructor(location: string);
}
export declare class RequestAccepted extends ReferencedResource {
    constructor(location: string);
}
export declare class MovedPermanently extends ReferencedResource {
    constructor(location: string);
}
export declare class MovedTemporarily extends ReferencedResource {
    constructor(location: string);
}
export declare class DownloadResource {
    filePath: string;
    fileName: string;
    constructor(filePath: string, fileName: string);
}
export declare class DownloadBinaryData {
    content: Buffer;
    mimeType: string;
    fileName: string;
    constructor(content: Buffer, mimeType: string, fileName: string);
}
