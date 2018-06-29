function createProfile(_, args, context, info){
    return context.prisma.mutation.createProfile({
        data:{
            gcId: args.gcId,
            name: args.name,
            email: args.email,
            avatar: args.avatar,
            mobilePhone: args.mobilePhone,
            officePhone: args.officePhone,
            titleEn: args.titleEn,
            titleFr: args.titleFr,
            address: {
                create: {
                    streetAddress: args.address.streetAddress,
                    city: args.address.city,
                    province: args.address.province,
                    postalCode: args.address.postalCode,
                    country: args.address.country
                }
            }
        },
    }, info)
}

async function modifyProfile(_, args, context, info){
    var updateProfileData = {}
    var updateAddressData = {}
    var updateSupervisorData = {}
    const profile = await context.prisma.query.profile({
        where:{
            gcId: args.gcId
        }
    })
    if (!profile){
        throw new Error('Could not find profile with gcId ${args.gcId}')
    }    
    if (args.name !== undefined) {
        updateProfileData.push({name: args.name})
    }
    if (args.email !== undefined){
        updateProfileData.push({email: args.email})
    }
    if (args.avatar !== undefined){
        updateProfileData.push({avatar: args.avatar})
    }
    if (args.mobilePhone !== undefined){
        updateProfileData.push({mobilePhone: args.mobilePhone})
    }
    if (args.officePhone !== undefined){
        updateProfileData.push({officePhone: args.officePhone})
    }
    if (args.titleEn !== undefined){
        updateProfileData.push({titleEn: args.titleEn})
    }
    if (args.titleFr !== undefined){
        updateProfileData.push({titleFr: args.titleFr})
    }
    if (args.address !== undefined){
        if (args.address.streetAddress !== undefined){
            updateAddressData.push({streetAddress: args.address.streetAddress})
        }
        if (args.address.city !== undefined){
            updateAddressData.push({city: args.address.city})
        }
        if (args.address.province !== undefined){
            updateAddressData.push({province: args.address.province})
        }
        if (args.address.postalCode !== undefined){
            updateAddressData.push({postalCode: args.address.postalCode})
        }
        if (args.address.country !== undefined){
            updateAddressData.push({country: args.address.country})
        }
        updateProfileData.push({address:{
            upsert: {
                update: {updateAddressData},
                create: {updateAddressData}
            }
        }
        })
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
                    id = args.org.id
                }
            }
        })
    }

    return await context.prisma.mutation.updateProfile({
        where:{
        gcId: profile.gcId
        },
        data:{
            updateProfileData
        }
    }, info)    
    
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
    createOrganization,
    createOrgTier
}