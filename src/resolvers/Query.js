function profiles(_, args, context, info) {
  return context.prisma.query.profiles(
    {
      where:{
        gcId: args.gcId,
        name_contains: args.name,
        email: args.email,
        mobilePhone_contains: args.mobilePhone,
        officePhone_contains: args.officePhone,
        titleEn_contains: args.titleEn,
        titleFr_contains: args.titleFr,                        
      },
      skip: args.skip,
      first: args.first,        
    },
    info
  )
}

function addresses(_, args, context, info) {
  return context.prisma.query.addresses(
    {
      where:{
        id: args.id,
        streetAddress_contains: args.streetAddress,
        city_contains: args.city,
        province_contains: args.province,
        postalCode_contains: args.postalCode,
        country_contains: args.country,
      },
      skip: args.skip,
      first: args.first,      
    },
    info
  )
}

function orgtiers(_, args, context, info) {
  return context.prisma.query.orgtiers(
    {
      where:{
        id: args.id,
        nameEn: args.nameEn,
        nameFr: args.nameFr,
      },
      skip: args.skip,
      first: args.first,  
    },
    info
  )
}

function organizations(_, args, context, info){
  return context.prisma.query.organizations(
    {
      where:{
        id: args.id,
        nameEn: args.nameEn,
        nameFr: args.nameFr,
        acronymEn: args.acronymEn,
        acronymFr: args.acronymFr,
      },
      skip: args.skip,
      first: args.first,  
    },
    info
  )
}


module.exports = {
    profiles,
    addresses,
    orgtiers,
    organizations,
}