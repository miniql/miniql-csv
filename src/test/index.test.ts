import { createResolver, ICsvResolverConfig } from "..";
import { loadPartialConfig } from "@babel/core";

describe("miniql csv resolver", () => {

    it("can create resolver for single entity", async ()  => {

        const config: ICsvResolverConfig = {
            movie: {
                csvFilePath: "movies.csv",
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

        const resolver = await createResolver(config, async (csvFilePath: string) => testCsvData);
        
        const result = await resolver.query.movie({}, {});
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

    it("can create resolver for multiple entity", async ()  => {

        const config: ICsvResolverConfig = {
            movie: {
                csvFilePath: "movies.csv",
            },
            actor: {
                csvFilePath: "actors.csv",
            },
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

        const resolver = await createResolver(config, loadTestData);

        const movies = await resolver.query.movie({}, {});
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

        const actors = await resolver.query.actor({}, {});
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
