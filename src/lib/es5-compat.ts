"use strict";

import * as ObjectUtils from "underscore";

export class StringMap<V> {
    private data: any = {};

    has(key: string): boolean{
        return ObjectUtils.has(this.data, key);
    }

    get(key: string): V {
        return this.data[key];
    }

    set (key: string, value: V): StringMap<V> {
        this.data[key] = value;
        return this;
    }

    remove(key: any): V{
        let value: V = this.get(key);
        delete this.data[key];
        return value;
    }

    keys(): Array<string> {
        return ObjectUtils.keys(this.data);
    } 

    values(): Array<V> {
        return ObjectUtils.values(this.data);
    } 
    
    clear(): StringMap<V> {
        this.data = {};
        return this;
    }

    forEach(fn): StringMap<V> {
        ObjectUtils.forEach(this.data, fn);
        return this;
    }

    size(): number {
        return ObjectUtils.size(this.data);
    }
}

export class Set<V> {
    private data: any = [];

    constructor(data?: Array<V>) {
        if (data) {
            this.data = data;
        }
    }

    has(value: V): boolean{
        return ObjectUtils.contains(this.data, value);
    }

    add(value: V): Set<V> {
        if (!this.has(value)) {
            this.data.push(value);
        }
        return this;
    }

    clear(): Set<V> {
        this.data = [];
        return this;
    }

    forEach(fn): Set<V> {
        ObjectUtils.forEach(this.data, fn);
        return this;
    }

    asArray(): Array<V> {
        return ObjectUtils.clone(this.data);
    }
}