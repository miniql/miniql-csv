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
    // The name of this entity.
    //
    name: string;

    //
    // Specifies the column in the CSV file that is the primary identifying key for each entity.
    //
    primaryKey: string;

    //
    // The path to the CSV file to load for this entity type.
    //
    csvFilePath?: string; //TODO: error if neither csvFilePath or csvData is included.

    // 
    // The CSV data for this entity type.
    //
    csvData?: string;

    //
    // Specifies other entities that are related to this one.
    //
    related: IRelatedEntities;
}

//
// Configures the CSV resolver.
//
export interface ICsvResolverConfig {

}

//
// Creates the CSV resolver with a particular configuration.
//
export async function createResolver(config: ICsvResolverConfig): Promise<any> {
    return {
        movie: () => {},
        actor: () => {},
    };
}