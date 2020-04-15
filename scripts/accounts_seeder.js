const config = require("../src/config");
const { Prisma } = require("prisma-binding");
const got = require('got');
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

    //Have user credentials been entered
    if (process.argv.length === 2) {
        console.error('Expected user credentials');
        process.exit(1);
    }

    var credentials = process.argv.slice(2);
    var auth = "";

    //Authenticate user
    try {
        auth = await got.post(config.openId.url + '/api-token-auth/', {
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ "username": credentials[0], "password": credentials[1] })
        });
    } catch (e) {
        console.error(e);
    }

    var token = JSON.parse(auth.body);

    //retreive accounts oidc provider
    const accounts = await got(config.openId.url + '/api/users/all', { headers: { 'Authorization': 'Token ' + token.token } });

    var profiles = JSON.parse(accounts.body);

    console.log("Found " + profiles.length + " accounts")

    //Create defaults
    ctx.defaults = await getDefaults();

    //Create profiles
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
