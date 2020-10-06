const faker = require("faker");
const config = require("../src/config");
const { Prisma } = require("prisma-binding");
const mutations = require("../src/Resolvers/Mutations");
const random = require("randomatic");

const ctx = {
    prisma: new Prisma({
        typeDefs: "./src/generated/prisma.graphql",
        endpoint: "http://"+config.prisma.host+":4466/profile/",
        debug: config.prisma.debug,
    }) 
}; 

async function seed(){

    // Number of Organizations to Create
    const orgNumber = 3;
    // Number of Teams to create in each Organization
    const teamNumber = 500;
    // Number or profiles to create in each Organization
    const profileNumber = 4000;

    const orgList = ["Default", "Federal", "Provincial", "Municipal", "University", "College", "Other"]; 

    try {
        // Create n organizations
        for(var o = 0; o < orgNumber; o++){

                // These arrays will be used to handle the reporting relationships
                var teams = [];
                var profiles = [];

                var orgEn = faker.fake("{{commerce.department}} {{commerce.product}}");
                var orgFr = orgEn + " - FR";
                var orgDomain = faker.internet.domainName();

                var orgArgs = {
                    nameEn: orgEn,
                    nameFr: orgFr,
                    acronymEn: faker.hacker.abbreviation(),
                    acronymFr: faker.hacker.abbreviation(),
                    orgType:orgList[Math.floor(Math.random() * orgList.length)]
                };

                // Store the created org info to assign teams to the org.
                var org = await mutations.createOrganization({}, orgArgs, ctx, "{id, teams{id}}");
                teams.push(org.teams[0]);

                // eslint-disable-next-line no-console
                console.log("Created organization: " + orgArgs.nameEn);


                
                // eslint-disable-next-line no-console
                console.log("Creating " + profileNumber + " profiles");

                // Create n profiles in current organization
                for(var p = 0; p < profileNumber; p++){
                    var firstName = faker.name.firstName();
                    var lastName = faker.name.lastName();

                    var ownerArgs = {
                        data: {
                            gcID: random("aA0",25),
                            name: firstName + " " + lastName,
                            email: firstName + "." + lastName + random("a0", 3) + "@" + orgDomain,
                            avatar: faker.image.avatar(),
                            mobilePhone: faker.phone.phoneNumberFormat(),
                            officePhone: faker.phone.phoneNumberFormat(),
                            titleEn: faker.name.jobType(),
                            titleFr: faker.name.jobType(), 
                            role: "User",
                            address: { 
                                create :{
                                    streetAddress: faker.address.streetAddress(),
                                    city: faker.address.city(),
                                    postalCode: "H0H 0H0",
                                    province: "Ontario",
                                    country: "Canada"
                                }
                            },
                            ownerOfTeams:{
                                create: {
                                    nameEn:"Default Team",
                                    nameFr:"Équipe par défaut",
                                    organization: {connect: {id: org.id}}   
                                }

                            }               
            
                        }
                
                    };
                    
                    profiles.push(await ctx.prisma.mutation.createProfile(ownerArgs, "{gcID}"));
                }
                
                // eslint-disable-next-line no-console
                console.log("Creating " + teamNumber + " teams");

                // Create n teams in current organization
                for(var t = 0; t < teamNumber; t++){
                    var teamEn = faker.fake("{{name.jobDescriptor}}, {{name.jobArea}}");
                    var teamFr = teamEn + " - FR";
                    
                    var teamArgs = {
                        data: {
                            nameEn: teamEn,
                            nameFr: teamFr,
                            descriptionEn: faker.lorem.sentences(),
                            descriptionFr: faker.lorem.sentences(),
                            organization: {connect: {id: org.id}},
                            owner: {connect: {gcID: profiles[t].gcID }} 
                        }
    
                    };

                    teams.push(await ctx.prisma.mutation.createTeam(teamArgs, "{id, owner{gcID}}"));
                }

                // Assign the various profiles to teams.
                // The profiles that are owners of teams are randomly built
                // into a hierarchy and subsequent profiles are assigned randomly

                for(var x = 1; x <  profileNumber; x++){
                    // Don't need to subtract 1 from the team number due to the addition of the default team.
                    var relation = Math.floor(Math.random() * x) % teamNumber;

                    const relationshipArgs = {
                        gcID: profiles[x].gcID,
                        data:{
                            team: {
                                id: teams[relation].id
                            }
                        }

                    };

                    await mutations.modifyProfile({},relationshipArgs, ctx, "{gcID}");

                }            
            }
    } catch(e){
        // eslint-disable-next-line no-console
        console.error(e);
    }
}

    
seed();