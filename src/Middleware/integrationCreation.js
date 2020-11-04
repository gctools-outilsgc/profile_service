const { getProfile, checkForDirective, } = require("./common");
const { copyValueToObjectIfDefined, removeNullKeys, isEmpty } = require("../Resolvers/helper/objectHelper");
const { getNewAddressFromArgs } = require("../Resolvers/helper/addressHelper");

/*-------------------------------------------------------------------------
With new integrations into PaaS, save record of user using external source
 - Checks for additional context header: integrationsource
 - Only one data object per user
 - Update object if exists
--------------------------------------------------------------------------*/

// Create integration object
async function createIntegration(_, args, context) {

  // Get the user's profile information to compare
  const currentProfile = await getProfile(context, args);

  const info = `{
      id
      gcID
      source
      integrationID
      lastSync
      changes {
        name
        email
        avatar
        mobilePhone
        officePhone
        titleEn
        titleFr
      }
    }`;

  // Assign unique integrationID if supplied from context
  var integrationID = null;
  if (context.req.headers.integrationid) {
    integrationID = context.req.headers.integrationid
  }

  // Create data object for mutation
  // Only add information to changes if it differs from current profile information
  const data = removeNullKeys({
    gcID: Number(args.gcID),
    source: context.req.headers.integrationsource,
    integrationID: integrationID,
    lastSync: await Date.now().toString(),
    changes: {
      create: {
        name: (args.data.name != currentProfile.name) ? args.data.name : null,
        email: (args.data.email != currentProfile.email) ? args.data.email : null,
        avatar: (args.data.avatar != currentProfile.avatar) ? args.data.avatar : null,
        mobilePhone: (args.data.mobilePhone != currentProfile.mobilePhone) ? args.data.mobilePhone : null,
        officePhone: (args.data.officePhone != currentProfile.officePhone) ? args.data.officePhone : null,
        titleEn: (args.data.titleEn != currentProfile.titleEn) ? args.data.titleEn : null,
        titleFr: (args.data.titleFr != currentProfile.titleFr) ? args.data.titleFr : null,
        address: (args.data.address) ? {
          create: {
            streetAddress: (args.data.address.streetAddress != currentProfile.address.streetAddress) ? args.data.address.streetAddress : null,
            city: (args.data.address.city != currentProfile.address.city) ? args.data.address.city : null,
            province: (args.data.address.province != currentProfile.address.province) ? args.data.address.province : null,
            postalCode: (args.data.address.postalCode != currentProfile.address.postalCode) ? args.data.address.postalCode : null,
            country: (args.data.address.country != currentProfile.address.country) ? args.data.address.country : null,
          }
        } : null
      }
    },
  });

  // Fire off mutation
  return await context.prisma.mutation.createIntegration({
    data
  }, info)
    .then((result) => {
      return result;
    })
    .catch((e) =>{
      return e;
    });
  
}

