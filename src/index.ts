import { readCsv } from "datakit";

//
// Configures a related entity.
//
export interface IRelatedEntityConfig {
    //
    // Specifies the column in the CSV that relates this entity to the other entity.
    //
    foreignKey: string;
}

//
// Specifies related entites.
//
export interface IRelatedEntities {
    [nestedEntityType: string]: IRelatedEntityConfig;
}

//
// Configures an entity type and specifies which CSV file it is loaded from.
//
export interface IEntityType {

    //
    // Specifies the column in the CSV file that is the primary identifying key for each entity.
    //
    primaryKey: string;

    //
    // The path to the CSV file to load for this entity type.
    //
    csvFilePath: string; //TODO: error if neither csvFilePath or csvData is included. TODO SHOULD BE OPTIONAL.

    // 
    // The CSV data for this entity type.
    //
    csvData?: string;

    //
    // Specifies other entities that are related to this one.
    //
    related?: IRelatedEntities;
}

//
// Configures the CSV resolver.
//
export interface ICsvResolverConfig {
    [entityType: string]: IEntityType;
}

//
// Defines a function for loading CSV data.
//
export type LoadCsvDataFn = (filePath: string) => Promise<any[]>;

//
// Creates the CSV resolver with a particular configuration.
//
export async function createResolver(config: ICsvResolverConfig, loadCsvData?: LoadCsvDataFn): Promise<any> {
    const resolver: any = { 
        query: {
        },
    };

    if (loadCsvData === undefined) {
        // If no method if provided to load a CSV file, default to loading from local file system.
        loadCsvData = async (csvFilePath: string) => {
            return await readCsv(csvFilePath, {});
        };
    }

    for (const entityTypeName of Object.keys(config)) {
        const entityType = config[entityTypeName];
        resolver.query[entityTypeName] = async (query: any, context: any) => {
            const entities = await loadCsvData!(entityType.csvFilePath); //TODO: CACHE IT!
            if (query.id !== undefined) {
                // Single entity query.
                const primaryKey = entityType.primaryKey; //TODO: Error check this is defined!
                const filteredEntities = entities.filter(entity => entity[primaryKey] === query.id);
                if (filteredEntities.length > 0) {
                    // At least one entity was found.
                    return filteredEntities[0];
                }
                else {
                    // No entity was found.
                    return undefined;
                }
            }
            else {
                // Multiple entity query.
                return entities;
            }
        };

        if (entityType.related) {
            for (const nestedEntityTypeName of Object.keys(entityType.related)) {
                const mapFnName = `${entityTypeName}=>${nestedEntityTypeName}`;
                resolver.query[mapFnName] = async (query: any, context: any) => {
                    const parentEntityId = query.entity[entityType.primaryKey];
                    const nestedEntityType = config[nestedEntityTypeName]; //todo: error check this exists!
                    const foreignKey = entityType.related![nestedEntityTypeName].foreignKey;
                    const nestedEntities = await loadCsvData!(nestedEntityType.csvFilePath); //TODO: CACHE IT!
                    return nestedEntities
                        .filter(nestedEntity => nestedEntity[foreignKey] === parentEntityId)
                        .map(nestedEntity => nestedEntity[nestedEntityType.primaryKey]);
                };
            }
        }
    }

    return resolver;
}