const {copyValueToObjectIfDefined, removeNullKeys} = require("./objectHelper");
const { getNewAddressFromArgs} = require("./addressHelper");
const { UserInputError } = require("apollo-server");
const {getExistingApprovals, getApprovalType, getProfile} = require("../../Middleware/common");
async function createApproval(_, args, context, info){
    var address = (args.requestedChange.address) ? getNewAddressFromArgs(args.requestedChange) : null;

    const data = removeNullKeys({
            gcIDApprover: {connect: {gcID: args.gcIDApprover}},
            gcIDSubmitter: {connect: {gcID: args.gcIDSubmitter}},
            createdBy: {connect: {gcID: args.createdBy}},
            requestedChange: {
                create: {
                    name: copyValueToObjectIfDefined(args.requestedChange.name),
                    email: copyValueToObjectIfDefined(args.requestedChange.email),
                    avatar: copyValueToObjectIfDefined(args.requestedChange.avatar),
                    mobilePhone: copyValueToObjectIfDefined(args.requestedChange.mobilePhone),
                    officePhone: copyValueToObjectIfDefined(args.requestedChange.officePhone),
                    address: (address) ? {create: address} : address,
                    titleEn: copyValueToObjectIfDefined(args.requestedChange.titleEn),
                    titleFr: copyValueToObjectIfDefined(args.requestedChange.titleFr),
                    team: (args.requestedChange.team) ? {connect: {id: args.requestedChange.team.id}} : null,
                    ownershipOfTeam: (args.requestedChange.ownershipOfTeam) ? {connect: {id: args.requestedChange.ownershipOfTeam.id}} : null,
                }
            },
            createdOn: await Date.now().toString(),
            status: "Pending",
            changeType: args.changeType        
    });
    
    return await context.prisma.mutation.createApproval({
        data
    }, info);
}

async function appendApproval(_, args, context, info){
    var address = (args.requestedChange.address) ? getNewAddressFromArgs(args.requestedChange) : null;

    const data = removeNullKeys({
            gcIDApprover: {connect: {gcID: args.gcIDApprover}},
            updatedBy: {connect: {gcID: args.createdBy}},
            requestedChange: {
                update:{
                    name: copyValueToObjectIfDefined(args.requestedChange.name),
                    email: copyValueToObjectIfDefined(args.requestedChange.email),
                    avatar: copyValueToObjectIfDefined(args.requestedChange.avatar),
                    mobilePhone: copyValueToObjectIfDefined(args.requestedChange.mobilePhone),
                    officePhone: copyValueToObjectIfDefined(args.requestedChange.officePhone),
                    address: (address) ? {create: address} : address,
                    titleEn: copyValueToObjectIfDefined(args.requestedChange.titleEn),
                    titleFr: copyValueToObjectIfDefined(args.requestedChange.titleFr),
                    team: (args.requestedChange.team) ? {connect: {id: args.requestedChange.team.id}} : null,
                    ownershipOfTeam: (args.requestedChange.ownershipOfTeam) ? {connect: {id: args.requestedChange.ownershipOfTeam.id}} : null,
                    
                }
            },
            actionedOn: await Date.now().toString(),
            status: "Pending",
      
    });
    
    return await context.prisma.mutation.updateApproval({
        where:{
            id: args.id
        },
        data
    }, info);
}


async function getApprovalChanges(approvalID, context){
    // Do the action to update the profile

    const approvalToAction = await context.prisma.query.approval(
        {
            where: {
                id: approvalID
            }
        }, "{gcIDApprover{gcID, name, email},gcIDSubmitter{gcID, name, email}, changeType, requestedChange{name, email, avatar, mobilePhone, officePhone,"
        + "address{streetAddress, city, province, postalCode, country},"
        + "titleEn,titleFr,team{id},ownershipOfTeam{id}}}"
    );

    var infoToModify = {};

    if (approvalToAction.changeType === "Membership" || approvalToAction.changeType === "Informational"){
        infoToModify = removeNullKeys({
            gcID: approvalToAction.gcIDSubmitter.gcID,
            changeType: approvalToAction.changeType,
            data: {
                name: copyValueToObjectIfDefined(approvalToAction.requestedChange.name),
                email: copyValueToObjectIfDefined(approvalToAction.requestedChange.email),
                avatar: copyValueToObjectIfDefined(approvalToAction.requestedChange.avatar),
                mobilePhone: copyValueToObjectIfDefined(approvalToAction.requestedChange.mobilePhone),
                officePhone: copyValueToObjectIfDefined(approvalToAction.requestedChange.officePhone),
                titleEn: copyValueToObjectIfDefined(approvalToAction.requestedChange.titleEn),
                titleFr: copyValueToObjectIfDefined(approvalToAction.requestedChange.titleFr)    
            }
    
        });
    
        if(approvalToAction.requestedChange.team){
            if(typeof infoToModify.data === "undefined"){
                infoToModify.data = {};
            }
            infoToModify.data.team = {
                id: approvalToAction.requestedChange.team.id
            };
        }
    
        if(approvalToAction.requestedChange.ownershipOfTeam){
            infoToModify.data.owner = {
                gcID: approvalToAction.gcIDApprover.gcID
            };
        }
    
        if(approvalToAction.requestedChange.address){
            infoToModify.data.address = approvalToAction.requestedChange.address;
        }
    }
    if(approvalToAction.changeType === "Team"){
        infoToModify = removeNullKeys({
            id: approvalToAction.requestedChange.ownershipOfTeam.id,
            changeType: approvalToAction.changeType,
            data: {
                owner:{
                    gcID: approvalToAction.gcIDApprover.gcID
                }  
            }    
        });
    } 
    


    return infoToModify;
}

async function resetSupervisor(submitter, context){
    const approval = await getExistingApprovals(context, submitter.gcID)
    .then(async (approvals) => {
        return await getApprovalType(approvals, "Informational");
    });

    if (approval){
        const supervisor = await getProfile(context, submitter)
        .then((profile) => {
            return profile.team.owner;
        });

        await appendApproval(null, {id: approval.id, requestedChange:{}, gcIDApprover: supervisor.gcID, createdBy: submitter.gcID}, context);
    }
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
    deleteApproval,
    getApprovalChanges,
    appendApproval,
    resetSupervisor
};