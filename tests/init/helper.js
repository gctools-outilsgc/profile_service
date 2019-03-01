const { Prisma } = require("prisma-binding");
const { getDefaults } = require("../../src/resolvers/helper/default_setup");

async function setPrisma(context){
  context.prisma = await new Prisma({
    typeDefs: "src/generated/prisma.graphql",
    endpoint: "http://localhost:4466/profile",
  });

  return context;
}


async function getContext() {
  var context = {};
  const ctx = await setPrisma(context)
  .then(async (result) => {
    result.defaults = await getDefaults();
    return result;
  });

  return ctx;

}

async function cleanUp(context){
  await context.prisma.mutation.deleteManyAddresses();
  await context.prisma.mutation.deleteManyProfiles();
  await context.prisma.mutation.deleteManyTeams();
  await context.prisma.mutation.deleteManyOrganizations();
}





module.exports = {
  getContext,
  cleanUp
};
