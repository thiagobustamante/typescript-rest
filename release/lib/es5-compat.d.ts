export declare class StringMap<V> {
    private data;
    has(key: string): boolean;
    get(key: string): V;
    set(key: string, value: V): StringMap<V>;
    remove(key: any): V;
    keys(): Array<string>;
    values(): Array<V>;
    clear(): StringMap<V>;
    forEach(fn: any): StringMap<V>;
    size(): number;
}
export declare class Set<V> {
    private data;
    constructor(data?: Array<V>);
    has(value: V): boolean;
    add(value: V): Set<V>;
    clear(): Set<V>;
    forEach(fn: any): Set<V>;
    asArray(): Array<V>;
}
