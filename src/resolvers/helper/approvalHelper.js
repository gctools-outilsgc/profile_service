const {copyValueToObjectIfDefined} = require("./objectHelper");
const { getNewAddressFromArgs} = require("./addressHelper");
const { UserInputError } = require("apollo-server");

async function createApproval(_, args, context, info){
    var address = (args.requestedChange.address) ? getNewAddressFromArgs(args.requestedChange) : null;

    const data = {
            gcIDApprover: {connect: {gcID: args.gcIDApprover}},
            gcIDSubmitter: {connect: {gcID: args.gcIDSubmitter}},
            requestedChange: {
                create:{
                    gcID: args.requestedChange.gcID,
                    name: copyValueToObjectIfDefined(args.requestedChange.name),
                    email: copyValueToObjectIfDefined(args.requestedChange.email),
                    avatar: copyValueToObjectIfDefined(args.requestedChange.avatar),
                    mobilePhone: copyValueToObjectIfDefined(args.requestedChange.mobilePhone),
                    officePhone: copyValueToObjectIfDefined(args.requestedChange.officePhone),
                    address: (address) ? {create: address} : address,
                    titleEn: copyValueToObjectIfDefined(args.requestedChange.titleEn),
                    titleFr: copyValueToObjectIfDefined(args.requestedChange.titleFr),
                    team: (args.requestedChange.team) ? {connect: {id: args.requestedChange.team.id}} : null,
                }
            },
            createdOn: await Date.now().toString(),
            status: "Pending",
            changeType: args.changeType        
};
    
    return await context.prisma.mutation.createApproval({
        data
    }, info);
}

async function deleteApproval(_, args, context){
    // eslint-disable-next-line new-cap
    if (await context.prisma.exists.Approval({id:args.id})){
        try {
            await context.prisma.mutation.deleteApproval({
                where:{
                    id: args.id
                }
            });
        } catch(e){
        return false;
        }
        return true;
    }
    throw new UserInputError("Approval does not exist");
}

module.exports = {
    createApproval,
    deleteApproval
};