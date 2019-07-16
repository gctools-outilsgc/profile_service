const { createApproval, appendApproval } = require("../resolvers/helper/approvalHelper");
const { removeNullKeys, cloneObject } = require("../resolvers/helper/objectHelper");
const {getSubmitterProfile} = require("./common");

const teamApprovalRequired = async (resolve, root, args, context, info) => {
    var requestedChanges = {};
    requestedChanges.data = {};
    requestedChanges.createdBy = context.token.owner.gcID;
    requestedChanges.updatedBy = context.token.owner.gcID;
    const submitter = await getSubmitterProfile(context, args);
    requestedChanges.approvalSubmitter = submitter.gcID;





};

module.exports = {
    teamApprovalRequired
};
