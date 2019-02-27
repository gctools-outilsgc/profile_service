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
            nameEn: "",
            nameFr: "",
            acronymEn: "",
            acronymFr: "",
        };

    let org = await mutations.createOrganization({}, args, ctx, "{id}");
    
    return org;
            
}

async function getDefaults(){
    var org = await querys.organizations({},{nameEn:"", nameFr:""}, ctx, "{id}");
    if (org.length === 0 ){
        org = await createDefaultOrg();
    }

    defaultData.org = org;

    return defaultData;

    
}



module.exports = {
    getDefaults
};