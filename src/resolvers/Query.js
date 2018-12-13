function profiles(_, args, context, info) {
  return context.prisma.query.profiles(
    {
      where:{
        gcId: args.gcId,
        // eslint-disable-next-line camelcase
        name_contains: args.name,
        email: args.email,
        // eslint-disable-next-line camelcase
        mobilePhone_contains: args.mobilePhone,
        // eslint-disable-next-line camelcase
        officePhone_contains: args.officePhone,
        // eslint-disable-next-line camelcase
        titleEn_contains: args.titleEn,
        // eslint-disable-next-line camelcase
        titleFr_contains: args.titleFr,                        
      },
      skip: args.skip,
      first: args.first,        
    },
    info
  );
}

function addresses(_, args, context, info) {
  return context.prisma.query.addresses(
    {
      where:{
        id: args.id,
        // eslint-disable-next-line camelcase
        streetAddress_contains: args.streetAddress,
        // eslint-disable-next-line camelcase
        city_contains: args.city,
        // eslint-disable-next-line camelcase
        province_contains: args.province,
        // eslint-disable-next-line camelcase
        postalCode_contains: args.postalCode,
        // eslint-disable-next-line camelcase
        country_contains: args.country,
      },
      skip: args.skip,
      first: args.first,      
    },
    info
  );
}

function orgtiers(_, args, context, info) {
  return context.prisma.query.orgTiers(
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
  );
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
  );
}


module.exports = {
    profiles,
    addresses,
    orgtiers,
    organizations,
};