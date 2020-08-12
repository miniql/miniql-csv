import { createQueryResolver, IQueryResolverConfig, ICsvFileConfig } from "..";

describe("query entities", () => {

    it("can create resolver to retreive multiple entities", async ()  => {

        const config: IQueryResolverConfig = {
            entities: {
                movie: {
                    primaryKey: "name",
                },
            },
        };

        const testCsvData = [
            {
                name: "The Bourne Identity",
                year: 2002,
            },
            {
                name: "Minority Report",
                year: 2002,
            },
        ];

        const csvFiles: ICsvFileConfig = {
            movie: "movies.csv",
        };

        const resolver = await createQueryResolver(config, csvFiles, async (csvFilePath: string) => testCsvData);
        
        const result = await resolver.get.movie.invoke({}, {});
        expect(result).toEqual([
            {
                name: "The Bourne Identity",
                year: 2002,
            },
            {
                name: "Minority Report",
                year: 2002,
            },
        ]);
    });

    it("can create resolver for multiple entity types", async ()  => {

        const config: IQueryResolverConfig = {
            entities: {
                movie: {
                    primaryKey: "name",
                },
                actor: {
                    primaryKey: "name",
                },
            },
        };

        const csvFiles: ICsvFileConfig = {
            movie: "movies.csv",
            actor: "actors.csv",
        };

        const movieTestData = [
            {
                name: "The Bourne Identity",
                year: 2002,
            },
            {
                name: "Minority Report",
                year: 2002,
            },
        ];

        const actorTestData = [
            {
                name: "Matt Daemon",
            },
            {
                name: "Tom Cruise",
            },
        ];

        async function loadTestData(csvFilePath: string): Promise<any[]> {
            if (csvFilePath === "movies.csv") {
                return movieTestData;
            }
            else if (csvFilePath === "actors.csv") {
                return actorTestData;
            }
            else {
                throw new Error(`Unexpected CSV file path "${csvFilePath}".`);
            }
        }

        const resolver = await createQueryResolver(config, csvFiles, loadTestData);

        const movies = await resolver.get.movie.invoke({}, {});
        expect(movies).toEqual([
            {
                name: "The Bourne Identity",
                year: 2002,
            },
            {
                name: "Minority Report",
                year: 2002,
            },
        ]);

        const actors = await resolver.get.actor.invoke({}, {});
        expect(actors).toEqual([
            {
                name: "Matt Daemon",
            },
            {
                name: "Tom Cruise",
            },
        ]);
    });
});
