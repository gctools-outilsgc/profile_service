const mutations = require("../src/resolvers/Mutations");
const { getPrismaTestInstance } = require("./init/prismaTestInstance");

test("create a basic profile with mandatory fields",  async() => {
    const parent = {};
    const args = {
            gcID: "asdf123456",
            name: "Awesome User",
            email: "awesome.user@somewhere.com"
    };

    const ctx = {
        prisma: getPrismaTestInstance()
    };

    const info = "{ gcID, name, email }";

    expect(
        await mutations.createProfile(parent, args, ctx, info),
    ).toMatchSnapshot();

    await getPrismaTestInstance().mutation.deleteProfile({where:{gcID:"asdf123456"}});
});

test("fail profile creation due to missing gcID", async() => {
    try {
        const parent = {};
        const args = {
            name: "Awesome User",
            email: "awesome.user@somewhere.com"
        };
        
        const ctx = {
            prisma: getPrismaTestInstance()
        };
        
        const info = "{ gcID, name, email }";
        
        const result = await mutations.createProfile(parent, args, ctx, info);
        expect(0).toBe(1);
    } catch (e) {
        expect(e.toString()).toMatchSnapshot();
    }
});

test("fail profile creation due to missing name", async() => {
    try {
        const parent = {};
        const args = {
            gcID: "asdf123456",
            email: "awesome.user@somewhere.com"
        };
        
        const ctx = {
            prisma: getPrismaTestInstance()
        };
        
        const info = "{ gcID, name, email }";
        
        const result = await mutations.createProfile(parent, args, ctx, info);
        expect(0).toBe(1);
    } catch (e) {
        expect(e.toString()).toMatchSnapshot();
    }
});

test("fail profile creation due to missing email", async() => {
    try {
        const parent = {};
        const args = {
            gcID: "asdf123456",
            name: "Awesome User",
        };
        
        const ctx = {
            prisma: getPrismaTestInstance()
        };
        
        const info = "{ gcID, name, email }";
        
        const result = await mutations.createProfile(parent, args, ctx, info);
        expect(0).toBe(1);
    } catch (e) {
        expect(e.toString()).toMatchSnapshot();
    }
});