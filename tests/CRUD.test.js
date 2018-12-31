const mutations = require("../src/resolvers/Mutations");
const querys = require("../src/resolvers/Query");

const { getPrismaTestInstance } = require("./init/prismaTestInstance");
const parent = {};
const ctx = {
    prisma: getPrismaTestInstance()
};

afterAll(async () => {
    await getPrismaTestInstance().mutation.deleteManyProfiles({});
    await getPrismaTestInstance().mutation.deleteManyTeams({});
    await getPrismaTestInstance().mutation.deleteManyOrganizations({});
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
        organization: {id: organizationID[0].id},
        owner: {gcID: "0834haf"}
    };


    const info = "{nameEn, nameFr, organization{nameEn}, owner{gcID, name, email}}";

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

    var supervisorID = {
        gcID: "0834haf"
    };

    const teamID = await querys.teams(parent, {nameEn:"Team Name EN"}, ctx, "{id}");
    
    const args = {
            gcID: "asdf123456",
            name: "Awesome User",
            email: "awesome.user@somewhere.com",
            mobilePhone: "613-999-0897",
            officePhone: "(879) 234-2341",
            titleEn: "Super Dave",
            titleFr: "Super Dave in French",
            address: argAddress,
            supervisor: supervisorID,
            team: {
                id: teamID[0].id
            }
    };

    const info = "{ gcID, name, email, mobilePhone, officePhone, titleEn, titleFr, " +
    "address {streetAddress, city, province, postalCode, country}," +
    "team{nameEn, nameFr, organization{nameEn, nameFr, acronymEn, acronymFr}," +
    "owner{name, email}, members{gcID, name, email}}, supervisor{gcID, name, email} }";

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
            organization: {id: organizationID.id},
            owner: {gcID: "9283982"}            
        }
    };

    const info = "{nameEn, nameFr, organization{nameEn}, owner{gcID, name, email}}";
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

    var supervisorID = {
        gcID: "9283982"
    };

    const teamID = await querys.teams(parent, {nameEn:"Team Name EN - Mod 1"}, ctx, "{id}");
    
    const args = {
            gcID: "asdf123456",
            data: {
                name: "Kratos",
                email: "kratos@somewhere.com",
                mobilePhone: "819-234-6345",
                officePhone: "(613) 295-9093",
                titleEn: "God of War",
                titleFr: "Dieu de la guerre",
                address: argAddress,
                supervisor: supervisorID,
                team: {
                    id: teamID[0].id
                }
            }
    };

    const info = "{ gcID, name, email, mobilePhone, officePhone, titleEn, titleFr, " +
    "address {streetAddress, city, province, postalCode, country}," +
    "team{nameEn, nameFr, organization{nameEn, nameFr, acronymEn, acronymFr}," +
    "owner{name, email}, members{gcID, name, email}}, supervisor{gcID, name, email} }";

    expect(
        await mutations.modifyProfile(parent, args, ctx, info)
    ).toMatchSnapshot();

});