const { publishMessageQueue } = require("../Service_Mesh/publisher_connector");

function suggester(newProfile, newTeam, newOrg){
    // add to the suggester field
    var suggestions = newProfile.name.split(" ");
    suggestions.push(newProfile.name);
    suggestions.push(newProfile.email);
    newProfile.mobilePhone != '' ? suggestions.push(newProfile.mobilePhone) : "";
    newProfile.officePhone != '' ? suggestions.push(newProfile.officePhone) : "";
    if(typeof newTeam !== 'undefined'){
        suggestions.push(newTeam.nameFr)
        suggestions.push(newTeam.nameEn)
    }

    if(typeof newOrg !== 'undefined'){
        suggestions.push(newOrg.nameFr)
        suggestions.push(newOrg.nameEn)
    }
    return suggestions;
}

async function searchPrep(profile, action, context){
//add profile, team and organization info to the suggester
    var newProfile = await context.prisma.query.profile({
        where:{
            gcID: profile.gcID
        }
    });

    if(profile.team !== null){
        var newTeam = await context.prisma.query.team({
            where:{
                id: profile.team.id
            }
        });

        var newOrg = await context.prisma.query.organization({
            where:{
                id: profile.team.organization.id
            }
        });   
    }else{
       var newTeam = "";
       var newOrg = "";       
    }

    newProfile.suggest = await suggester(newProfile, newTeam, newOrg);
    publishMessageQueue("profile", "profile." + action, newProfile)
    .catch((e) => {
        // Need to implement error handling
        // eslint-disable-next-line no-console
        console.error(e);
    });
}

module.exports = {
    searchPrep
};