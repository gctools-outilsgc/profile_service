const { publishMessageQueue } = require("../Service_Mesh/publisher_connector");

function suggester(field){
    var suggestions = field.split(" ");
    suggestions.push(field);
    return suggestions;
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
        console.error(e);
    });
}

module.exports = {
    searchPrep
};