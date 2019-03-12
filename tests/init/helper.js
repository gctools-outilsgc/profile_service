const { Prisma } = require("prisma-binding");
const { getDefaults } = require("../../src/resolvers/helper/default_setup");

function setPrisma(context){

  context.prisma = new Prisma({
    typeDefs: "src/generated/prisma.graphql",
    endpoint: "http://localhost:4466/profile",
    });
    return context;
}


const getContext = async () => {
  var ctx = {};
  ctx.prisma = await new Prisma({
    typeDefs: "src/generated/prisma.graphql",
    endpoint: "http://localhost:4466/profile",
    });
  
  ctx.defaults = await getDefaults(ctx);
  return ctx;
};

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
