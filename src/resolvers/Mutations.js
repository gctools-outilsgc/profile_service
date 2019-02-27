const {copyValueToObjectIfDefined, propertyExists} = require("./helper/objectHelper");
const { throwExceptionIfProfileIsNotDefined, getSupervisorFromArgs} = require("./helper/profileHelper");
const { getNewAddressFromArgs, updateOrCreateAddressOnProfile} = require("./helper/addressHelper");
const {processUpload} = require("./File-Upload");
const { UserInputError } = require("apollo-server");

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

    if ( propertyExists(args, "avatar")){
        await processUpload(args.avatar).then((url) => {
            createProfileData.avatar = url;
        });
    }

    if (propertyExists(args, "address")){
        var address = getNewAddressFromArgs(args);
        if(address != null) {
            createProfileData.address = {create:address};
        }
    }



    if (propertyExists(args, "supervisor")) {
        var updateSupervisorData = {
            gcID: copyValueToObjectIfDefined(args.supervisor.gcID),
            email: copyValueToObjectIfDefined(args.supervisor.email)
        };

        createProfileData.supervisor = {
                connect: updateSupervisorData
        };
    }

    if (propertyExists(args, "team")){
        createProfileData.team = {
                connect: {
                    id: args.team.id
                }
        };
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

    if (propertyExists(args.data, "avatar")){
        await processUpload(args.data.avatar).then((url) => {
            updateProfileData.avatar = url;
        });
    }

    if (propertyExists(args.data, "address")){
        var address = updateOrCreateAddressOnProfile(args, currentProfile);
        if(address != null){
            updateProfileData.address = address;
        }
    }


    if (propertyExists(args.data, "supervisor")) {
        var updateSupervisorData = {
            gcID: copyValueToObjectIfDefined(args.data.supervisor.gcID),
            email: copyValueToObjectIfDefined(args.data.supervisor.email)
        };

        updateProfileData.supervisor = {
                connect: updateSupervisorData
        };
    }

    if (propertyExists(args.data, "team")){
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
        throw new UserInputError("Profile does not exist");
    }
    return true;

}



function createOrganization(_, args, context, info){
    return context.prisma.mutation.createOrganization({
        data: {
        nameEn: args.nameEn,
        nameFr: args.nameFr,
        acronymEn: args.acronymEn,        
        acronymFr: args.acronymFr,
        teams:{
            create:{
                nameEn: "",
                nameFr: "",
            }
        }  
        }        
    }, info);
}

async function modifyOrganization(_, args, context, info){

    // eslint-disable-next-line new-cap
    if (!context.prisma.exists.Organization({id:args.id})){
        throw new UserInputError("Organization does not Exist");
    }

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

    // eslint-disable-next-line new-cap
    if (await context.prisma.exists.Organization({id:args.id})){
        try {
            await context.prisma.mutation.deleteOrganization({
                where:{
                    id: args.id
                }
            });
        } catch(e){
            return false;
        }
        return true;
    }
    throw new UserInputError("Organization does not exist");



}

function createTeam(_, args, context, info){
    return context.prisma.mutation.createTeam({
        data: {
            nameEn: args.nameEn,
            nameFr: args.nameFr,
            descriptionEn: args.descriptionEn,
            descriptionFr: args.descriptionFr,
            organization: {connect: {id: args.organization.id}},
            owner: {connect: {gcID: args.owner.gcID, email: args.owner.email}}
        }
    }, info);
}

async function modifyTeam(_, args, context, info){
    // eslint-disable-next-line new-cap
    if (!context.prisma.exists.Team({id:args.id})){
        throw new UserInputError("Team does not exist");
    }

    var updateTeamData = {
        nameEn: copyValueToObjectIfDefined(args.data.nameEn),
        nameFr: copyValueToObjectIfDefined(args.data.nameFr),
        descriptionEn: copyValueToObjectIfDefined(args.data.descriptionEn),
        descriptionFr: copyValueToObjectIfDefined(args.data.descriptionFr),
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

    // eslint-disable-next-line new-cap
    if (await context.prisma.exists.Team({id:args.id})){
        try {
            await context.prisma.mutation.deleteTeam({
                where:{
                    id: args.id
                }
            });
        } catch(e){
        return false;
        }
        return true;
    }
    throw new UserInputError("Team does not exist");
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
