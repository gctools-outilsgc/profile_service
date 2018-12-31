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
    const currentProfile = await context.prisma.query.profile(
        {
            where: {
                gcID: args.gcID
            }            
        },"{gcID, address{id}}");

    throwExceptionIfProfileIsNotDefined(currentProfile);
    var updateProfileData = {
        name: copyValueToObjectIfDefined(args.data.name),
        email: copyValueToObjectIfDefined(args.data.email),
        mobilePhone: copyValueToObjectIfDefined(args.data.mobilePhone),
        officePhone: copyValueToObjectIfDefined(args.data.officePhone),
        titleEn: copyValueToObjectIfDefined(args.data.titleEn),
        titleFr: copyValueToObjectIfDefined(args.data.titleFr),
    };

    if (typeof args.avatar !== "undefined"){
        await processUpload(args.data.avatar).then((url) => {
            updateProfileData.avatar = url;
        });
    }
    
    var address = updateOrCreateAddressOnProfile(args.data, currentProfile);
    if(address != null){
        updateProfileData.address = address;
    }
       
    if (typeof args.data.supervisor !== "undefined") {
        var updateSupervisorData = {
            gcID: copyValueToObjectIfDefined(args.data.supervisor.gcID),
            email: copyValueToObjectIfDefined(args.data.supervisor.email)
        };

        updateProfileData.supervisor = {
                connect: updateSupervisorData
        };
    }
    
    if (typeof args.data.team !== "undefined"){
        updateProfileData.team = {
                connect: {
                    id: args.data.team.id
                }
        };
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
        nameEn: copyValueToObjectIfDefined(args.data.nameEn),
        nameFr: copyValueToObjectIfDefined(args.data.nameFr),

    };
    if (typeof args.data.organization !== "undefined"){
        updateTeamData.organization = {
            connect:{
                id: args.data.organization.id
            }      
        };
    }

    if (typeof args.data.owner !== "undefined"){
        var updateOwnerData = {
            gcID: copyValueToObjectIfDefined(args.data.owner.gcID),
            email: copyValueToObjectIfDefined(args.data.owner.email)
        };
        updateTeamData.owner = {
            connect: updateOwnerData
        };
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
