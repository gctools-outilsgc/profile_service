const {copyValueToObjectIfDefined} = require("./helper/objectHelper");
const { getNewAddressFromArgs} = require("./helper/addressHelper");
const { UserInputError } = require("apollo-server");

async function createApproval(_, args, context, info){
    var address = getNewAddressFromArgs(args.requestedChange);
    
    return await context.prisma.mutation.createApproval({
        data: {
            gcIDApprover: {connect: {gcID: copyValueToObjectIfDefined(args.gcIDApprover.gcID)}},
            gcIDSubmitter: {connect: {gcID: copyValueToObjectIfDefined(args.gcIDSubmitter.gcID)}},
            requestedChange: {
                create:{
                    gcID: args.requestedChange.gcID,
                    name: args.requestedChange.name,
                    email: args.requestedChange.email,
                    avatar: args.requestedChange.avatar,
                    mobilePhone: args.requestedChange.mobilePhone,
                    officePhone: args.requestedChange.officePhone,
                    address: {create:address},
                    titleEn: args.requestedChange.titleEn,
                    titleFr: args.requestedChange.titleFr,
                    team:{connect:{ id:args.requestedChange.team.id}},
                }
            },
            createdOn: await Date.now().toString(),
            status: "Pending",
            changeType: args.changeType
        }
    }, info);
}
async function modifyApproval(_, args, context, info){
    // eslint-disable-next-line new-cap
    if (!context.prisma.exists.Approval({id:args.id})){
        throw new UserInputError("Approval does not Exist");
    }
    var updateApprovalData = {
        actionedOn: await Date.now().toString(),
        deniedComment: args.data.deniedComment,
        status: args.data.status
    };
    return await context.prisma.mutation.updateApproval({
        where: {
            id: args.id
        },
        data: updateApprovalData
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
    modifyApproval,
    deleteApproval
};