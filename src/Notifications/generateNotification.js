const config = require("../config");
const { publishMessageQueue } = require("../Service_Mesh/publisher_connector");
const { removeNullKeys } = require("../Resolvers/helper/objectHelper");
const { generateOnlineTemplate } = require("./onlineTemplates");
const ejs = require('ejs');
const path = require('path');

async function renderContent(approval) {
    const from = approval.gcIDSubmitter;
    const to = approval.gcIDApprover;
    const template = approval.changeType;

    let online = await generateOnlineTemplate(template, to, from);
    let emailApprover = await ejs.renderFile(path.join(__dirname, '/Email_Templates/base.ejs'), { content: online.approver, directoryUrl: config.directoryApp.url }, {});
    let emailSubmitter = await ejs.renderFile(path.join(__dirname, '/Email_Templates/base.ejs'), { content: online.submitter, directoryUrl: config.directoryApp.url }, {});

    online.approver.body = emailApprover;
    online.submitter.body = emailSubmitter;

    return online
}

async function sendNotification(content, context) {
    const notificationObject = removeNullKeys({
        gcID: content.toUser,
        appID: context.token.aud,
        actionLevel: content.actionLevel,
        email: {
            to: content.email,
            subject: content.emailSubject,
            body: content.body,
            html: true
        },
        online: {
            titleEn: content.titleEn,
            titleFr: content.titleFr,
            descriptionEn: content.descriptionEn,
            descriptionFr: content.descriptionFr
        },
        whoDunIt: {
            gcID: content.fromUser
        }
    });

    return await publishMessageQueue("profile", "profile.notification", notificationObject);
}

async function generateNotification(approval, context) {
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