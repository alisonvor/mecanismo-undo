type Table<T> = {
    [K in keyof T]: T[K][];
};

export interface Metadata {
    table: Table<any>;
}