const { publishMessageQueue } = require("../Service_Mesh/publisher_connector");

async function suggester(field){
    return field.split(" ");
}

async function searchPrep(profile, action, context){
    var newProfile = await context.prisma.query.profile({
        where:{
            gcID: profile.gcID
        }
    });
    newProfile.suggest = await suggester(newProfile.name);
    publishMessageQueue("profile", "profile." + action, newProfile)
    .catch((e) => {
        // ignore it for now
    });
}

module.exports = {
    searchPrep
};