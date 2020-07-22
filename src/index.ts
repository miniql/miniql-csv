//
// Configures a related entity.
//
export interface IRelatedEntityConfig {
    //
    // Specifies the column in the CSV that relates this entity to the other entity.
    //
    // foreignKey: string;
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
    // primaryKey: string;

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
// TODO: loadCsvData should be optional!
//
export async function createResolver(config: ICsvResolverConfig, loadCsvData: LoadCsvDataFn): Promise<any> {
    const resolver: any = { 
        query: {
        },
    };
    for (const entityName of Object.keys(config)) {
        const entityType = config[entityName];
        resolver.query[entityName] = async () => {
            return await loadCsvData(entityType.csvFilePath);
        };
    }

    return resolver;
}