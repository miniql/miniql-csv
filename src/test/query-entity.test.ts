import { createResolver, ICsvResolverConfig } from "..";

describe("query entity", () => {

    it("can create resolver to retreive single entity", async ()  => {

        const config: ICsvResolverConfig = {
            movie: {
                primaryKey: "name",
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
        
        const query = { id: "The Bourne Identity" };
        const result = await resolver.query.movie(query, {});
        expect(result).toEqual({
            name: "The Bourne Identity",
            year: 2002,
        });
    });

});