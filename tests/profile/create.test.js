const mutations = require("../../src/resolvers/Mutations");
const querys = require("../../src/resolvers/Query");

const { getPrismaTestInstance } = require("../prismaTestInstance");

afterAll(async () => {
    await getPrismaTestInstance().mutation.deleteManyProfiles({});
    await getPrismaTestInstance().mutation.deleteManyTeams({});
    await getPrismaTestInstance().mutation.deleteManyOrganizations({});
});

test("Create Organization", async() => {

    const parent= {};

    var args = {
        nameEn: "Organization Test EN",
        nameFr: "Organization Test FR",
        acronymEn: "OTEN",
        acronymFr: "OTFR"
    };

    const ctx = {
        prisma: getPrismaTestInstance()
    };
    
    const info = "{ nameEn, nameFr, acronymEn, acronymFr }";

    expect(
        await mutations.createOrganization(parent, args, ctx, info)
    ).toMatchSnapshot();
});

test("Create a Team", async() => {

    const parent = {};
    const ctx = {
        prisma: getPrismaTestInstance()
    };

    const org = await querys.organizations(parent, {nameEn:"Organization Test EN"}, ctx, "{id}");
    await mutations.createProfile(parent,{gcID:"0834haf", name: "Supervisor Test", email:"supervisor@somewhere.com"}, ctx, "{gcID, name}");



    var args = {
        nameEn: "Team Name EN",
        nameFr: "Team Name FR",
        organization: {id: org["id"]},
        OwnerID: {gcID: "0834haf"}
    };


    const info = "{nameEn, nameFr, organization{id, nameEn}, ownerID{gcID, name, email}}";

    expect(
        await mutations.createTeam(parent, args, ctx, info)
    ).toMatchSnapshot();
});

test("Create profile without avatar", async() => {
    const parent = {};
    var argAddress = {
        streetAddress: "98 where",
        city: "somewhere",
        postalCode: "H0H 0H0",
        province: "Ontario",
        country: "Canada"
    };

    var supervisor = {
        gcID: "4536"
    };

    
    const args = {
            gcID: "asdf123456",
            name: "Awesome User",
            email: "awesome.user@somewhere.com",
            mobilePhone: "613-999-0897",
            officePhone: "(879) 234-2341",
            titleEn: "Super Dave",
            titleFr: "Super Dave in French",
            address: argAddress
    };

    const ctx = {
        prisma: getPrismaTestInstance()
    };

    const info = "{ gcID, name, email, mobilePhone, officePhone, titleEn, titleFr, address {streetAddress, city, province, postalCode, country} }";

    expect(
        await mutations.createProfile(parent, args, ctx, info)
    ).toMatchSnapshot();
});