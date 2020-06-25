const { AuthenticationError } = require("apollo-server");
const { removeNullKeys, cloneObject } = require("../Resolvers/helper/objectHelper");
const { getProfile, getTeam, checkForDirective } = require("./common");


const allowedToModifyProfile = async (resolve, root, args, context, info) => {

    // Only the profile owner or their current supervisor can modify a profile

    const submitter = await getProfile(context, args);
    if (args.gcID !== context.token.owner.gcID && (submitter.team.owner === null || context.token.owner.gcID !== submitter.team.owner.gcID) && !context.token.owner.isAdmin) {
        throw new AuthenticationError("E10MustBeOwnerOrSupervisor");
    }
    return await resolve(root, args, context, info);

};

const allowedToModifyTeam = async (resolve, root, args, context, info) => {
    // Only the current team owner can modify a team
    const existingTeam = await getTeam(context, args.id);
    if (existingTeam.owner.gcID !== context.token.owner.gcID && !context.token.owner.isAdmin) {
        throw new AuthenticationError("E11MustBeTeamOwner");
    }
    return await resolve(root, args, context, info);

};

const allowedToModifyApproval = async (resolve, root, args, context, info) => {

    // Only current supervisor can modify Informational type and new supervisor can modify Membership type.
    // Only Submitter can revoke a pending approval

    // Approver on approval
    const approval = await context.prisma.query.approval(
        {
            where: {
                id: args.id
            }
        }, "{gcIDApprover{gcID}, gcIDSubmitter{gcID}, changeType}"
    );

    // Current supervisor
    const approvalSubject = await context.prisma.query.profile(
        {
            where: {
                gcID: approval.gcIDSubmitter.gcID
            }
        }, "{team{owner{gcID}}}"
    );

    if (args.data.status === "Revoked") {
        if (!context.token.owner.gcID === approval.gcIDSubmitter.gcID) {
            throw new AuthenticationError("E12ApprovalOnlyRevokedBySubmitter");
        }
        return await resolve(root, args, context, info);
    }

    if (approval.changeType === "Informational") {

        if(approvalSubject.team.owner){
            if(approvalSubject.team.owner.gcID !== context.token.owner.gcID){
                throw new AuthenticationError("E13MustBeSupervisorInfo");                   
            }
        }
        return await resolve(root, args, context, info);
    }

    if(approval.changeType === "Membership" || approval.changeType === "Team"){
        if(approval.gcIDApprover.gcID !== context.token.owner.gcID){
            throw new AuthenticationError("E14MustBeSupervisorTransfer");
        }
        return await resolve(root, args, context, info);
    }

    if(!context.token.owner.gcID === approval.gcIDApprover.gcID){
        throw new AuthenticationError("E15MustBeApprover");
    }

    return await resolve(root, args, context, info);
};

const mustbeAuthenticated = async (resolve, root, args, context, info) => {
    if (!context.token || !context.token.active){
        throw new AuthenticationError("E9MustBeAuthenticated");
    }
    return await resolve(root, args, context, info);
};

const mustBeAdmin = async (resolve, root, args, context, info) => {

    // Must be an admin

    if (!context.token || !context.token.owner.isAdmin) {
        throw new AuthenticationError("Must be an system admin");
    }
    return await resolve(root, args, context, info);

};

const adminOnlyField = async (resolve, root, args, context, info) => {

    for (var field in args.data) {
        if (await checkForDirective(field, info, "onlyAdmin")) {
            if (!context.token.owner.isAdmin) {
                delete args.data[field];
            }
        }
    }
    return await resolve(root, args, context, info);

};

module.exports = {
    allowedToModifyProfile,
    allowedToModifyTeam,
    allowedToModifyApproval,
    mustbeAuthenticated,
    mustBeAdmin,
    adminOnlyField
};
