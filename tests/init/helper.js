const { Prisma } = require("prisma-binding");
const { getDefaults } = require("../../src/Resolvers/helper/default_setup");

// Set prisma object on context
function setPrisma(context){

  context.prisma = new Prisma({
    typeDefs: "src/generated/prisma.graphql",
    endpoint: "http://localhost:4466/profile",
    });
    return context;
}

// Setup of context object
const getContext = async () => {
  var ctx = {};
  ctx.prisma = await new Prisma({
    typeDefs: "src/generated/prisma.graphql",
    endpoint: "http://localhost:4466/profile",
    });
  
  ctx.defaults = await getDefaults();
  return ctx;
};

// Wipe the database clean
async function cleanUp(context){
  await context.prisma.mutation.deleteManyAddresses();
  await context.prisma.mutation.deleteManyProfiles();
  await context.prisma.mutation.deleteManyTeams();
  await context.prisma.mutation.deleteManyOrganizations();
  
}





module.exports = {
  getContext,
  cleanUp,
  setPrisma
};
