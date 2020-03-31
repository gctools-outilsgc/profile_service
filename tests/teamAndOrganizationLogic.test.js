const mutations = require("../src/Resolvers/Mutations");
const querys = require("../src/Resolvers/Query");

const { getContext, cleanUp, setPrisma } = require("./init/helper");

const fs = require("fs");
const { makeExecutableSchema, addMockFunctionsToSchema }
  = require("graphql-tools");
const { graphql } = require("graphql");

const typeDefs = fs.readFileSync("src/schema.graphql", "utf8");
const schema = makeExecutableSchema({ typeDefs });

var prismaContext={};
const mocks = {
    Query: () => ({
      profiles: (a, b, c, d) => {
          return querys.profiles(a, b, Object.assign({}, c, setPrisma(prismaContext)), d);
      }
    })
  };
  
  addMockFunctionsToSchema({ schema, mocks });


const createProfiles = (profiles) => {

    const promises = [];
    return getContext().then((ctx) => {
        profiles.forEach((profile) => {	
            promises.push(new Promise((resolve) => {	
                mutations.createProfile({}, profile, ctx, "{gcID}")	
                .then(resolve)
                .catch((e) => {	
                    // eslint-disable-next-line no-console
                    console.error(e);	
                    throw(e);	
                });	
            }));	
        });	

    return Promise.all(promises);

    });	
};

const createOrganizations = (organizations) => {
    
    const promises = [];
    return getContext().then((ctx) => {
        organizations.forEach((org) => {	
            promises.push(new Promise((resolve) => {	
            mutations.createOrganization({}, org, ctx, "{id}")	
                .then(resolve)	
                .catch((e) => {	
                    // eslint-disable-next-line no-console
                    console.error(e);	
                    throw(e);	
                });	
            }));	
        });	
    return Promise.all(promises); 
    });	
};

const createTeams = (teams) => {	
    const promises = [];	
    return getContext().then((ctx) => {
        teams.forEach((team, idx) => {	
            promises.push(new Promise((resolve) => {	
              mutations.createTeam({}, team, ctx, "{id}")	
                .then(({ id }) => {	
                  team.id = id;	
                  resolve([idx, id]);	
                })	
                .catch((e) => {
                    // eslint-disable-next-line no-console	
                    console.error(e);	
                    throw(e);	
                });	
            }));	
          });	
    return Promise.all(promises);          
    });
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
                // eslint-disable-next-line no-console
                console.error(e);	
                throw(e);	
            });	
        });  
            });
	
};


describe("Org chart Logic", () => {
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
        {nameEn:"Team 1", nameFr:"Equipe 1", owner: {}, organization:{}},
        {nameEn:"Team 2", nameFr:"Equipe 2", owner: {}, organization:{}},
        {nameEn:"Team 3", nameFr:"Equipe 3", owner: {}, organization:{}},
        {nameEn:"Team 4", nameFr:"Equipe 4", owner: {}, organization:{}},
        {nameEn:"Team 5", nameFr:"Equipe 5", owner: {}, organization:{}},
        {nameEn:"Team 6", nameFr:"Equipe 6", owner: {}, organization:{}},
    ];
    
    // Org structure
    // Org 1
    //      team1 -> team 2
    //            -> team 3 -> team 4
    //                      -> team 5
    // Org 2 
    //      team 6
    


    beforeEach((done) => {

        createProfiles(profiles).then(() => {
            createOrganizations(orgs).then((orgIDs) => {
                for (let x = 0; x < teams.length; x += 1) {	
                    const team = teams[x];
                    if (x <=4){
                        team.organization.id = orgIDs[0].id;
                    } else {
                        team.organization.id = orgIDs[1].id;
                    }	
	
                    team.owner.gcID = profiles[x].gcID;	
                }
                createTeams(teams).then((data) => {	
                    const promises = [];
                  
                    promises.push(joinTeam(profiles[1], {id: data[0][1]}));	
                    promises.push(joinTeam(profiles[2], {id: data[0][1]}));
                    promises.push(joinTeam(profiles[3], {id: data[2][1]}));	
                    promises.push(joinTeam(profiles[4], {id: data[2][1]}));		
                    
                    Promise.all(promises).then(() => {	
                        done();	
                    });		
                });
            });
        });   
    });

    afterEach((done) => {
        getContext().then((ctx) => {
          return cleanUp(ctx);  
        }).then(() => {
            done();
        });

    });

    it("Profile's default team should inherit department", async() => {

        const query = "query orgTest { profiles(gcID: \"20\") { gcID, ownerOfTeams { organization { nameEn } } } }";	
        const queryData = await graphql(schema, query);
        expect(queryData.data.profiles[0].ownerOfTeams[0].organization.nameEn).toEqual(orgs[0].nameEn); 

    });

    it("Profile's child teams should follow to new Organization", async() => {


        const ctx = await getContext();

        const orgData = await querys.organizations({}, {nameEn:"Org 2"}, ctx, "{teams {id, nameEn } }");

        await mutations.modifyProfile({},{gcID:"10", data:{ team:{ id: orgData[0].teams[0].id}}} , ctx, "{ team {id, organization { nameEn } } }");

        const query = "query orgTest { profiles(gcID: \"50\") { gcID, team { organization { nameEn } } } }";
        const queryData =await graphql(schema, query);            

        expect(queryData.data.profiles[0].team.organization.nameEn).toEqual("Org 2");         

    

    });

    it("Deleted teams members should be transferred to the supervisors default team", async() => {
        const ctx = await getContext();

        const teamData = await querys.teams({},{nameEn:"Team 3"}, ctx, "{id}");

        const deleteSuccess = await mutations.deleteTeam({},{id: teamData[0].id}, ctx);

        const query = "query orgTest { profiles(gcID: \"40\") { gcID, team { nameEn, owner { gcID } } } }";
        const queryData = await graphql(schema, query);


        expect(queryData.data.profiles[0].team.owner.gcID).toEqual("30");
        expect(queryData.data.profiles[0].team.nameEn).toEqual("Default Team");
        expect(deleteSuccess).toBeTruthy();    



    });



});
