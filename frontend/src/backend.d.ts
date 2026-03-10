import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Document {
    id: string;
    content: ExternalBlob;
    owner: Principal;
    name: string;
    size: bigint;
}
export interface backendInterface {
    addDocument(content: ExternalBlob, id: string, name: string, size: bigint): Promise<Document>;
    deleteDocument(id: string): Promise<void>;
    getDocument(id: string): Promise<Document>;
    getMyDocumentIds(includesDoNotStore: boolean): Promise<Array<Document>>;
}
