const { AuthenticationError } = require("apollo-server");
const { createApproval, appendApproval } = require("../resolvers/helper/approvalHelper");
const { removeNullKeys, cloneObject } = require("../resolvers/helper/objectHelper");
const { getProfile, checkForDirective, checkForEmptyChanges, getApprovalType, getExistingApprovals } = require("./common");

/*-------------------------------------------------------------------------
User submits changes with both memembership and Informational
 - Create 2 approvals with new supervisor
 - New supervisor cannot approve information until membership approved
 - Denying membership also cancels the associated informational change
--------------------------------------------------------------------------*/

async function isThereATeamOwner(teamID, context){
    
    if(!teamID){
        return null;
    }

    const owner = await context.prisma.query.team({
        where:{
            id: teamID.id
        }
    }, "{owner{gcID, name}}");
    return owner;
}



async function checkAgainstExistingApprovals(requestedChanges, approvals) {

    // If there are no existing approvals then short circuit
    if (!approvals.length){
        return null;
    }

    // Remove empty keys from existing approval objects
    await Promise.all(approvals.map((approval) => {
        removeNullKeys(approval.requestedChange);
    }));
    
    // If the field is already covered by an existing Approval then ignore it
    await Promise.all(approvals.map(async (approval) => {
        Object.keys(requestedChanges).forEach((field) => {
            if (approval.requestedChange.field && field === approval.requestedChange.field){
                delete requestedChanges.field;
            }
        });
    }));

    return approvals;
}

async function checkAgainstExistingProfile(requestedChanges, submitterProfile){
    await Object.keys(submitterProfile).forEach((field) => {
        if (requestedChanges.field === submitterProfile.field){
            delete requestedChanges.field;
        }
    });
}

async function getNewSupervisor(context, gcID){
    return await getExistingApprovals(context, gcID)
    .then((approvals) => {
        return getApprovalType(approvals, "Membership");
    })
    .then((membershipApproval) => {
        if (membershipApproval){
            return isThereATeamOwner(membershipApproval.requestedChange.team, context);
        }
        return null;
    });
}

async function isAllowedSupervisor(context, requestedChanges){
    // Check for self reporting relationship
    if(requestedChanges.approvalSubmitter === requestedChanges.approverID.gcID){
        throw new AuthenticationError("A supervisor must be a different person than the selected user");
    }

    const approver = await getProfile(context, requestedChanges.approverID);

    // Check for circular relationship with team member
    if(approver.team.owner && approver.team.owner.gcID == requestedChanges.approvalSubmitter) {
        throw new AuthenticationError("Selected supervisor is already member of user's team");
    }
}

async function whoIsTheApprover(context, args, submitterProfile){
    const newTeamOwner = await isThereATeamOwner(args.data.team, context);
    const membershipRequest = await getNewSupervisor(context, args.gcID);

    if (args.data.team){
        return (newTeamOwner) ? newTeamOwner.owner : null;
    } else {
        if (membershipRequest) {
            return membershipRequest.owner;            
        } else {
            return (submitterProfile.team.owner) ? submitterProfile.team.owner : null;  
        }        
    }
}

async function generateMemerbshipApproval(membershipChanges, context, approvals = null){
    if (membershipChanges.data.team){

        // Get memebership approval if it exists
        const approval = await getApprovalType(approvals, "Membership");

        var teamApprovalObject = {
            gcIDApprover: membershipChanges.approverID.gcID,
            gcIDSubmitter: membershipChanges.approvalSubmitter,
            createdBy: membershipChanges.createdBy,
            requestedChange: {
                team:{
                    id: membershipChanges.data.team.id
                }
            },
            changeType: "Membership"

        };

        if(approval){
            teamApprovalObject.id = approval.id;
            await appendApproval(null, teamApprovalObject, context)
            .catch((e) => {
                // eslint-disable-next-line no-console
                console.log(e);
            });
        } else {
            await createApproval(null, teamApprovalObject, context)
            .catch((e) => {
            // eslint-disable-next-line no-console
            console.log(e);
            });
        }
    }
    return;
}

async function generateInformationalApproval(informationalChanges, context, approvals = null){
    // Remove team object because it's being handled in Membership chang
    if (informationalChanges.data.team){
            delete informationalChanges.data.team;
        }
    // If no current supervisor don't create an approval object
    if(informationalChanges.approverID){

        const approval = await getApprovalType(approvals, "Informational");

        const informationalApprovalObject = {
            gcIDApprover: informationalChanges.approverID.gcID,
            gcIDSubmitter: informationalChanges.approvalSubmitter,
            createdBy: informationalChanges.createdBy,
            requestedChange: informationalChanges.data,
            changeType: "Informational"
        };

        if(approval){
            informationalApprovalObject.id = approval.id;
            await appendApproval(null, informationalApprovalObject, context)
            .catch((e) => {
                // eslint-disable-next-line no-console
                console.error(e);
            });
        } else {
            if(!checkForEmptyChanges(informationalApprovalObject.requestedChange)){
                await createApproval(null, informationalApprovalObject, context)
                .catch((e) => {
                    // eslint-disable-next-line no-console
                    console.error(e);
                });
            } 
        }
    }    
    return;
}

const profileApprovalRequired = async (resolve, root, args, context, info) => {

    var requestedChanges = {};
    requestedChanges.data = {};
    requestedChanges.createdBy = context.token.owner.gcID;
    requestedChanges.updatedBy = context.token.owner.gcID;
    const submitter = await getProfile(context, args);
    requestedChanges.approvalSubmitter = submitter.gcID;
    requestedChanges.approverID = await whoIsTheApprover(context, args, submitter);

    if (!requestedChanges.approverID){
        // If no current supervisor then pass through changes unless
        // it's a membership change
        return await resolve(root, args, context, info);
    }

    // See if there is a team change and if it is allowed relationship
    await isAllowedSupervisor(context, requestedChanges);

    for (var field in args.data){
        // Find any fields wrapped with the @requiresApproval directive and
        // remove them from the current context
        if (await checkForDirective(field, info, "requiresApproval")){
            requestedChanges.data[field] = args.data[field];
            delete args.data[field];
        }
    }
    
    // If the supervisor is changing a persons team pass through the changes
    if(requestedChanges.data.team && requestedChanges.approverID.gcID === context.token.owner.gcID){
        const teamArgs = {
            gcID: args.gcID,
            data:{
                team:{
                    id: requestedChanges.data.team.id
                }
            }
            
        };
        return await resolve(root, teamArgs, context, info);
    }

    // Check to see if the requested changes coming in are changes
    // or already existing data.

    await checkAgainstExistingProfile(requestedChanges.data, submitter);

    // If there are changes that require approval check to see if there aren't already
    // approvals generated for the change

    const existingApprovals = await getExistingApprovals(context, requestedChanges.approvalSubmitter)
    .then((approvals) => checkAgainstExistingApprovals(requestedChanges.data, approvals));

    // If there are still changes in the requestedChanges object that were not
    // filtered out by the existing profile or existing approvals then create
    // or append existing approvals.

    if(!checkForEmptyChanges(requestedChanges.data)){
        await Promise.all(
            [
                generateMemerbshipApproval(cloneObject(requestedChanges), context, existingApprovals),
                generateInformationalApproval(cloneObject(requestedChanges), context, existingApprovals)
            ]);
    }  

    // mutate any remainng non protected fields and resolve info
    return await resolve(root, args, context, info);  
};

module.exports ={
    profileApprovalRequired
};