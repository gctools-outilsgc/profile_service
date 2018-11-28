const countries = require('countryjs')
const {processUpload} = require('./File-Upload')


function createProfile(_, args, context, info){
    var createProfileData = {}

    createProfileData = {
        gcId: args.gcId,
        name: args.name,
        email: args.email,
    }

    if (args.avatar !== undefined){
        processUpload(args.avatar).then(({url})=>
        {
            createProfileData.avatar= url;
        })
    }
    if (args.mobilePhone !== undefined){
        createProfileData.mobilePhone = args.mobilePhone
    }
    if (args.officePhone !== undefined){
        createProfileData.officePhone = args.officePhone
    }
    if (args.titleEn !== undefined){
        createProfileData.titleEn = args.titleEn
    }
    if (args.titleFr !== undefined){
        createProfileData.titleFr = args.titleFr
    }

    var newAddress = getNewAddressFromArgs(args);
    if(newAddress != null)
    {
        createProfileData.address ={create:newAddress}
    }

    if (args.supervisor !== undefined){
        if (args.supervisor.gcId !== undefined){
            createSupervisorData.push({gcId: args.supervisor.gcId})
        }
        if (args.supervisor.email !== undefined){
            createSupervisorData.push({email: args.supervisor.email})
        }
        createProfileData.push({
            supervisor: {
                connect: {
                    createSupervisorData
                }
            }
        })
    }
    if (args.org !== undefined){
        createProfileData.push({
            org :{
                connect: {
                    id: args.org.id
                }
            }
        })
    }

    return context.prisma.mutation.createProfile({
        data: createProfileData,
        }, info)
}

function getNewAddressFromArgs(args)
{
    if (args.address !== undefined){
        var requiredVariablesError = []
        if (args.address.streetAddress == null)
        {
            requiredVariablesError.push("streetAddress is not defined and is a required field")
        }
        if (args.address.city == null)
        {
            requiredVariablesError.push("city is not defined and is a required field")
        }
        if (args.address.country == null)
        {
            requiredVariablesError.push("country is not defined and is a required field")
        }
        else
        {
            if (args.address.province == null)
            {
                requiredVariablesError.push("province is not defined and is a required field")
            }
            else{
                
                var selectedCountry = args.address.country.value;
                var states = countries.states(selectedCountry)
                if(states && states.length > 0)
                {
                    var selectedProvince = args.address.province;
                    var upperCaseStates = states.map(function(x){ return x.toUpperCase() })
                    var index = upperCaseStates.indexOf(selectedProvince.toUpperCase())
                    if(index === -1)
                    {
                        requiredVariablesError.push("invalid province for selected country")
                    }
                }
            }
        }
        if (args.address.postalCode == null)
        {
            requiredVariablesError.push("postalCode is not defined and is a required field")
        }
        if (requiredVariablesError.length > 0)
        {
            throw new Error(requiredVariablesError)
        }

        //Fix -- issue where [object, object] was saved in the country cell instead of the real value.
        var country = args.address.country;
        args.address.country = country.value;
        return args.address;
    }
    return null;
}

async function modifyProfile(_, args, context, info){
    var updateProfileData = {}
    var updateAddressData = {}
    var updateSupervisorData = {}
    const currentProfile = await context.prisma.Profile(
        {
            where: {
                gcId: args.gcId
            }            
        })

    if (currentProfile == null | undefined){
        throw new Error('Could not find profile with gcId ${args.gcId}')
    }
    
    if (args.name !== undefined) {
        updateProfileData.name = args.name
    }
    if (args.email !== undefined){
        updateProfileData.email = args.email
    }
    if (args.avatar !== undefined){
        updateProfileData.avatar= args.avatar
    }
    if (args.mobilePhone !== undefined){
        updateProfileData.mobilePhone = args.mobilePhone
    }
    if (args.officePhone !== undefined){
        updateProfileData.officePhone = args.officePhone
    }
    if (args.titleEn !== undefined){
        updateProfileData.titleEn = args.titleEn
    }
    if (args.titleFr !== undefined){
        updateProfileData.titleFr = args.titleFr
    }
    if (args.address !== undefined){
        if (currentProfile.address.id !== null){
            if (args.address.streetAddress !== undefined){
                updateAddressData.streetAddress = args.address.streetAddress
            }
            if (args.address.city !== undefined){
                updateAddressData.city = args.address.city
            }
            if (args.address.country !== undefined){
                updateAddressData.country = args.address.country
                if (args.address.province !== undefined)
                {
                    var selectedCountry = args.address.country.value;
                    var states = countries.states(selectedCountry)
                    if(states && states.length > 0)
                    {
                        var selectedProvince = args.address.province;
                        var upperCaseStates = states.map(function(x){ return x.toUpperCase() })
                        var index = upperCaseStates.indexOf(selectedProvince.toUpperCase())
                        if(index === -1)
                        {
                            throw new Error("invalid province for selected country")
                        }
                    }
                    updateAddressData.province = args.address.province
                }
            }
            if (args.address.postalCode !== undefined){
                updateAddressData.postalCode = args.address.postalCode
            }
            updateProfileData.address = {
                update: updateAddressData  
            }
        } else {
            var newAddress = getNewAddressFromArgs(args);
            if(newAddress != null)
            {
                updateProfileData.address ={create:newAddress}
            }
        }        
        
    }
    if (args.supervisor !== undefined){
        if (args.supervisor.gcId !== undefined){
            updateSupervisorData.push({gcId: args.supervisor.gcId})
        }
        if (args.supervisor.email !== undefined){
            updateSupervisorData.push({email: args.supervisor.email})
        }
        updateProfileData.push({
            supervisor: {
                connect: {
                    updateSupervisorData
                }
            }
        })
    }
    if (args.org !== undefined){
        updateProfileData.push({
            org :{
                connect: {
                    id: args.org.id
                }
            }
        })
    }

    return await context.prisma.mutation.updateProfile({
        where:{
        gcId: args.gcId
        },
        data: updateProfileData   
    }, info)    

}

async function deleteProfile(_, args, context){
    return await context.prisma.mutation.deleteProfile({
        where:{
            gcId: args.gcId
        }
    })
}

function createOrganization(_, args, context, info){            
    return context.prisma.mutation.createOrganization({            
        data: {
        nameEn: args.nameEn,
        nameFr: args.nameFr,
        acronymEn: args.acronymEn,        
        acronymFr: args.acronymFr  
        }        
    }, info)
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
    }, info)
}

function modifyOrgTier(_, args, context, info){

}

module.exports = {
    createProfile,
    modifyProfile,
    deleteProfile,
    createOrganization,
    createOrgTier
}