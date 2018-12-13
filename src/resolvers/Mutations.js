const {copyValueToObjectIfDefined} = require("./helper/objectHelper");
const { throwExceptionIfProfileIsNotDefined} = require("./helper/profileHelper");
const { getNewAddressFromArgs, updateOrCreateAddressOnProfile} = require("./helper/addressHelper");
const {processUpload} = require("./File-Upload");
const {throwExceptionIfOrganizationIsNotDefined} = require("./helper/organizationHelper");
const {throwExceptionIfOrgIsNotDefined} = require("./helper/orgHelper");

async function createProfile(_, args, context, info){
    var createProfileData = {
        gcId: args.gcId,
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
    if (typeof args.supervisor !== "undefined") {
        var createSupervisorData = {
            gcId: copyValueToObjectIfDefined(args.supervisor.gcId),
            email: copyValueToObjectIfDefined(args.supervisor.email)
        };
        createProfileData.push({
            supervisor: {
                connect: {
                    createSupervisorData,
                },
            },
        });
    }

    if (typeof args.org !== "undefined"){
        createProfileData.push({
            org :{
                connect: {
                    id: args.org.id
                },
            },
        });
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
                gcId: args.gcId
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
            gcId: copyValueToObjectIfDefined(args.supervisor.gcId),
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
    
    if (typeof args.org !== "undefined"){
        updateProfileData.push({
            org :{
                connect: {
                    id: args.org.id
                }
            }
        });
    }

    return await context.prisma.mutation.updateProfile({
        where:{
        gcId: args.gcId
        },
        data: updateProfileData   
    }, info);    
}

async function deleteProfile(_, args, context){
    return await context.prisma.mutation.deleteProfile({
        where:{
            gcId: args.gcId
        }
    });
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
                id: args.idprofile
            }
        }
    );
    throwExceptionIfOrganizationIsNotDefined(currentOrganization);
    var updateOrganizationData = {
        nameEn: copyValueToObjectIfDefined(args.nameEn),
        nameFr: copyValueToObjectIfDefined(args.nameFr),
        acronymEn: copyValueToObjectIfDefined(args.acronymEn),
        acronymFr: copyValueToObjectIfDefined(args.acronymFr)
    };

    return await context.prisma.mutation.updateOrganization({
        where: {
            id: args.id
        },
        data: updateOrganizationData
    }, info);    
}

function createOrgTier(_, args, context, info){
    return context.prisma.mutation.createOrgTier({
        data: {
            nameEn: args.nameEn,
            nameFr: args.nameFr,
            organization: {connect: {id: args.organization.id}}
        }
    }, info);
}

async function modifyOrgTier(_, args, context, info){
    const currentOrgTier = await context.prisma.query.orgTiers({
        where :{
            id: args.id
        }
    });
    throwExceptionIfOrgIsNotDefined(currentOrgTier);
    var updateOrgTierData = {
        nameEn: copyValueToObjectIfDefined(args.nameEn),
        nameFr: copyValueToObjectIfDefined(args.nameFr)
    };
    if (typeof args.organization !== "undefined"){
        updateOrgTierData.push({
            organization: {
                connect:{
                    id: args.organization.id
                }                
            }
        });
    }

    if (typeof args.owner !== "undefined"){
        var updateOwnerData = {
            gcId: copyValueToObjectIfDefined(args.owner.gcId),
            email: copyValueToObjectIfDefined(args.owner.email)
        };
        updateOrgTierData.push({
            ownerID: {
                connect: {
                    updateOwnerData
                }
            } 
        });
    }

    return await context.prisma.mutation.updateOrgTier({
        where: {
            id: args.id
        },
        data: updateOrgTierData
    }, info);
}

module.exports = {
    createProfile,
    modifyProfile,
    deleteProfile,
    createOrganization,
    modifyOrganization,
    createOrgTier,
    modifyOrgTier
};
