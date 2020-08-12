import { createQueryResolver, IQueryResolverConfig, ICsvFileConfig } from "..";

describe("query entity", () => {

    it("can create resolver to retreive single entity", async ()  => {

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
        
        const args = { 
            name: "The Bourne Identity",
        };
        const result = await resolver.get.movie.invoke(args, {});
        expect(result).toEqual({
            name: "The Bourne Identity",
            year: 2002,
        });
    });

});
