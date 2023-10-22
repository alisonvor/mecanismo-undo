import { Metadata } from "../models/MetadataInterface";

function arraysHaveSameLength(metadata: Metadata) {
    const lengths = Object.values(metadata.table).map(array => array.length);
    const firstLength = lengths[0];
    return lengths.every(length => length === firstLength);
}

function arrayHasConsistentType(array: any[]) {
    if (array.length === 0) return true;

    const firstType = typeof array[0];
    return array.every(item => typeof item === firstType);
}

function allArraysHaveConsistentTypes(metadata: Metadata) {
    return Object.values(metadata.table).every(arrayHasConsistentType);
}

export function validateMetadata(metadata: Metadata) {
    if (!arraysHaveSameLength(metadata)) {
        console.error("Uma ou mais não possui a mesma quantia de linhas que o restante!");
        return false;
    }

    if (!allArraysHaveConsistentTypes(metadata)) {
        console.error("Todos os tipos de uma coluna devem ser o mesmo!");
        return false;
    }

    return true;
}