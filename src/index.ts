import { readCsv } from "datakit";

//
// Configures a related entity.
//
export interface IRelatedEntityConfig { //TODO: error check that one of these is present.
    //
    // The type of entity, if different from the nested entity key.
    //
    from?: string;

    //
    // Specifies the column in the parent entity that relates it to the primaryKey in the nested entity.
    //
    parentKey?: string;

    //
    // Specifies the column in the child entity that relates it to the primaryKey in the parent entity.
    //
    foreignKey?: string;
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
    nested?: IRelatedEntities;
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
export async function createQueryResolver(config: ICsvResolverConfig, loadCsvData?: LoadCsvDataFn): Promise<any> {
    const resolver: any = { 
        get: {
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
        const entityResolver: any = { //TODO: type this properly.
            invoke: async (args: any, context: any) => {
                const entities = await loadCsvData!(entityType.csvFilePath); //TODO: CACHE IT!
                const primaryKey = entityType.primaryKey; //TODO: Error check this is defined!
                const entityId = args[primaryKey];
                if (entityId !== undefined) {
                    // Single entity query.
                    const filteredEntities = entities.filter(entity => entity[primaryKey] === entityId);
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
            },
        };

        if (entityType.nested) {
            entityResolver.nested = {};

            const nested = entityType.nested;

            for (const nestedEntityTypeName of Object.keys(entityType.nested)) {
                entityResolver.nested[nestedEntityTypeName] = {
                    invoke: async (parent: any, args: any, context: any) => {
                        const nestedEntityConfig = nested[nestedEntityTypeName];
                        const nestedEntityConfigName = nestedEntityConfig.from || nestedEntityTypeName;
                        const nestedEntityType = config[nestedEntityConfigName]; //todo: error check this exists!
                        const parentKey = nestedEntityConfig.parentKey; //todo: error check entity type object exists! todo: error check one of these exists.
                        const foreignKey = nestedEntityConfig.foreignKey;
                        const nestedEntities = await loadCsvData!(nestedEntityType.csvFilePath); //TODO: CACHE IT!
                        if (parentKey !== undefined) {
                            const id = parent[parentKey];
                            return nestedEntities.filter(nestedEntity => nestedEntity[nestedEntityType.primaryKey] === id)[0]; //TODO: what if it doesn't exist?
                        }
                        else if (foreignKey !== undefined) {
                            const parentEntityId = parent[entityType.primaryKey]; //todo: check that it exists.
                            return nestedEntities.filter(nestedEntity => nestedEntity[foreignKey] === parentEntityId);
                        }
                        else {
                            //todo: error.
                        }
                    },
                }
            }
        }

        resolver.get[entityTypeName] = entityResolver;
    }

    return resolver;
}