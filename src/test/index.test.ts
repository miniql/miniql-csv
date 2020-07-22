import { createResolver, ICsvResolverConfig } from "..";

describe("miniql csv resolver", () => {

    it("can create resolver for single entity", async ()  => {

        const config: ICsvResolverConfig = {
            movie: {
            },
        };
        const resolver = await createResolver(config);
        expect(resolver.query.movie).toBeInstanceOf(Function);
    });

    it("can create resolver for multiple entity", async ()  => {

        const config: ICsvResolverConfig = {
            movie: {
            },
            actor: {

            },
        };
        const resolver = await createResolver(config);
        expect(resolver.query.movie).toBeInstanceOf(Function);
        expect(resolver.query.actor).toBeInstanceOf(Function);

    });
});
