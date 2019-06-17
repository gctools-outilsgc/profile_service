const {createApproval} = require("../resolvers/helper/approvalHelper");
const { AuthenticationError } = require("apollo-server");

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

async function generateMemerbshipApproval(membershipChanges, context){
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
            console.log(e);
        });

        var teamApprovalObject = {
            gcIDApprover: newSupervisor,
            gcIDSubmitter: membershipChanges.approvalSubmitter,
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


async function generateInformationalApproval(informationalChanges, context){
    // If no current supervisor don't create an approval object

    if(informationalChanges.approverID){
       // Remove team object because it's being handled in Membership change
        if (informationalChanges.data.team){
            delete informationalChanges.data.team;
        }



        const informationalApprovalObject = {
            gcIDApprover: informationalChanges.approverID,
            gcIDSubmitter: informationalChanges.approvalSubmitter,
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

    if (!context.token){
        throw new AuthenticationError("Must be authenticaticated");
    }

    var requestedChanges = {};
    requestedChanges.data = {};
    requestedChanges.data.gcID = args.gcID;
    requestedChanges.approvalSubmitter = context.token.owner.gcID;
    requestedChanges.approverID = (context.token && context.token.owner.team) ? context.token.owner.team.owner.gcID : null;

    if (!requestedChanges.approverID && !args.data.team){
        // If no current supervisor then pass through changes unless
        // it's a membership change
        return await resolve(root, args, context, info);
    }

    //This is where you're working...
    // Need to find way to split incoming request to pass
    // Informational without approval and continue with
    // Membership approval process

    if (!requestedChanges.approverID && args.data.team){

        requestedChanges.data.team = args.data.team;
        delete args.data.team;

    } else {

        for (var field in args.data){
            // Find any fields wrapped with the @requiresApproval directive and
            // remove them from the current context
            if (await checkForDirective(field, info)){
                requestedChanges.data[field] = args.data[field];
                delete args.data[field];
            }
        }
    }
     
    await Promise.all(
        [
            generateMemerbshipApproval(JSON.parse(JSON.stringify(requestedChanges)), context),
            generateInformationalApproval(JSON.parse(JSON.stringify(requestedChanges)), context)
        ]);

    // mutate any remainng non protected fields and resolve info
    return await resolve(root, args, context, info);
       

};





module.exports ={
    approvalRequired
};