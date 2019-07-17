const config = require("../config");
const { publishMessageQueue } = require("../Service_Mesh/publisher_connector");
const { removeNullKeys } = require("../Resolvers/helper/objectHelper");

// Email templating is install with ejs but not configued.
// Going to get online notifications working first.

async function renderContent(approval, template, actionLevel, context){

}

async function generateNotification(approval, template = null, context){
    const routingKey = "profile.approval";

    const content = await renderContent(approval, template, context);

    const notificationObject = removeNullKeys({
        gcID: content.to.gcID,
        appID: context.token.aud,
        actionLevel,
        email:{

        },
        online:{
            titleEn: content.online.titleEn,
            titleFr: content.online.titleFr,
            descriptionEn: content.online.descriptionEn,
            descriptionFr: content.online.descriptionFr
        },
        whoDunIt:{
            gcID: content.from.gcID
        }        
    });


    
}

module.exports = {
    generateNotification
};