const {copyValueToObjectIfDefined} = require("./helper/objectHelper");
const {findExistingProfileOrThrowException} = require("./helper/profileHelper");
const { getNewAddressFromArgs, throwExceptionIfProvinceDoesNotBelongToCountry,
        throwExceptionIfCountryIsDefinedButNotProvince} = require("./helper/addressHelper");

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
    return context.prisma.mutation.createProfile({
        data: createProfileData,
        }, info);
}

function updateExistingAddress(args){
    var updateAddressData = {
        streetAddress: copyValueToObjectIfDefined(args.address.streetAddress),
        city: copyValueToObjectIfDefined(args.address.city),
        postalCode: copyValueToObjectIfDefined(args.address.postalCode)
    };
    if (typeof args.address.country !== "undefined"){
        var selectedCountry = args.address.country.value;
        throwExceptionIfCountryIsDefinedButNotProvince(selectedCountry, args.address.province);
        throwExceptionIfProvinceDoesNotBelongToCountry(selectedCountry, args.address.province);
        updateAddressData.country = selectedCountry;
        updateAddressData.province = args.address.province;
    }
    return { update: updateAddressData };
}


function updateOrCreateAddressOnProfile(args, profile){
    if(typeof args.address === "undefined"){
        return;
    }
    if (profile.address.id !== null){
        return updateExistingAddress(args);
    }
    var newAddress = getNewAddressFromArgs(args);
    if(newAddress != null) {
        return { create:newAddress };
    }
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