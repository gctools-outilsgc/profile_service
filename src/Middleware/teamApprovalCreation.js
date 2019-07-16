const { createApproval, appendApproval } = require("../resolvers/helper/approvalHelper");
const { removeNullKeys, cloneObject } = require("../resolvers/helper/objectHelper");
const {getProfile} = require("./common");

async function getTeam(context, id){
   return await context.prisma.query.team({
        where:{
            id
        }
    }, "{owner{gcID}}");
}

const teamApprovalRequired = async (resolve, root, args, context, info) => {

    const existingTeam = await getTeam(context, args.id);

    if (args.data.owner && (args.data.owner.gcID === existingTeam.owner.gcID || !args.data.owner.gcID)){
        // No change in ownership
        return await resolve(root, args, context, info);
    }       
        
    return await resolve(root, args, context, info);





};

module.exports = {
    teamApprovalRequired
};
