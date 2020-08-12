import { createQueryResolver, IQueryResolverConfig, ICsvFileConfig } from "..";

describe("query nested entity", () => {

    it("can create function to retreive a nested entity", async ()  => {

        const config: IQueryResolverConfig = {
            entities: {
                movie: {
                    primaryKey: "name",
                    nested: {
                        director: {
                            parentKey: "directorId",
                        },
                    },
                },
                director: {
                    primaryKey: "id",
                },
            },
        };

        const directorsTestData = [
            {
                id: "1234",
                name: "Doug Liman",
            },
        ];

        const csvFiles: ICsvFileConfig = {
            movie: "movies.csv",
            director: "directors.csv",
        };

        async function loadTestData(csvFilePath: string): Promise<any[]> {
            if (csvFilePath === "directors.csv") {
                return directorsTestData;
            }
            else {
                throw new Error(`Unexpected CSV file path "${csvFilePath}".`);
            }
        }

        const resolver = await createQueryResolver(config, csvFiles, loadTestData);
        
        const parentEntity = {
            name: "The Bourne Identity",
            year: 2002,
            directorId: "1234",
        };

        const result = await resolver.get.movie.nested!.director.invoke(parentEntity, {}, {});
        expect(result).toEqual({
            id: "1234",
            name: "Doug Liman",
        });
    });

    it("can create function to retreive multiple nested entities", async ()  => {

        const config: IQueryResolverConfig = {
            entities: {
                movie: {
                    primaryKey: "name",
                    nested: {
                        director: {
                            multiple: true,
                            parentKey: "name", //TODO: I kind of feel like this should be implied from the primaryKey.
                            foreignKey: "movie",
                        },
                    },
                },
                director: {
                    primaryKey: "name",
                },
            },
        };

        const moviesTestData = [
            {
                name: "The Bourne Identity",
                year: 2002,
            },
        ];

        const directorsTestData = [
            {
                name: "Doug Liman",
                movie: "The Bourne Identity",
            },
        ];

        const csvFiles: ICsvFileConfig = {
            movie: "movies.csv",
            director: "directors.csv",
        };

        async function loadTestData(csvFilePath: string): Promise<any[]> {
            if (csvFilePath === "movies.csv") {
                return moviesTestData;
            }
            else if (csvFilePath === "directors.csv") {
                return directorsTestData;
            }
            else {
                throw new Error(`Unexpected CSV file path "${csvFilePath}".`);
            }
        }

        const resolver = await createQueryResolver(config, csvFiles, loadTestData);
        
        const parentEntity = { 
            name: "The Bourne Identity",
        };

        const result = await resolver.get.movie.nested!.director.invoke(parentEntity, {}, {});
        expect(result).toEqual([ 
            {
                name: "Doug Liman",
                movie: "The Bourne Identity",
            },
        ]);
    });
});
