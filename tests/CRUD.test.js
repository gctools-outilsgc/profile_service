const fs = require("fs");
const { makeExecutableSchema, addMockFunctionsToSchema }
  = require("graphql-tools");
const { graphql } = require("graphql");

const mutations = require("../src/resolvers/Mutations");
const querys = require("../src/resolvers/Query");

const { getContext, cleanUp } = require("./init/helper");
const parent = {};

const typeDefs = fs.readFileSync("src/schema.graphql", "utf8");
const schema = makeExecutableSchema({ typeDefs });

var ctx = {};

const mocks = {
  Query: () => ({
    profiles: (a, b, c, d) => querys
      .profiles(
        a,
        b,
        Object.assign({}, c, ctx),
        d
      )
  })
};

addMockFunctionsToSchema({ schema, mocks });

beforeAll(async (done) => {
    ctx = await getContext();
    done();
});

afterAll(async (done) => {
    await cleanUp(ctx);
    done();
});

test("Create Organization", async() => {

    var args = {
        nameEn: "Organization Test EN",
        nameFr: "Organization Test FR",
        acronymEn: "OTEN",
        acronymFr: "OTFR"
    };

    const info = "{ nameEn, nameFr, acronymEn, acronymFr }";

    expect(
        await mutations.createOrganization(parent, args, ctx, info)
    ).toMatchSnapshot();
});

test("Create a Team", async() => {

    const organizationID = await querys.organizations(parent, {nameEn:"Organization Test EN"}, ctx, "{id}");
    await mutations.createProfile(parent,{gcID:"0834haf", name: "Supervisor Test", email:"supervisor@somewhere.com"}, ctx, "{gcID, name}");

    var args = {
        nameEn: "Team Name EN",
        nameFr: "Team Name FR",
        descriptionEn: "Team description English",
        descriptionFr: "Team description French",
        colour: "#03cdf",
        organization: {id: organizationID[0].id},
        owner: {gcID: "0834haf"}
    };


    const info = "{nameEn, nameFr, descriptionEn, descriptionFr, colour, organization{nameEn}, owner{gcID, name, email}}";

    expect(
        await mutations.createTeam(parent, args, ctx, info)
    ).toMatchSnapshot();
});

test("Create profile without avatar", async() => {
    var argAddress = {
        streetAddress: "98 where",
        city: "somewhere",
        postalCode: "H0H 0H0",
        province: "Ontario",
        country: "Canada"
    };

    const teamID = await querys.teams(parent, {nameEn:"Team Name EN"}, ctx, "{id}");

    const args = {
        gcID: "kjsdf09iklasd",
        name: "Awesome User",
        email: "awesome.user@somewhere.com",
        mobilePhone: "613-999-0897",
        officePhone: "(879) 234-2341",
        titleEn: "Super Dave",
        titleFr: "Super Dave in French",
        address: argAddress,
        team: {
            id: teamID[0].id
        }
    };

    const info = "{ gcID, name, email, mobilePhone, officePhone, titleEn, titleFr, " +
    "address {streetAddress, city, province, postalCode, country}," +
    "team{nameEn, nameFr, organization{nameEn, nameFr, acronymEn, acronymFr}," +
    "owner{name, email}, members{gcID, name, email}},}";

    expect(
        await mutations.createProfile(parent, args, ctx, info)
    ).toMatchSnapshot();
});

test("Modify Organization", async() => {
    var organizationID = await querys.organizations(parent, {nameEn:"Organization Test EN"}, ctx, "{id}");
    var args = {
        id: organizationID[0].id,
        data: {
            nameEn: "Organization Test EN - Mod 1",
            nameFr: "Organization Test FR - Mod 1",
            acronymEn: "OTEN - Mod 1",
            acronymFr: "OTFR - Mod 1"
        }
    };

    const info = "{ nameEn, nameFr, acronymEn, acronymFr }";

    expect(
        await mutations.modifyOrganization(parent, args, ctx, info)
    ).toMatchSnapshot();

});

test("Modify Team", async() => {
    const organizationData = {
        nameEn: "Organization Test EN 2",
        nameFr: "Organization Test FR 2",
        acronymEn: "OTEN 2",
        acronymFr: "OTFR 2"
    };

    const organizationID = await mutations.createOrganization(parent, organizationData, ctx, "{id}");
    await mutations.createProfile(parent,{gcID:"9283982", name: "Supervisor Test 2", email:"supervisor2@somewhere.com"}, ctx, "{gcID}");
    const teamID = await querys.teams(parent, {nameEn:"Team Name EN"}, ctx, "{id}");

    var args = {
        id: teamID[0].id,
        data:{
            nameEn: "Team Name EN - Mod 1",
            nameFr: "Team Name FR - Mod 1",
            descriptionEn: "English Description modified",
            descriptionFr: "French Description modified",
            colour: "9988e",
            organization: {id: organizationID.id},
            owner: {gcID: "9283982"}
        }
    };

    const info = "{nameEn, nameFr, descriptionEn, descriptionFr, colour, organization{nameEn}, owner{gcID, name, email}}";
    expect(
        await mutations.modifyTeam(parent, args, ctx, info)
    ).toMatchSnapshot();
});

