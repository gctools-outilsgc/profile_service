const {createApproval, appendApproval} = require("../resolvers/helper/approvalHelper");
const { AuthenticationError } = require("apollo-server");
const { removeNullKeys, cloneObject } = require("../resolvers/helper/objectHelper");

/*-------------------------------------------------------------------------
User submits changes with both memembership and Informational
 - Create 2 approvals with new supervisor
 - New supervisor cannot approve information until membership approved
 - Denying membership also cancels the associated informational change






--------------------------------------------------------------------------*/



function checkForDirective(field, info){
    const directiveName = "requiresApproval";
    const fieldDirectives = info.returnType.ofType._fields[field].astNode.directives;
    var directiveExists = false;
    if (fieldDirectives.length > 0){
        fieldDirectives.forEach((directive) => {
            if (directive.name.value === directiveName){
                directiveExists = true;
                return;
            }
        });
    }
    return directiveExists;


}

async function getSubmitterProfile(context, args){
    return await context.prisma.query.profile({
        where:{
            gcID: args.gcID
        }
    },"{gcID, name, email, avatar, mobilePhone, officePhone, titleEn, titleFr, address{streetAddress, city, province, postalCode, country},team{id,organization{id},owner{gcID}}}");
}

function checkForEmptyChanges(changesObject){
    // Return True if requestedChanges is all null

    var requestedChanges = JSON.parse(JSON.stringify(changesObject));
    var isNull = true;
    
    Object.entries(requestedChanges).forEach((field) => {
        isNull = isNull && !field;
    });

    return isNull;

}

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

async function getExistingApprovals(context, gcID){
    return await context.prisma.query.approvals({
        where:{
            status: "Pending",
            gcIDSubmitter:{
                gcID
            }
        }
    }, 
    `{
        id,
        gcIDApprover{
            gcID
        },
        status,
        changeType,
        requestedChange{
            id,
            name,
            email,
            avatar,
            mobilePhone,
            officePhone,
            address{
            streetAddress,
            city,
            province,
            postalCode,
            country
            },
            titleEn,
            titleFr,
            team{
                id
            }   
        }
    }`);
}

async function whoIsTheApprover(context, args, submitterProfile){
    const newTeamOwner = await isThereATeamOwner(args.data.team, context);

    if (args.data.team){
        return (newTeamOwner) ? newTeamOwner.owner : null;
    } else {
        return (submitterProfile.team.owner) ? submitterProfile.team.owner : null;
    }
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

async function getApprovalType(approvals, type){

    if(approvals){
        const index = approvals.findIndex((approval) => {
            return approval.changeType === type;
        });
    
        if (index >= 0){
            return approvals[index];
        }
    }

    return null;

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


const approvalRequired = async (resolve, root, args, context, info) => {

    var requestedChanges = {};
    requestedChanges.data = {};
    requestedChanges.createdBy = context.token.owner.gcID;
    requestedChanges.updatedBy = context.token.owner.gcID;
    const submitter = await getSubmitterProfile(context, args);
    requestedChanges.approvalSubmitter = submitter.gcID;
    requestedChanges.approverID = await whoIsTheApprover(context, args, submitter);

    if (!requestedChanges.approverID){
        // If no current supervisor then pass through changes unless
        // it's a membership change
        return await resolve(root, args, context, info);
    }

    for (var field in args.data){
        // Find any fields wrapped with the @requiresApproval directive and
        // remove them from the current context
        if (await checkForDirective(field, info)){
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
    approvalRequired
};