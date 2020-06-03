const config = require("../../config");
const { Prisma } = require("prisma-binding");
const request = require("request");
const mutations = require("../Mutations");
const querys = require("../Query");

const ctx = {
    prisma: new Prisma({
        typeDefs: "./src/generated/prisma.graphql",
        endpoint: "http://" + config.prisma.host + ":4466/profile/",
        debug: config.prisma.debug,
    })
};

var defaultData = {};


async function createDefaultOrg() {

    // Create default organization

    const args = {
        data: {
            nameEn: "Global Organization",
            nameFr: "Organization Global",
            acronymEn: "DO",
            acronymFr: "OPD",
            orgType: "Default",
            teams: {
                create: {
                    nameEn: "Global Team",
                    nameFr: "Équipe Globale"
                }
            }
        }
    };

    let org = await ctx.prisma.mutation.createOrganization(args, "{id, teams{id}}");

    // load the rest of the orgs from GCcollab
    await buildOrgs();


    return org;

}

async function buildOrgs() {
    request.get('https://gccollab.ca/services/api/rest/json/?method=get.fields', async function (error, response, body) {
        if (!error) {
            let jsonBody = JSON.parse(body);

            let federalEn = JSON.parse(jsonBody.result.federal.en);
            let federalFr = JSON.parse(jsonBody.result.federal.fr);
            console.log("Creating Federal organizations");
            for (var item in federalEn) {
                const federalArgs = {
                    data: {
                        nameEn: federalEn[item],
                        nameFr: federalFr[item],
                        acronymEn: "",
                        acronymFr: "",
                        orgType: "Federal",
                        teams: {
                            create: {
                                nameEn: "Default Team",
                                nameFr: "Équipe par défaut"
                            }
                        }
                    }
                };

                await ctx.prisma.mutation.createOrganization(federalArgs, "{id, teams{id}}");
            }

            let universityEn = JSON.parse(jsonBody.result.student.university.en);
            let universityFr = JSON.parse(jsonBody.result.student.university.fr);
            console.log("Creating University organizations");
            for (var item in universityEn) {
                const universityArgs = {
                    data: {
                        nameEn: universityEn[item],
                        nameFr: universityFr[item],
                        acronymEn: "",
                        acronymFr: "",
                        orgType: "University",
                        teams: {
                            create: {
                                nameEn: "Default Team",
                                nameFr: "Équipe par défaut"
                            }
                        }
                    }
                };

                await ctx.prisma.mutation.createOrganization(universityArgs, "{id, teams{id}}");
            }

            let collegeEn = JSON.parse(jsonBody.result.student.college.en);
            let collegeFr = JSON.parse(jsonBody.result.student.college.fr);
            console.log("Creating College organizations");
            for (var item in collegeEn) {
                const CollegeArgs = {
                    data: {
                        nameEn: collegeEn[item],
                        nameFr: collegeFr[item],
                        acronymEn: "",
                        acronymFr: "",
                        orgType: "College",
                        teams: {
                            create: {
                                nameEn: "Default Team",
                                nameFr: "Équipe par défaut"
                            }
                        }
                    }
                };

                await ctx.prisma.mutation.createOrganization(CollegeArgs, "{id, teams{id}}");
            }

            let provincesEn = JSON.parse(jsonBody.result.provincial.en);
            let provincesFr = JSON.parse(jsonBody.result.provincial.fr);
            let provincialEn = JSON.parse(jsonBody.result.provincial.ministry.en);
            let provincialFr = JSON.parse(jsonBody.result.provincial.ministry.fr);
            console.log("Creating Provincial organizations");
            for (var province in provincesEn) {

                for (var ministry in provincialEn[province.toLowerCase().replace(/\s/g, '')]) {

                    const ProvinceArgs = {
                        data: {
                            nameEn: ministry + ' - ' + province,
                            nameFr: provincialFr[province.toLowerCase().replace(/\s/g, '')][ministry] + ' - ' + provincesFr[province],
                            acronymEn: "",
                            acronymFr: "",
                            orgType: "Provincial",
                            teams: {
                                create: {
                                    nameEn: "Default Team",
                                    nameFr: "Équipe par défaut"
                                }
                            }
                        }
                    };

                    await ctx.prisma.mutation.createOrganization(ProvinceArgs, "{id, teams{id}}");
                }
            }


            let municipalities = jsonBody.result.municipal.towns;
            console.log("Creating Municipal organizations");
            for (var province in provincesEn) {

                for (var town in JSON.parse(municipalities[province.toLowerCase().replace(/\s/g, '')])) {

                    const MunicipalArgs = {
                        data: {
                            nameEn: town + ' - ' + province,
                            nameFr: town + ' - ' + provincesFr[province],
                            acronymEn: "",
                            acronymFr: "",
                            orgType: "Municipal",
                            teams: {
                                create: {
                                    nameEn: "Default Team",
                                    nameFr: "Équipe par défaut"
                                }
                            }
                        }
                    };

                    await ctx.prisma.mutation.createOrganization(MunicipalArgs, "{id, teams{id}}");
                }
            }

            let otherEn = JSON.parse(jsonBody.result.other.en);
            let otherFr = JSON.parse(jsonBody.result.other.fr);
            console.log("Creating Other organizations");
            for (var item in otherEn) {

                var fr = otherFr[item]
                if (fr === undefined) {
                    fr = getKeyByValue(otherFr, item)
                }

                const OtherArgs = {
                    data: {
                        nameEn: otherEn[item],
                        nameFr: fr,
                        acronymEn: "",
                        acronymFr: "",
                        orgType: "Other",
                        teams: {
                            create: {
                                nameEn: "Default Team",
                                nameFr: "Équipe par défaut"
                            }
                        }
                    }
                };

                await ctx.prisma.mutation.createOrganization(OtherArgs, "{id, teams{id}}");
            }
        }
    });
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}


async function getDefaults() {
    var org = await querys.organizations({}, { nameEn: "Global Organization", nameFr: "Organization Global" }, ctx, "{id,teams{id}}");

    if (org.length < 1) {
        defaultData.org = await createDefaultOrg();
    } else {
        defaultData.org = org[0];
    }

    return defaultData;


}



module.exports = {
    getDefaults
};