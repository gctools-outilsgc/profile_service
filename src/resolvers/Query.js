const {copyValueToObjectIfDefined, propertyExists} = require("./helper/objectHelper");
const { addFragmentToInfo } = require("graphql-binding");
const { profileFragment } = require("../Auth/Directives");
const { autoCompleter } = require("../Search/autoComplete");

function search(_, args, context, info){
  return autoCompleter(args.partialName, context, info);
}

function profiles(_, args, context, info) {
  return context.prisma.query.profiles(
    {
      where:{
        gcID: copyValueToObjectIfDefined(args.gcID),
        // eslint-disable-next-line camelcase
        name_contains: copyValueToObjectIfDefined(args.name),
        email: copyValueToObjectIfDefined(args.email),
        // eslint-disable-next-line camelcase
        mobilePhone_contains: copyValueToObjectIfDefined(args.mobilePhone),
        // eslint-disable-next-line camelcase
        officePhone_contains: copyValueToObjectIfDefined(args.officePhone),
        // eslint-disable-next-line camelcase
        titleEn_contains: copyValueToObjectIfDefined(args.titleEn),
        // eslint-disable-next-line camelcase
        titleFr_contains: copyValueToObjectIfDefined(args.titleFr),
      },
      skip: copyValueToObjectIfDefined(args.skip),
      first: copyValueToObjectIfDefined(args.first),
    },
    addFragmentToInfo(info, profileFragment),
  );
}

function addresses(_, args, context, info) {
  return context.prisma.query.addresses(
    {
      where:{
        id: copyValueToObjectIfDefined(args.id),
        // eslint-disable-next-line camelcase
        streetAddress_contains: copyValueToObjectIfDefined(args.streetAddress),
        // eslint-disable-next-line camelcase
        city_contains: copyValueToObjectIfDefined(args.city),
        // eslint-disable-next-line camelcase
        province_contains: copyValueToObjectIfDefined(args.province),
        // eslint-disable-next-line camelcase
        postalCode_contains: copyValueToObjectIfDefined(args.postalCode),
        // eslint-disable-next-line camelcase
        country_contains: copyValueToObjectIfDefined(args.country),
      },
      skip: copyValueToObjectIfDefined(args.skip),
      first: copyValueToObjectIfDefined(args.first),     
    },
    info
  );
}

function teams(_, args, context, info) {

  var ownerOfTeam = {};

  if (propertyExists(args, "owner")){
    ownerOfTeam = {
      gcID: copyValueToObjectIfDefined(args.owner.gcID),
      email: copyValueToObjectIfDefined(args.owner.email)
    };
  }

  return context.prisma.query.teams(
    {
      where:{
        id: copyValueToObjectIfDefined(args.id),
        // eslint-disable-next-line camelcase
        nameEn_contains: copyValueToObjectIfDefined(args.nameEn),
        // eslint-disable-next-line camelcase
        nameFr_contains: copyValueToObjectIfDefined(args.nameFr),
        owner: copyValueToObjectIfDefined(ownerOfTeam)
      },
      skip: copyValueToObjectIfDefined(args.skip),
      first: copyValueToObjectIfDefined(args.first),  
    },
    info
  );
}

function organizations(_, args, context, info){
  return context.prisma.query.organizations(
    {
      where:{
        id: copyValueToObjectIfDefined(args.id),
        // eslint-disable-next-line camelcase
        nameEn_contains:copyValueToObjectIfDefined(args.nameEn),
        // eslint-disable-next-line camelcase
        nameFr_contains: copyValueToObjectIfDefined(args.nameFr),
        // eslint-disable-next-line camelcase
        acronymEn_contains: copyValueToObjectIfDefined(args.acronymEn),
        // eslint-disable-next-line camelcase
        acronymFr_contains: copyValueToObjectIfDefined(args.acronymFr),
      },
      skip: copyValueToObjectIfDefined(args.skip),
      first: copyValueToObjectIfDefined(args.first),
    },
    info
  );
}


module.exports = {
  search,
  profiles,
  addresses,
  teams,
  organizations,
};