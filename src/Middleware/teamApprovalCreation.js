const { createApproval, appendApproval } = require("../resolvers/helper/approvalHelper");
const { cloneObject } = require("../resolvers/helper/objectHelper");
const { getTeam, getExistingApprovals, getApprovalType} = require("./common");

async function generateTeamTransferApproval(context, existingTeam, newOwner){
    // Check to see if there is an existing transfer for this specific team

    const existingApprovals = await getExistingApprovals(context, context.token.owner.gcID, existingTeam)
    .then((approvals) => getApprovalType(approvals, "Team"))
    .catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e);
    });

    var ownershipTransferObject = {
        gcIDApprover: newOwner.gcID,
        gcIDSubmitter: context.token.owner.gcID,
        createdBy: context.token.owner.gcID,
        requestedChange: {
            ownershipOfTeam:{
                id: existingTeam.id
            }
        },
        changeType: "Team"
    };    

    // Append existing transfer with new owner

    if (existingApprovals){
        ownershipTransferObject.id = existingApprovals.id;
        await appendApproval(null, ownershipTransferObject, context)
        .catch((e) => {
            // eslint-disable-next-line no-console
            console.log(e);
        });
    } else {
        // Create new transfer if none already exist
        await createApproval(null, ownershipTransferObject, context)
        .catch((e) => {
            // eslint-disable-next-line no-console
            console.log(e);
        });
    }

    return;
}

const teamApprovalRequired = async (resolve, root, args, context, info) => {

    const existingTeam = await getTeam(context, args.id);

    if (args.data.owner && args.data.owner.gcID !== existingTeam.owner.gcID){
        // change in ownership
        // clone args object so we don't need to wait for generate team transfer to return.
        generateTeamTransferApproval(context, existingTeam, cloneObject(args.data.owner));
        delete args.data.owner;
    }

    // resolve remaining mutation for non ownership changes
    return await resolve(root, args, context, info);
};

module.exports = {
    teamApprovalRequired
};
