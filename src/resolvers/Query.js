const {copyValueToObjectIfDefined} = require("./helper/objectHelper");
const { addFragmentToInfo } = require("graphql-binding");
const { profileFragment } = require("../Auth/Directives");
const { calculateTree, copyNode, getNode }
  = require("../OrgChart/nrc_orgchart_placement");


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
    addFragmentToInfo(info, profileFragment)
  );
}

function orgchart(_, args, context, info) {
  return new Promise((resolve, reject) => {
    context.prisma.query.teams(
      {},
      "{owner {gcID name titleEn titleFr avatar} nameEn nameFr id members {gcID name titleEn titleFr avatar}}"
    ).then((teams) => {
      const profiles = {};
      const children = [];
      teams.forEach((t) => {
        if (!profiles[`gcID-${t.owner.gcID}`]) {
          profiles[`gcID-${t.owner.gcID}`] = {
            uuid: t.owner.gcID,
            gcID: t.owner.gcID,
            name: t.owner.name,
            avatar: t.owner.avatar,
            titleEn: t.owner.titleEn,
            titleFt: t.owner.titleFr,
          department: {
              "en_CA": t.nameEn,
              "fr_CA": t.nameFr,
              id: t.id,
            },
            "direct_reports": [],
          };
        }
        t.members.forEach((m) => {
          if (!profiles[`gcID-${m.gcID}`]) {
            profiles[`gcID-${m.gcID}`] = {
              uuid: m.gcID,
              gcID: m.gcID,
              name: m.name,
              avatar: m.avatar,
              titleEn: m.titleEn,
              titleFt: m.titleFr,
              department: {
                "en_CA": t.nameEn,
                "fr_CA": t.nameFr,
                id: t.id,
              },
              "direct_reports": [],
            };
          }
          profiles[`gcID-${t.owner.gcID}`]
            .direct_reports.push(profiles[`gcID-${m.gcID}`]);
          children.push(`gcID-${m.gcID}`);
        });
      });
      const nodeA = profiles[`gcID-${args.gcIDa}`];
      const nodeB = profiles[`gcID-${args.gcIDb}`];
      const keys = Object.keys(profiles);
      const roots = [];
      keys.forEach((k) => {
        if (!children.includes(k)) {
          roots.push(profiles[k]);
        }
      });
      if (roots.length !== 1 || !nodeA) {
        if (roots.length !== 1) {
          reject("Cannot determine org root");
        } else {
          reject("gcIDa cannot be found.");
        }
      } else {
        const root = roots[0];
        const { boxes, lines } = calculateTree({
          nodeA,
          nodeB,
          root,
          cardHeight: 75,
          cardWidth: 350,
        });
        const { boxes: miniboxes, lines: minilines } = calculateTree({
          nodeA,
          nodeB,
          root,
          cardHeight: 10,
          cardWidth: 47,
          cardPadding: 10,
        });
        resolve({ boxes, lines, miniboxes, minilines });
      }
    });
  }).catch((e) => console.error(e));
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

function teams(_, args, context, info) {
  return context.prisma.query.teams(
    {
      where:{
        id: args.id,
        nameEn: args.nameEn,
        nameFr: args.nameFr,
        owner: {
          gcID: copyValueToObjectIfDefined(args.owner.gcID),
          email: copyValueToObjectIfDefined(args.owner.email)
        }
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
    orgchart,
    addresses,
    teams,
    organizations,
};