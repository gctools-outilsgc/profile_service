const countries = require("countryjs");

function copyValueToObjectIfDefined(originalValue){
    if(typeof originalValue !== "undefined"){
        return originalValue;
    }
    return null;
}

// function updateObjectValueIfExist(newValue, actualValue){
//     if(typeof newValue !== "undefined"){
//         return newValue;
//     }
//     return actualValue;
// }

function throwExceptionIfProvinceDoesNotBelongToCountry(country, province){
    var states = countries.states(country);
    if(states && states.length > 0) {
        var upperCaseStates = states.map(function(x) {
                                            return x.toUpperCase();
                                        });
        var index = upperCaseStates.indexOf(province.toUpperCase());
        if(index === -1) {
            throw new Error("invalid province for selected country");
        }
    }
}

function validateRequiredField(args, property){
    let value = args[property];
    if(args[property] === null || typeof value === "undefined"){
        return `${property} is not defined and is a required field`;
    }
}

function getNewAddressFromArgs(args) {
    if (typeof args.address === "undefined") {
        return null;
    }

    var errors = [
        validateRequiredField(args.address, "streetAddress"),
        validateRequiredField(args.address, "city"),
        validateRequiredField(args.address, "postalCode"),
        validateRequiredField(args.address, "country"),
        validateRequiredField(args.address, "province"),
    ];
    errors = errors.filter(function (el) {
        return el !== null;
      });
    if (errors.length > 0) {
        throw new Error(errors);
    }

    var selectedCountry = args.address.country.value;
    args.address.country = selectedCountry;
    throwExceptionIfProvinceDoesNotBelongToCountry(selectedCountry, args.address.province);
    return args.address;
}

function createProfile(_, args, context, info){
    var createProfileData = {};

    createProfileData = {
        gcId: args.gcId,
        name: args.name,
        email: args.email,
    };

    if (typeof args.avatar !== "undefined") {
        createProfileData.avatar= args.avatar;
    }
    if (typeof args.mobilePhone !== "undefined"){
        createProfileData.mobilePhone = args.mobilePhone;
    }
    if (typeof args.officePhone !== "undefined"){
        createProfileData.officePhone = args.officePhone;
    }
    if (typeof args.titleEn !== "undefined"){
        createProfileData.titleEn = args.titleEn;
    }
    if (typeof args.titleFr !== "undefined"){
        createProfileData.titleFr = args.titleFr;
    }
    var newAddress = getNewAddressFromArgs(args);
    if(newAddress != null) {
        createProfileData.address ={create:newAddress};
    }
    if (typeof args.supervisor !== "undefined") {
        var createSupervisorData = {};
        if (typeof args.supervisor.gcId !== "undefined"){
            createSupervisorData.push({gcId: args.supervisor.gcId});
        }
        if (typeof args.supervisor.email !== "undefined"){
            createSupervisorData.push({email: args.supervisor.email});
        }
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
    var updateProfileData = {};
    var updateAddressData = {};
    var updateSupervisorData = {};
    const currentProfile = await context.prisma.Profile(
        {
            where: {
                gcId: args.gcId
            }            
        });

    if (currentProfile === null || typeof currentProfile === "undefined"){
        throw new Error("Could not find profile with gcId ${args.gcId}");
    }
    if (typeof args.name !== "undefined") {
        updateProfileData.name = args.name;
    }
    if (typeof args.email !== "undefined"){
        updateProfileData.email = args.email;
    }
    if (typeof args.avatar !== "undefined"){
        updateProfileData.avatar= args.avatar;
    }
    if (typeof args.mobilePhone !== "undefined"){
        updateProfileData.mobilePhone = args.mobilePhone;
    }
    if (typeof args.officePhone !== "undefined"){
        updateProfileData.officePhone = args.officePhone;
    }
    if (typeof args.titleEn !== "undefined"){
        updateProfileData.titleEn = args.titleEn;
    }
    if (typeof args.titleFr !== "undefined"){
        updateProfileData.titleFr = args.titleFr;
    }
    if (typeof args.address !== "undefined") {
        if (currentProfile.address.id !== null){
            if (typeof args.address.streetAddress !== "undefined"){
                updateAddressData.streetAddress = args.address.streetAddress;
            }
            if (typeof args.address.city !== "undefined"){
                updateAddressData.city = args.address.city;
            }
            if (typeof args.address.country !== "undefined"){
                updateAddressData.country = args.address.country.value;
                if (typeof args.address.province !== "undefined") {
                    throwExceptionIfProvinceDoesNotBelongToCountry(updateAddressData.country, args.address.province);
                    updateAddressData.province = args.address.province;
                }
            }
            if (typeof args.address.postalCode !== "undefined"){
                updateAddressData.postalCode = args.address.postalCode;
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
    if (typeof args.supervisor !== "undefined"){
        if (typeof args.supervisor.gcId !== "undefined"){
            updateSupervisorData.push({gcId: args.supervisor.gcId});
        }
        if (typeof args.supervisor.email !== "undefined"){
            updateSupervisorData.push({email: args.supervisor.email});
        }
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