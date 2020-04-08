const config = require("../src/config");
const { Prisma } = require("prisma-binding");
const got = require('got');
const { GraphQLError } = require("graphql");
const { createProfile } = require("../src/Resolvers/Mutations");
const { getDefaults } = require("../src/Resolvers/helper/default_setup");

const ctx = {
    prisma: new Prisma({
        typeDefs: "./src/generated/prisma.graphql",
        endpoint: "http://" + config.prisma.host + ":4466/profile/",
        debug: config.prisma.debug,
    })
};

async function account_seeder() {

    ctx.defaults = await getDefaults();

    const accounts = await got(config.openId.url + '/api/users/all', {});

    console.log(JSON.parse(accounts.body));

    var profiles = JSON.parse(accounts.body);

    for (var u = 0; u < profiles.length; u++) {
        var args = {
            gcID: profiles[u].id,
            name: profiles[u].name,
            email: profiles[u].email
        };
        try {
            await createProfile(null, args, ctx, "{gcID, name, email}");
        } catch (e) {
            console.error(e);
        }
    }
}


account_seeder();
