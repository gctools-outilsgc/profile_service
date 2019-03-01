const mutations = require("../src/resolvers/Mutations");
const querys = require("../src/resolvers/Query");

const { getContext, cleanUp } = require("./init/helper");

const parent = {};
var ctx = {};

async function createTestData(context){
    const org1Args = {nameEn:"Canada School", nameFr:"Ecole de Canada", acronymEn: "CS", acronymFr:"EC" };
    const org2Args = {nameEn:"Canada Revenue", nameFr:"Revenue de Canada", acronymEn: "CR", acronymFr:"RC" };

    const profile1Args = { gcID:"10", name:"Bryan Robitaille", email:"bryan.robitaille@sslllddff.com"};
    const profile2Args = { gcID:"20", name:"Super Dave", email:"super.dave@sslllddff.com"};

    await mutations.createProfile(parent, profile1Args, context, "{gcID, name, email}");
    await mutations.createProfile(parent, profile2Args, context, "{gcID, name, email}");
    ctx.org1 = await mutations.createOrganization(parent, org1Args, context, "{id}");
    ctx.org2 = await mutations.createOrganization(parent, org2Args, context, "{id}");


    const team1Args = {nameEn:"Team 1", nameFr:"Equipe 1", owner: {gcID:"10"}, organization:{id: ctx.org1.id}};
    const team2Args = {nameEn:"Team 2", nameFr:"Equipe 2", owner: {gcID:"10"}, organization:{id: ctx.org1.id}};
    const team3Args = {nameEn:"Team 3", nameFr:"Equipe 3", owner: {gcID:"10"}, organization:{id: ctx.org1.id}};

    ctx.team1 = await mutations.createTeam(parent, team1Args, context, "{id}");
    ctx.team2 = await mutations.createTeam(parent, team2Args, context, "{id}"); 
    ctx.team3 = await mutations.createTeam(parent, team3Args, context, "{id}");  
}

beforeAll(async (done) => {
    ctx = await getContext();
    await createTestData(ctx);
    done();
});

afterAll(async (done) => {
    await cleanUp(ctx);
    done();
});

test("Default team inherits department", async () => {
    const profile3Args = {
        gcID:"30",
        name: "Bucky Barns",
        email: "bucky.barnes@blah.com",
        team: {
            id: ctx.team1.id
        }
    };
    const result = await mutations.createProfile(parent, profile3Args, ctx, "{gcID, team{id,nameEn, organization{id, nameEn}}, ownerOfTeams{id, nameEn, organization{id, nameEn}}}");
    expect(result.team.organization.id).toEqual(result.ownerOfTeams[0].organization.id);


});

