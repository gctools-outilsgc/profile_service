const config = require("../../config");
const { Prisma } = require("prisma-binding");
const mutations = require("../Mutations");
const querys = require("../Query");

const ctx = {
    prisma: new Prisma({
        typeDefs: "./src/generated/prisma.graphql",
        endpoint: "http://"+config.prisma.host+":4466/profile/",
        debug: config.prisma.debug,
    }) 
}; 

var defaultData = {};


async function createDefaultOrg() {

    // Create default organization

    const args = {
            nameEn: "Default Organization",
            nameFr: "Organization par défaut",
            acronymEn: "DO",
            acronymFr: "OPD",
        };

    let org = await mutations.createOrganization({}, args, ctx, "{id, teams{id}}");
    
    return org;
            
}

async function getDefaults(){
    var org = await querys.organizations({},{nameEn:"Default Organization", nameFr:"Organization par défaut"}, ctx, "{id,teams{id}}");

    if (org.length < 1 ){
        defaultData.org = await createDefaultOrg();
    } else {
         defaultData.org = org[0];
    }   

    return defaultData;

    
}



module.exports = {
    getDefaults
};