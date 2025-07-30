export declare class Rx<T> {
    private _subject;
    constructor(initialValue: T);
    get value(): T;
    set value(newValue: T);
    map<U>(transform: (value: T) => U): Rx<U>;
    where(predicate: (value: T) => boolean): Rx<T>;
    update(updater: (value: T) => T): void;
    subscribe(observer: (value: T) => void): () => void;
    dispose(): void;
}
export declare function rx<T>(initialValue: T): Rx<T>;
export declare function rxInt(initialValue: number): Rx<number>;
export declare function rxString(initialValue: string): Rx<string>;
export declare function rxBool(initialValue: boolean): Rx<boolean>;
//# sourceMappingURL=Rx.d.ts.map