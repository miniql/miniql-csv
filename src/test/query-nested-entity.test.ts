import { createQueryResolver, ICsvResolverConfig } from "..";

describe("query nested entity", () => {

    it("can create function to retreive a nested entity", async ()  => {

        const config: ICsvResolverConfig = {
            movie: {
                primaryKey: "name",
                csvFilePath: "movies.csv",
                nested: {
                    director: {
                        parentKey: "directorId",
                    },
                },
            },
            director: {
                primaryKey: "id",
                csvFilePath: "directors.csv",
            },
        };

        const directorsTestData = [
            {
                id: "1234",
                name: "Doug Liman",
            },
        ];

        async function loadTestData(csvFilePath: string): Promise<any[]> {
            if (csvFilePath === "directors.csv") {
                return directorsTestData;
            }
            else {
                throw new Error(`Unexpected CSV file path "${csvFilePath}".`);
            }
        }

        const resolver = await createQueryResolver(config, loadTestData);
        
        const parentEntity = {
            name: "The Bourne Identity",
            year: 2002,
            directorId: "1234",
        };

        const result = await resolver.get.movie.nested.director.invoke(parentEntity, {}, {});
        expect(result).toEqual({
            id: "1234",
            name: "Doug Liman",
        });
    });

    it("can create function to retreive a nested entities", async ()  => {

        const config: ICsvResolverConfig = {
            movie: {
                primaryKey: "name",
                csvFilePath: "movies.csv",
                nested: {
                    director: {
                        foreignKey: "movie",
                    },
                },
            },
            director: {
                primaryKey: "name",
                csvFilePath: "directors.csv",
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

        const resolver = await createQueryResolver(config, loadTestData);
        
        const parentEntity = { 
            name: "The Bourne Identity",
        };

        const result = await resolver.get.movie.nested.director.invoke(parentEntity, {}, {});
        expect(result).toEqual([ 
            {
                name: "Doug Liman",
                movie: "The Bourne Identity",
            },
        ]);
    });
});
