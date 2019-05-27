const config = require("../src/config");
const { Prisma } = require("prisma-binding");
const querys = require("../src/resolvers/Query");
const mesh = require("../src/Service_Mesh/publisher_connector");
const fs = require("fs");
const { graphql } = require("graphql");
const { makeExecutableSchema, addMockFunctionsToSchema } = require("graphql-tools");
const typeDefs = fs.readFileSync("./src/schema.graphql", "utf8");
const schema = makeExecutableSchema({ typeDefs });

const ctx = {
    prisma: new Prisma({
        typeDefs: "./src/generated/prisma.graphql",
        endpoint: "http://"+config.prisma.host+":4466/profile/",
        debug: config.prisma.debug,
    }) 
}; 

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


async function connectToMesh(){
  mesh.connectMessageQueuePublisher();
  console.log("Waiting for 5 Seconds");
  await setTimeout(seed(), 5000);
}

async function seed(){
  console.log("Starting to Seed");
    try {

    // Get all profile information needed into a single JSON.
    var info = `query queryProfiles {
        profiles { gcID, name, email, mobilePhone, officePhone, titleEn, titleFr,
        team{nameEn, nameFr, organization{nameEn, nameFr, acronymEn, acronymFr}}}
      }`;
    const users = await graphql(schema, info);
    const profiles = users.data.profiles;
    
    for (var profile of profiles){
      await mesh.publishMessageQueue("profile", "profile.change", profile);
    }
    } catch(e){
        console.error(e);
    }

}
mesh.connectMessageQueuePublisher();
setTimeout(function() {
  seed();
}, 5000);

