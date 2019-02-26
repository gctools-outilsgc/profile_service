const faker = require("faker");
const config = require("../src/config");
const { Prisma } = require("prisma-binding");
const mutations = require("../src/resolvers/Mutations");
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
    const teamNumber = 20;
    // Number or profiles to create in each Organization
    const profileNumber = 4000;

    try {
        // Create n organizations
        for(var o = 0; o < orgNumber; o++){



                var orgEn = faker.fake("{{commerce.department}} {{commerce.product}}");
                var orgFr = orgEn + " - FR";
                var orgDomain = faker.internet.domainName();

                var orgArgs = {
                    nameEn: orgEn,
                    nameFr: orgFr,
                    acronymEn: faker.hacker.abbreviation(),
                    acronymFr: faker.hacker.abbreviation()
                };
                const infoOrg = "{id}";

                // Store the created org info to assign teams to the org.
                var org = await mutations.createOrganization({}, orgArgs, ctx, infoOrg);

                console.log("Created organization: " + orgArgs.nameEn);

                // These arrays will be used to handle the reporting relationships
                var teams = [];
                var profiles = [];

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
                            address: { 
                                create :{
                                    streetAddress: faker.address.streetAddress(),
                                    city: faker.address.city(),
                                    postalCode: "H0H 0H0",
                                    province: "Ontario",
                                    country: "Canada"
                                }
                            }               
            
                        }
                
                    };
                    
                    profiles.push(await ctx.prisma.mutation.createProfile(ownerArgs, "{gcID}"));
                }

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

                    var relation = Math.floor(Math.random() * x) % 19;

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
        console.error(e);
    }
}

    
seed();