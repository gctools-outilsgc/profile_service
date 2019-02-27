const { SchemaDirectiveVisitor, AuthenticationError } = require("apollo-server");
const { propertyExists } = require("../resolvers/helper/objectHelper");
const { defaultFieldResolver } = require("graphql");

const { blockValue, getOrganizationid, getTeamid, getSupervisorid, getOwnerid } = require("./helpers");

/*
  Fragments for Auth:
  These fragments will ensure that the fields that are required to identify relationships for access
  levels will always be returned.
*/
const profileFragment = "fragment authProfile on Profile {gcID, name, email, team{id, owner{gcID}, organization{id}}}";


// inOrganization directive can only be used on the Profile object fields.
// This diretive automatically implements the isAuthenticated directive

class OrganizationDirective extends SchemaDirectiveVisitor {

  visitObject(type){
    this.wrapOrgAuth(type);
    type._requiresOrgAuth = true;
  }

  visitFieldDefinition(field, parent) {
    this.wrapOrgAuth(parent.objectType);
    field._requiresOrgAuth = true;

  }

  wrapOrgAuth(objectType){
    if (objectType._fieldsWrapped) {
      return;
    }

    objectType._fieldsWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName];
      const { resolve = defaultFieldResolver } = field;

      field.resolve = async function (record, args, context, info){

        const requireOrgAuth = field._requiresOrgAuth || objectType._requiresOrgAuth;

        if (!requireOrgAuth){
          return await resolve.apply(this, [record, args, context, info]);
        }

        const requesterOrg = await getOrganizationid(context.token.owner);
        const recordOrg = await getOrganizationid(record);

        if(requesterOrg !== null && recordOrg !== null){
          if (requesterOrg === recordOrg){
            return await resolve.apply(this, [record, args, context, info]);
          }
        }
        return await blockValue(field);
      };

    });


  }
}

class AuthenticatedDirective extends SchemaDirectiveVisitor {

  visitObject(type){
    this.wrapAuth(type);
    type._requiresAuth = true;
  }

  visitFieldDefinition(field, details){
    this.wrapAuth(details.objectType);
    field._requiresAuth = true;
  }

  wrapAuth(objectType){
    if (objectType._fieldsWrapped) {
      return;
    }

    objectType._fieldsWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName];
      const { resolve = defaultFieldResolver } = field;

      field.resolve = async function (record, args, context, info){
        const requireAuth = field._requiresAuth || objectType._requiresAuth;
        if (!requireAuth){
          return await resolve.apply(this, [record, args, context, info]);
        }
        if (propertyExists(context.token,"sub")){
          return resolve.apply(this, [record, args, context, info]);
        } else {
            return await blockValue(field);
        }

      };

    });

  }
}

class SameTeamDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function(...args) {
      const [record, requestArgs , ctx] = args;

      const requesterTeam = await getTeamid(ctx.token.owner);
      const requestedTeam =  await getTeamid(record);

      if(requesterTeam !== null && requestedTeam !== null){
        if(requesterTeam === requestedTeam){
          return resolve.apply(this, args);
        }
      }

      return await blockValue(field);
    };
  }
}

class SupervisorDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function(...args) {
      const [record, requestArgs , ctx] = args;

      const requester = ctx.token.sub;
      const requestedSuper = await getSupervisorid(record);

      if(requester !== null && requestedSuper !== null){
        if(requester === requestedSuper){
            return resolve.apply(this, args);
        }
      }

      return await blockValue(field);
    };
  }
}
class OwnerDirective extends SchemaDirectiveVisitor {
    
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function (record, args, context, info){

      const OwnerRequester = await getOwnerid(context.token.owner);
      const OwnerRequested = await getOwnerid(record);

      if(OwnerRequester !== null && OwnerRequested !== null){
        if(OwnerRequester === OwnerRequested){
            return resolve.apply(this, [record, args, context, info]);
        }
      }

      return await blockValue(field);
    };
  }
}

module.exports = {
  OrganizationDirective,
  AuthenticatedDirective,
  SupervisorDirective,
  SameTeamDirective,
  OwnerDirective,
  profileFragment
};
