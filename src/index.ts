import { readCsv } from "datakit";
import { IQueryResolver } from "@miniql/core-types";
import { createQueryResolver as createLazyResolver, IQueryResolverConfig, ILazyDataLoader } from "@miniql/lazy";
export { IQueryResolverConfig, IRelatedEntityConfig, IRelatedEntities, IEntityType, IEntityTypes } from "@miniql/lazy";

//
// Sets CSV file path for each entity type.
//
export interface ICsvFileConfig {
    [entityTypeName: string]: string;
}

//
// Defines a function for loading CSV data.
//
export type LoadCsvDataFn = (filePath: string) => Promise<any[]>;

//
// Creates the CSV resolver with a particular configuration.
//
export function createQueryResolver(config: IQueryResolverConfig, csvFiles: ICsvFileConfig, loadCsvData?: LoadCsvDataFn): IQueryResolver {
    if (loadCsvData === undefined) {
        // If no method if provided to load a CSV file, default to loading from local file system.
        loadCsvData = async (csvFilePath: string) => {
            return await readCsv(csvFilePath, {});
        };
    }

    const dataLoader: ILazyDataLoader = {
        //
        // Loads a single entity.
        //
        async loadSingleEntity(entityTypeName: string, primaryKey: string, entityId: string): Promise<any> {
            const entities = await loadCsvData!(csvFiles[entityTypeName]);
            const filteredEntities = entities.filter(entity => entity[primaryKey] === entityId);
            if (filteredEntities.length > 0) {
                // At least one entity was found.
                return filteredEntities[0];
            }
            else {
                // No entity was found.
                return undefined;
            }
        },

        //
        // Load the set of entities.
        //
        async loadEntities(entityTypeName: string): Promise<any[]> {
            return await loadCsvData!(csvFiles[entityTypeName]);
        },
    };
    return createLazyResolver(config, dataLoader);
}