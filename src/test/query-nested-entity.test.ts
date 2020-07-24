import { createResolver, ICsvResolverConfig } from "..";

describe("query nested entity", () => {

    it("can create map function to retreive a nested entity", async ()  => {

        const config: ICsvResolverConfig = {
            movie: {
                primaryKey: "name",
                csvFilePath: "movies.csv",
                related: {
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

        const resolver = await createResolver(config, loadTestData);
        
        const query = { 
            id: "The Bourne Identity",
            lookup: {
                director: true,
            },
        };

        const mapFn = resolver.get["movie=>director"];
        const result = await mapFn(
            {
                entity: { 
                    name: "The Bourne Identity" 
                },
            }, 
            {}
        );
        expect(result).toEqual([ "Doug Liman", ]);
    });

});
