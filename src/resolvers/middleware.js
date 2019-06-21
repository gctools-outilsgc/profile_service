const {createApproval} = require("../resolvers/helper/approvalHelper");
const { AuthenticationError } = require("apollo-server");
const { removeNullKeys, cloneObject } = require("./helper/objectHelper");

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
    },"{team{id,organization{id},owner{gcID}}}");
}

function checkForEmptyChanges(changesObject){
    var requestedChanges = JSON.parse(JSON.stringify(changesObject.data));
    delete requestedChanges.gcID;
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
    });
}

async function whoIsTheApprover(context, args){
    const submitter = await getSubmitterProfile(context, args);
    const newTeamOwner = await isThereATeamOwner(args.data.team, context);

    // Simple statement below that does a whole lot of logic.
    // If there is no top level supervisor on the current team (default org teams)
    // then get the owner of the team that is being passed in.  If there is no owner
    // then return null and the changes will pass through or use the new
    // supervisor for all approvals.  If there is no change in supevisor then use
    // the existing supervisor on the team.  This is always guarenteed to exist
    // because of the default org teams do now have owners which will 
    // short circuit on !submitter.team.owner and use the newTeamOwner.

    return (!submitter.team.owner) ? newTeamOwner : submitter.team.owner.gcID;
}


async function checkAgainstExistingApprovals(requestedChanges, approvals) {

    // If there are no existing approvals then short circuit
    if (approvals){
        console.log(approvals);
    }

    // Remove empty keys from existing approval objects
    await Promise.all(approvals.map(async (approval) => {
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

async function generateMemerbshipApproval(membershipChanges, context, approval = null){
    if (membershipChanges.data.team){

        var newSupervisor = await context.prisma.query.team(
            {
                where:{
                    id: membershipChanges.data.team.id
                }
            }, "{owner{gcID}}")
        .then((data) => {
            return data.owner.gcID;
        })
        .catch((e) => {
            // eslint-disable-next-line no-console
            console.log(e);
        });

        var teamApprovalObject = {
            gcIDApprover: newSupervisor,
            gcIDSubmitter: membershipChanges.approvalSubmitter,
            createdBy: membershipChanges.createdBy,
            requestedChange: {
                gcID: membershipChanges.data.gcID,
                team:{
                    id: membershipChanges.data.team.id
                }
            },
            changeType: "Membership"

        };
        
        await createApproval(null, teamApprovalObject, context)
        .catch((e) => {
            // eslint-disable-next-line no-console
            console.log(e);
        });
    }
    return;
}

async function generateInformationalApproval(informationalChanges, context, approval = null){
    // If no current supervisor don't create an approval object

    if(informationalChanges.approverID && !checkForEmptyChanges(informationalChanges)){
       // Remove team object because it's being handled in Membership change
        if (informationalChanges.data.team){
            delete informationalChanges.data.team;
        }



        const informationalApprovalObject = {
            gcIDApprover: informationalChanges.approverID,
            gcIDSubmitter: informationalChanges.approvalSubmitter,
            createdBy: informationalChanges.createdBy,
            requestedChange: informationalChanges.data,
            changeType: "Informational"
        };

        

        await createApproval(null, informationalApprovalObject, context)
        .catch((e) => {

            // eslint-disable-next-line no-console
            console.log(e);
        }); 
    }
    
    return;
}


const approvalRequired = async (resolve, root, args, context, info) => {

    if (!context.token || !context.token.active){
        throw new AuthenticationError("Must be authenticaticated");
    }

    var requestedChanges = {};
    requestedChanges.data = {};
    requestedChanges.createdBy = context.token.owner.gcID;
    requestedChanges.updatedBy = context.token.owner.gcID;
    requestedChanges.approvalSubmitter = args.gcID;
    requestedChanges.approverID = await whoIsTheApprover(context, args);

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

    // Need to check to see if the requested changes coming in are changes
    // or already existing data.


    const existingApprovals = await getExistingApprovals(context, requestedChanges.data.gcID)
    .then((approvals) => checkAgainstExistingApprovals(requestedChanges.data, approvals));
    
    await Promise.all(
        [
            generateMemerbshipApproval(cloneObject(requestedChanges), context, existingApprovals),
            generateInformationalApproval(cloneObject(requestedChanges), context, existingApprovals)
        ]);

    // mutate any remainng non protected fields and resolve info
    return await resolve(root, args, context, info);
       

};





module.exports ={
    approvalRequired
};