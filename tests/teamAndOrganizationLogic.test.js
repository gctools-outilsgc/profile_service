const mutations = require("../src/resolvers/Mutations");
const querys = require("../src/resolvers/Query");

const { getContext, cleanUp, setPrisma } = require("./init/helper");

const fs = require("fs");
const { makeExecutableSchema, addMockFunctionsToSchema }
  = require("graphql-tools");
const { graphql } = require("graphql");

const typeDefs = fs.readFileSync("src/schema.graphql", "utf8");
const schema = makeExecutableSchema({ typeDefs });

const mocks = {
    Query: () => ({
      profiles: (a, b, c, d) => querys
        .profiles(
          a,
          b,
          Object.assign({}, c, {prisma: setPrisma()}),
          d
        )
    })
  };
  
  addMockFunctionsToSchema({ schema, mocks });


const createProfiles = (profiles) => {

    const promises = [];
    getContext().then((ctx) => {
        profiles.forEach((profile) => {	
            promises.push(new Promise((resolve) => {	
                mutations.createProfile({}, profile, ctx, "{gcID}")	
                .then(resolve)
                .catch((e) => {	
                    console.error(e);	
                    throw(e);	
                });	
            }));	
        });	
    });

    return Promise.all(promises);	
};


const createOrganizations = (organizations) => {
    
    const promises = [];
    getContext().then((ctx) => {
        organizations.forEach((org) => {	
            promises.push(new Promise((resolve) => {	
            mutations.createOrganization({}, org, ctx, "{id}")	
                .then(resolve)	
                .catch((e) => {	
                console.error(e);	
                throw(e);	
                });	
            }));	
        });	
        
    });	
    return Promise.all(promises);	
};

const createTeams = (teams) => {	
    const promises = [];	
    getContext().then((ctx) => {
        teams.forEach((team, idx) => {	
            promises.push(new Promise((resolve) => {	
              mutations.createTeam({}, team, ctx, "{id}")	
                .then(({ id }) => {	
                  team.id = id;	
                  resolve([idx, id]);	
                })	
                .catch((e) => {	
                  console.error(e);	
                  throw(e);	
                });	
            }));	
          });	
          
    });
    return Promise.all(promises);
};

const joinTeam = (profile, team) => {	

    return new Promise((resolve) => {	
        getContext().then((ctx) => {

            mutations.modifyProfile({}, {	
            gcID: profile.gcID,	
            data: {	
                team: {	
                id: team.id	
                }	
            }	
            }, ctx , "{gcID}")	
            .then(resolve)	
            .catch((e) => {	
                console.error(e);	
                throw(e);	
            });	
        });  
            });
	
};

describe("User being created", () => {
    const orgs = [
        {nameEn:"Org 1", nameFr:"Org 1", acronymEn: "O1", acronymFr:"O1" }
    ];
    const teams = [
        {nameEn:"Team 1", nameFr:"Equipe 1", owner: {}, organization:{}}
    ];
    const profiles = [
        { gcID:"10", name:"Bryan Robitaille", email:"bryan.robitaille@sslllddff.com"}
    ];

    beforeAll((done) => {
        createProfiles(profiles).then(() => {
            createOrganizations(orgs).then(([{id: orgID}]) => {
                teams[0].organization.id = orgID;
                teams[0].owner.gcID = profiles[0].gcID;
                createTeams(teams).then(() => {
                    done();
                });
            });
        });
    });

    it("Profile's default team should inherit department", async() => {
        const query = "query createTest { profiles(gcID: \"10\") { team { organization { nameEn } } }";	
        const data = await graphql(schema, query);
        expect(data.team.organization.nameEn).toEqual(orgs[0].nameEn);

    });

    afterAll((done) => {
        getContext().then((ctx) => {
          cleanUp(ctx);  
        }).then(() => {
            done();
        });
    });



});

/*

    const orgs = [
        {nameEn:"Org 1", nameFr:"Org 1", acronymEn: "O1", acronymFr:"O1" },
        {nameEn:"Org 2", nameFr:"Org 2", acronymEn: "O2", acronymFr:"O2" }
    ];

    const profiles = [
        { gcID:"10", name:"Bryan Robitaille", email:"bryan.robitaille@sslllddff.com"},
        { gcID:"20", name:"Super Steph", email:"super.steph@sslllddff.com"},
        { gcID:"30", name:"Super Troy", email:"super.troy@sslllddff.com"},
        { gcID:"40", name:"Super Ethan", email:"super.ethan@sslllddff.com"},
        { gcID:"50", name:"Super Nick", email:"super.nick@sslllddff.com"},
        { gcID:"60", name:"Super Rajeev", email:"super.rajeev@sslllddff.com"},
    ];

    const teams = [
        {nameEn:"Team 1", nameFr:"Equipe 1", owner: {gcID:"10"}, organization:{id: context.org[0].id}},
        {nameEn:"Team 2", nameFr:"Equipe 2", owner: {gcID:"20"}, organization:{id: context.org[0].id}},
        {nameEn:"Team 3", nameFr:"Equipe 3", owner: {gcID:"30"}, organization:{id: context.org[0].id}},
        {nameEn:"Team 4", nameFr:"Equipe 4", owner: {gcID:"40"}, organization:{id: context.org[0].id}},
        {nameEn:"Team 5", nameFr:"Equipe 5", owner: {gcID:"50"}, organization:{id: context.org[0].id}},
        {nameEn:"Team 6", nameFr:"Equipe 6", owner: {gcID:"60"}, organization:{id: context.org[1].id}},
    ];

    // Build org structure
    // Org 1
    //      team1 -> team 2
    //            -> team 3 -> team 4
    //                      -> team 5
    // Org 2 
    //      team 6

    const orgStructure = [
        {gcID:"20", data: {team: {id: context.team[0].id}}},
        {gcID:"30", data: {team: {id: context.team[0].id}}},
        {gcID:"40", data: {team: {id: context.team[2].id}}},
        {gcID:"50", data: {team: {id: context.team[2].id}}}
    ];



test("Team moving organizations propagates to all child teams", (done) => {
    console.log("Start of test for child nodes");
    return mutations.modifyProfile(parent, 
        {
            gcID: "10",
            data: {
                team:{
                    id: ctx.team[5].id
                }
            }
        }, ctx, "{gcID}"
    ).then((result) => {
        querys.teams(parent, {id: ctx.team[4].id}, ctx, "{organization{id}}");
    }).then((queryResult) => {
        expect(queryResult[0].organization.id).toEqual(ctx.org[1].id);
        done();
    }).catch((e) => {
        console.log(e);
        done();
    });

});

*/