// Update existing integration object
async function updateIntegration(_, args, context, integrationObject) {

  // Get the user's profile information to compare
  const currentProfile = await getProfile(context, args);

  const info = `{
      id
      gcID
      source
      integrationID
      lastSync
      changes {
        name
        email
        avatar
        mobilePhone
        officePhone
        titleEn
        titleFr
      }
    }`;

  // Assign unique integrationID if supplied from context
  var integrationID = null;
  if (context.req.headers.integrationid) {
    integrationID = context.req.headers.integrationid
  }

  // Check if the ChangesAddress object needs to be created or updated
  // Only display changes in information
  var changesAddressObject;
  if(integrationObject.changes && integrationObject.changes.address && args.data.address) {
    changesAddressObject = {
      update: {
        streetAddress: (args.data.address.streetAddress != currentProfile.address.streetAddress) ? args.data.address.streetAddress : null,
        city: (args.data.address.city != currentProfile.address.city) ? args.data.address.city : null,
        province: (args.data.address.province != currentProfile.address.province) ? args.data.address.province : null,
        postalCode: (args.data.address.postalCode != currentProfile.address.postalCode) ? args.data.address.postalCode : null,
        country: (args.data.address.country != currentProfile.address.country) ? args.data.address.country : null,
      }
    }
  } else {
    changesAddressObject = (args.data.address) ? {
      create: {
        streetAddress: (args.data.address.streetAddress != currentProfile.address.streetAddress) ? args.data.address.streetAddress : null,
        city: (args.data.address.city != currentProfile.address.city) ? args.data.address.city : null,
        province: (args.data.address.province != currentProfile.address.province) ? args.data.address.province : null,
        postalCode: (args.data.address.postalCode != currentProfile.address.postalCode) ? args.data.address.postalCode : null,
        country: (args.data.address.country != currentProfile.address.country) ? args.data.address.country : null,
      }
    } : null
  }

  // If address object has no new information to show, delete it
  if(changesAddressObject != null && isEmpty(removeNullKeys(changesAddressObject)) && integrationObject.changes && integrationObject.changes.address){
    await context.prisma.mutation.deleteChangesAddress({
      where: {
        id: integrationObject.changes.address.id
      }
    });
    changesAddressObject = null;
  }

  // Create Changes object for mutation
  // Only add information to changes if it differs from current profile information
  const changesObjectData = {
    name: (args.data.name != currentProfile.name) ? args.data.name : null,
    email: (args.data.email != currentProfile.email) ? args.data.email : null,
    avatar: (args.data.avatar != currentProfile.avatar) ? args.data.avatar : null,
    mobilePhone: (args.data.mobilePhone != currentProfile.mobilePhone) ? args.data.mobilePhone : null,
    officePhone: (args.data.officePhone != currentProfile.officePhone) ? args.data.officePhone : null,
    titleEn: (args.data.titleEn != currentProfile.titleEn) ? args.data.titleEn : null,
    titleFr: (args.data.titleFr != currentProfile.titleFr) ? args.data.titleFr : null,
    address: changesAddressObject
  };

  // Determine if creating new or updating existing object
  var changesObject;
  if(integrationObject.changes) {
    changesObject = { update: changesObjectData };
  } else {
    changesObject = { create: changesObjectData };
  }
  
  // Remove existing Changes object if all fields are null
  if(isEmpty(removeNullKeys(changesObject)) && integrationObject.changes){
    await context.prisma.mutation.deleteChanges({
      where: {
        id: integrationObject.changes.id
      }
    });
    changesObject = null;
  }

  // Format data for mutation
  const data = {
    integrationID: integrationID,
    lastSync: await Date.now().toString(),
    changes: changesObject,
  };

  // Fire off mutation
  return await context.prisma.mutation.updateIntegration({
    where: {
      id: integrationObject.id
    },
    data
  }, info)
    .then((result) => {
      return result;
    })
    .catch((e) =>{
      return e;
    });
}

async function getExistingIntegrations(context, gcID, source) {
  return await context.prisma.query.integrations({
    where: {
      gcID,
      source
    },
  },
    `{
      id
      changes {
        id
        address {
          id
        }
      }
    }`
  );
}

// Based on user information and source
// Determine if new integration needs to be created or update a previusly created integration
async function generateIntegration(context, args) {
  // does integration exist
  var integration = await getExistingIntegrations(context, Number(args.gcID), context.req.headers.integrationsource);
  
  if(integration.length > 0){
    await updateIntegration(null, args, context, integration[0])
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.log(e);
      });
  } else {
    await createIntegration(null, args, context)
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.log(e);
      });
  }
  return;
}

// Check if additonal information has been passed -> context.req.headers.integrationsource
// If not - continue business as usual
const hasIntegrationSource = async (resolve, root, args, context, info) => {
  if(context.req.headers.integrationsource) {
    await Promise.all(
      [
        generateIntegration(context, args),
      ]);
      return await resolve(root, args, context, info);
  } else {
    return await resolve(root, args, context, info);
  }
};

module.exports = {
  hasIntegrationSource
};
