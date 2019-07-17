const config = require("../config");
const { publishMessageQueue } = require("../Service_Mesh/publisher_connector");
const { removeNullKeys } = require("../Resolvers/helper/objectHelper");
const { generateOnlineTemplate } = require("./onlineTemplates");

// Email templating is installed with ejs but not configued.
// Going to get online notifications working first.

async function renderContent(approval){
    const from = approval.gcIDSubmitter;
    const to = approval.gcIDApprover;
    const template = approval.changeType;

    return await generateOnlineTemplate(template, to, from);
}

async function sendNotification(content, context){
    const notificationObject = removeNullKeys({
        gcID: content.toUser,
        appID: context.token.aud,
        actionLevel: content.actionLevel,
        /*
        email:{
            // To build templates later
        },
        */
        online:{
            titleEn: content.titleEn,
            titleFr: content.titleFr,
            descriptionEn: content.descriptionEn,
            descriptionFr: content.descriptionFr
        },
        whoDunIt:{
            gcID: content.fromUser
        }        
    });

    return await publishMessageQueue("profile", "profile.notification", notificationObject);
}

async function generateNotification(approval, context){
    const routingKey = "profile.approval";

    const content = await renderContent(approval, context);

    Promise.all([
        sendNotification(content.approver, context),
        sendNotification(content.submitter, context)
    ]);
    
    return;
}

module.exports = {
    generateNotification
};