test("Modify Profile", async() => {
    var argAddress = {
        streetAddress: "101 Kratos",
        city: "Vallhala",
        postalCode: "Z9P 8A0",
        province: "Crete",
        country: "Greece"
    };

    const teamID = await querys.teams(parent, {nameEn:"Team Name EN - Mod 1"}, ctx, "{id}");

    const args = {
            gcID: "kjsdf09iklasd",
            data: {
                name: "Kratos",
                email: "kratos@somewhere.com",
                mobilePhone: "819-234-6345",
                officePhone: "(613) 295-9093",
                titleEn: "God of War",
                titleFr: "Dieu de la guerre",
                address: argAddress,
                team: {
                    id: teamID[0].id
                }
            }
    };

    const info = "{ gcID, name, email, mobilePhone, officePhone, titleEn, titleFr, " +
    "address {streetAddress, city, province, postalCode, country}," +
    "team{nameEn, nameFr, organization{nameEn, nameFr, acronymEn, acronymFr}," +
    "owner{name, email}, members{gcID, name, email}}}";

    expect(
        await mutations.modifyProfile(parent, args, ctx, info)
    ).toMatchSnapshot();

});

test("Modify Profile without existing Address", async() => {
    const info = "{gcID, name, email, address{streetAddress, city, province, postalCode, country}}";
    const profileArgs = {
        gcID:"3948371",
        name:"Camera Man",
        email:"cameraman@somewhere.com"
    };

    const modifyProfileArgs = {
        gcID:"3948371",
        data:{
            address:{
                streetAddress:"322 Princess Way",
                city: "Moncton",
                province:"New Brunswick",
                postalCode:"F3S 6D3",
                country:"Canada"
            }
        }
    };

    await mutations.createProfile(parent, profileArgs, ctx, "{gcID, name, email}");

    expect(
        await mutations.modifyProfile(parent, modifyProfileArgs, ctx, info)
    ).toMatchSnapshot();

});

// Query everything in system
test("Query Profiles", async() => {
    const info = `
    query queryProfiles {
      profiles { gcID, name, email, mobilePhone, officePhone, titleEn, titleFr,
      address {streetAddress, city, province, postalCode, country},
      team{nameEn, nameFr, organization{nameEn, nameFr, acronymEn, acronymFr},
      owner{name, email}, members{gcID, name, email}} }
    }`;
    const profiles = await(graphql(schema, info));
    await expect(profiles).toMatchSnapshot();
});

test("Query Addresses", async() => {
    const info = "{streetAddress, city, province, postalCode, country, resident{gcID,name,email}}";
    expect(
        await querys.addresses(parent, {}, ctx, info)
    ).toMatchSnapshot();
});

test("Delete Profile", async() => {
const args = {gcID:"9283982"};

const info = "{gcID}";

expect(
    await mutations.deleteProfile(parent, args, ctx)
).toMatchSnapshot();

});

test("Delete Profile that doesn't exist", async () => {
    const args = {gcID:"aaaassssdddddfffff"};

    try{
        await mutations.deleteProfile(parent, args, ctx);
    } catch(e){
        expect(e.message).toMatch("Profile does not exist");
    }

});

test("Delete Team", async() => {
  
    const organizationData = {
      nameEn: "Organization Test EN 2",
      nameFr: "Organization Test FR 2",
      acronymEn: "OTEN 2",
      acronymFr: "OTFR 2"
    };

    const organizationID = await mutations.createOrganization(parent, organizationData, ctx, "{id}");
    await mutations.createProfile(parent,{gcID:"9283982111", name: "Supervisor Test 2", email:"supervisor2@somewhere.com"}, ctx, "{gcID}");
    var args = {
      nameEn: "Team Name EN",
      nameFr: "Team Name FR",
      organization: {id: organizationID.id},
      owner: {gcID: "9283982111"}
    };

    const info = "{id}";
    const { id } = await mutations.createTeam(parent, args, ctx, info);

    expect(
        await mutations.deleteTeam(parent, { id }, ctx)
    ).toMatchSnapshot();

});

test("Delete Team that doesn't exist", async () => {
 
    const args = {id: "234asdfasss"};

    try {
        await mutations.deleteTeam(parent, args, ctx);
    } catch(e){
        expect(e.message).toMatch("Team does not exist");
    }
});

test("Delete Organization", async() => {
    const organizationID = await querys.organizations(parent, {nameEn:"Organization Test EN - Mod 1"}, ctx, "{id}");
    const args = {id: organizationID[0].id};

    expect(
        await mutations.deleteOrganization(parent, args, ctx)
    ).toMatchSnapshot();
});

test("Delete Organization that does not exist", async () => {
    const organizationID = "2345677";
    const args = {id: organizationID};

    try {
        await mutations.deleteOrganization(parent, args, ctx);
    } catch(e){
        expect(e.message).toMatch("Organization does not exist");
    }
});
