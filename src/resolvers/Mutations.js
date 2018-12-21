const {copyValueToObjectIfDefined} = require("./helper/objectHelper");
const { throwExceptionIfProfileIsNotDefined, getSupervisorFromArgs} = require("./helper/profileHelper");
const { getNewAddressFromArgs, updateOrCreateAddressOnProfile} = require("./helper/addressHelper");
const {processUpload} = require("./File-Upload");
const {throwExceptionIfOrganizationIsNotDefined} = require("./helper/organizationHelper");
const {throwExceptionIfTeamIsNotDefined, getTeamFromArgs} = require("./helper/teamHelper");

async function createProfile(_, args, context, info){
    var createProfileData = {
        gcID: args.gcID,
        name: args.name,
        email: args.email,
        mobilePhone: copyValueToObjectIfDefined(args.mobilePhone),
        officePhone: copyValueToObjectIfDefined(args.officePhone),
        titleEn: copyValueToObjectIfDefined(args.titleEn),
        titleFr: copyValueToObjectIfDefined(args.titleFr)
    };
    
    if (typeof args.avatar !== "undefined"){
        await processUpload(args.avatar).then((url) => {
            createProfileData.avatar = url;
        });
    }
    
    var address = getNewAddressFromArgs(args);
    if(address != null) {
        createProfileData.address = {create:address};
    }

    var supervisor = getSupervisorFromArgs(args);
    if (supervisor != null) {
        createProfileData.supervisor = {connect:supervisor};
    }

    var team = getTeamFromArgs(args);
    if (team != null) {
        createProfileData.team = {connect:team};
    }

    return await context.prisma.mutation.createProfile({
        data: createProfileData,
        }, info);
}

async function modifyProfile(_, args, context, info){
    // eslint-disable-next-line new-cap
    const currentProfile = await context.prisma.query.profiles(
        {
            where: {
                gcID: args.gcID
            }            
        });
    throwExceptionIfProfileIsNotDefined(currentProfile);
    var updateProfileData = {
        name: copyValueToObjectIfDefined(args.name),
        email: copyValueToObjectIfDefined(args.email),
        mobilePhone: copyValueToObjectIfDefined(args.mobilePhone),
        officePhone: copyValueToObjectIfDefined(args.officePhone),
        titleEn: copyValueToObjectIfDefined(args.titleEn),
        titleFr: copyValueToObjectIfDefined(args.titleFr),
    };

    if (typeof args.avatar !== "undefined"){
        await processUpload(args.avatar).then((url) => {
            updateProfileData.avatar = url;
        });
    }
    
    var address = updateOrCreateAddressOnProfile(args, currentProfile);
    if(address != null){
        updateProfileData.address = address;
    }
       
    if (typeof args.supervisor !== "undefined") {
        var updateSupervisorData = {
            gcID: copyValueToObjectIfDefined(args.supervisor.gcID),
            email: copyValueToObjectIfDefined(args.supervisor.email)
        };

        updateProfileData.push({
            supervisor: {
                connect: {
                    updateSupervisorData
                }
            }
        });
    }
    
    if (typeof args.team !== "undefined"){
        updateProfileData.push({
            team :{
                connect: {
                    id: args.team.id
                }
            }
        });
    }

    return await context.prisma.mutation.updateProfile({
        where:{
        gcID: args.gcID
        },
        data: updateProfileData   
    }, info);    
}

async function deleteProfile(_, args, context){
    try {
        await context.prisma.mutation.deleteProfile({
            where:{
            gcID: args.gcID
            }
        });
    } catch(e){
        return e;
    }
    return true;

}

function createOrganization(_, args, context, info){            
    return context.prisma.mutation.createOrganization({            
        data: {
        nameEn: args.nameEn,
        nameFr: args.nameFr,
        acronymEn: args.acronymEn,        
        acronymFr: args.acronymFr  
        }        
    }, info);
}

async function modifyOrganization(_, args, context, info){
    const currentOrganization = context.prisma.query.organizations(
        {
            where: {
                id: args.id
            }
        }
    );
    throwExceptionIfOrganizationIsNotDefined(currentOrganization);
    var updateOrganizationData = {
        nameEn: copyValueToObjectIfDefined(args.data.nameEn),
        nameFr: copyValueToObjectIfDefined(args.data.nameFr),
        acronymEn: copyValueToObjectIfDefined(args.data.acronymEn),
        acronymFr: copyValueToObjectIfDefined(args.data.acronymFr)
    };

    return await context.prisma.mutation.updateOrganization({
        where: {
            id: args.id
        },
        data: updateOrganizationData
    }, info);    
}

async function deleteOrganization(_, args, context){
    try {
        await context.prisma.mutation.deleteOrganization({
            where:{
                gcID: args.id
            }
        });
    } catch(e){
        return e;
    }
    return true;


}

function createTeam(_, args, context, info){
    return context.prisma.mutation.createTeam({
        data: {
            nameEn: args.nameEn,
            nameFr: args.nameFr,
            organization: {connect: {id: args.organization.id}},
            owner: {connect: {gcID: args.owner.gcID, email: args.owner.email}}
        }
    }, info);
}

async function modifyTeam(_, args, context, info){
    const currentTeam = await context.prisma.query.teams({
        where :{
            id: args.id
        }
    });
    throwExceptionIfTeamIsNotDefined(currentTeam);
    var updateTeamData = {
        nameEn: copyValueToObjectIfDefined(args.nameEn),
        nameFr: copyValueToObjectIfDefined(args.nameFr)
    };
    if (typeof args.organization !== "undefined"){
        updateTeamData.push({
            organization: {
                connect:{
                    id: args.organization.id
                }                
            }
        });
    }

    if (typeof args.owner !== "undefined"){
        var updateOwnerData = {
            gcID: copyValueToObjectIfDefined(args.owner.gcID),
            email: copyValueToObjectIfDefined(args.owner.email)
        };
        updateTeamData.push({
            ownerID: {
                connect: {
                    updateOwnerData
                }
            } 
        });
    }

    return await context.prisma.mutation.updateTeam({
        where: {
            id: args.id
        },
        data: updateTeamData
    }, info);
}

async function deleteTeam(_, args, context){
    try {
        await context.prisma.mutation.deleteTeam({
            where:{
                gcID: args.id
            }
        });
    } catch(e){
        return e;
    }
    return true;
}


module.exports = {
    createProfile,
    modifyProfile,
    deleteProfile,
    createOrganization,
    modifyOrganization,
    deleteOrganization,
    createTeam,
    modifyTeam,
    deleteTeam
};
