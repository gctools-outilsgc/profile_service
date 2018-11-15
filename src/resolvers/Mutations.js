const {copyValueToObjectIfDefined} = require("./helper/objectHelper");
const {findExistingProfileOrThrowException} = require("./helper/profileHelper");
const {getNewAddressFromArgs, throwExceptionIfProvinceDoesNotBelongToCountry} = require("./helper/addressHelper");

function createProfile(_, args, context, info){
    var createProfileData = {
        gcId: args.gcId,
        name: args.name,
        email: args.email,
        avatar: copyValueToObjectIfDefined(args.avatar),
        mobilePhone: copyValueToObjectIfDefined(args.mobilePhone),
        officePhone: copyValueToObjectIfDefined(args.officePhone),
        titleEn: copyValueToObjectIfDefined(args.titleEn),
        titleFr: copyValueToObjectIfDefined(args.titleFr)
    };
    
    var newAddress = getNewAddressFromArgs(args);
    if(newAddress != null) {
        createProfileData.address = {create:newAddress};
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
                    id: args.org.id,
                },
            },
        });
    }
    return context.prisma.mutation.createProfile({
        data: createProfileData,
        }, info);
}

async function modifyProfile(_, args, context, info){
    const currentProfile = await findExistingProfileOrThrowException(context, args.gcId);
    var updateProfileData = {
        name: args.name,
        email: args.email,
        avatar: copyValueToObjectIfDefined(args.avatar),
        mobilePhone: copyValueToObjectIfDefined(args.mobilePhone),
        officePhone: copyValueToObjectIfDefined(args.officePhone),
        titleEn: copyValueToObjectIfDefined(args.titleEn),
        titleFr: copyValueToObjectIfDefined(args.titleFr),
    };

    if (typeof args.address !== "undefined") {
        if (currentProfile.address.id !== null){
            var updateAddressData = {
                streetAddress: copyValueToObjectIfDefined(args.address.streetAddress),
                city: copyValueToObjectIfDefined(args.address.city),
                postalCode: copyValueToObjectIfDefined(args.address.postalCode)
            };
            if (typeof args.address.country !== "undefined"){
                updateAddressData.country = args.address.country.value;
                if (typeof args.address.province !== "undefined") {
                    throwExceptionIfProvinceDoesNotBelongToCountry(updateAddressData.country, args.address.province);
                    updateAddressData.province = args.address.province;
                }
            }
            updateProfileData.address = {
                update: updateAddressData  
            };
        } else {
            var newAddress = getNewAddressFromArgs(args);
            if(newAddress != null) {
                updateProfileData.address ={create:newAddress};
            }
        }  
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

function modifyOrganization(_, args, context, info){
    
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

function modifyOrgTier(_, args, context, info){

}

module.exports = {
    createProfile,
    modifyProfile,
    deleteProfile,
    createOrganization,
    createOrgTier
};