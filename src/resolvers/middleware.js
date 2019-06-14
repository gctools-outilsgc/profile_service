const {createApproval} = require("../resolvers/helper/approvalHelper");

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

async function generateMemerbshipApproval(requestedChanges, context){
    if (requestedChanges.team){

        var newSupervisor = await context.prisma.query.team(
            {
                where:{
                    id: requestedChanges.team.id
                }
            }, "{owner{gcID}}")
        .then((data) => {
            console.log(data);
            return data.owner.gcID;
        })
        .catch((e) => {
            console.log(e);
        });

        var teamApprovalObject = {
            gcIDApprover: newSupervisor,
            gcIDSubmitter: requestedChanges.approvalSubmitter,
            requestedChange: {
                team:{
                    id: requestedChanges.team.id
                }
            },
            changeType: "Membership"

        };
        
        await createApproval(null, teamApprovalObject, context)
        .then((result) => {
            console.log(result);
        })
        .catch((e) => {
            console.log(e);
        });
    }
    return;
}


async function generateInformationalApproval(approvalObject, context){
    return await createApproval(null, approvalObject, context);
}


const approvalRequired = async (resolve, root, args, context, info) => {
    var requestedChanges = {};
    requestedChanges.gcID = args.gcID;
    requestedChanges.approvalSubmitter = context.token.owner.gcID;
    var approverID = (context.token && context.token.owner.team) ? context.token.owner.team.owner.gcID : null;

    if (!approverID && !args.data.team){
        // If no current supervisor then pass through changes unless
        // it's a membership change
        return await resolve(root, args, context, info);
    }


    for (var field in args.data){
        // Find any fields wrapped with the @requiresApproval directive and
        // remove them from the current context
        if (await checkForDirective(field, info)){
            requestedChanges[field] = args.data[field];
            delete args.data[field];
        }
    }
    
    // Get the result of the modified unprotected fields
    const modifyProfileResult = await resolve(root, args, context, info);

    await Promise.all(generateMemerbshipApproval(requestedChanges, context));

    // createApproval(gcIDApprover: gcIDProfileInput!, gcIDSubmitter: gcIDProfileInput!, requestedChange: RequestedChangeInput, createdOn: String, actionedOn: String, deniedComment: String, status: Status, changeType: ChangeType)

    // ToDo: Check to see if no supervisor let changes go through without approval.

    // ToDo: Approver will differ depending on change type (informational vs team).
    // Need to check before setting gcIDApprover in object.



    var approvalObject = {
        gcIDApprover: approverID,
        gcIDSubmitter: approvalSubmitter,
        requestedChange: requestedChanges,
        changeType: "Informational"
        
    };

    

    return modifyProfileResult;
};





module.exports ={
    approvalRequired
};