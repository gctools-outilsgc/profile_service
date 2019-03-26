const {copyValueToObjectIfDefined, propertyExists} = require("./helper/objectHelper");
const { throwExceptionIfProfileIsNotDefined, changeOwnedTeamsRoot, moveMembersToDefaultTeam} = require("./helper/profileHelper");
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
        titleFr: copyValueToObjectIfDefined(args.titleFr),
        ownerOfTeams:{
            create:{
                nameEn:"User Default Team",
                nameFr:"Équipe par défaut d'utilisateur",
                organization: {connect: {id: context.defaults.org.id}}              
            }
        }
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



    if (propertyExists(args, "team")){
        const teamInfo = await context.prisma.query.team({where:{id: args.team.id}}, "{organization{id}}");

        createProfileData.team = {
                connect: {
                    id: args.team.id
                }
        };

        // Make sure the new default team is created in the same organization the user belongs to.

        createProfileData.ownerOfTeams.create.organization.connect.id = teamInfo.organization.id;
    }


    return await context.prisma.mutation.createProfile({
        data: createProfileData,
        }, info);
}

async function modifyProfile(_, args, context, info){

    var changeTeams = false;
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


    if (propertyExists(args.data, "team")){
        updateProfileData.team = {
                connect: {
                    id: args.data.team.id
                }
        };

        changeTeams = true;

    }

    if (changeTeams){
        await changeOwnedTeamsRoot(args.gcID, args.data.team.id, context);
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
                nameEn: "Organization Default Team",
                nameFr: "Équipe par defaut d'organization",
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

async function createTeam(_, args, context, info){

    var teamAvatar = "";

    if ( propertyExists(args, "avatar")){
        await processUpload(args.avatar).then((url) => {
            teamAvatar = url;
        });
    }

    return await context.prisma.mutation.createTeam({
        data: {
            nameEn: args.nameEn,
            nameFr: args.nameFr,
            descriptionEn: copyValueToObjectIfDefined(args.descriptionEn),
            descriptionFr: copyValueToObjectIfDefined(args.descriptionFr),
            colour: copyValueToObjectIfDefined(args.colour),
            avatar: copyValueToObjectIfDefined(teamAvatar),
            organization: {connect: {id: args.organization.id}},
            owner: {connect: {gcID: copyValueToObjectIfDefined(args.owner.gcID), email: copyValueToObjectIfDefined(args.owner.email)}}
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
        colour: copyValueToObjectIfDefined(args.data.colour)
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

    if ( propertyExists(args, "avatar")){
        await processUpload(args.avatar).then((url) => {
            updateTeamData.avatar = url;
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

    // eslint-disable-next-line new-cap
    if (await context.prisma.exists.Team({id:args.id})){
        try {

            await moveMembersToDefaultTeam(args.id, context);
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
