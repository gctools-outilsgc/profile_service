const { SchemaDirectiveVisitor } = require("apollo-server");
const { defaultFieldResolver } = require("graphql");
const { propertyExists } = require("../resolvers/helper/objectHelper");

/*
class OrganizationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const {resolve = defaultFieldResolver } = field;
    field.resolve = async function(... args) {
      const [, requestArgs , ctx] = args;
      const requester = await ctx.prisma.query.profiles({
        where:{
          gcID: ctx.token.sub
        }
      }, "{team{organization{id}}}");

      const requested = await ctx.prisma.query.profiles({
        where:{
          gcID: ctx.token.sub
        }
      }, "{team{organization{id}}}");

    };
  }
}
*/

class AuthenticatedDirective extends SchemaDirectiveVisitor {

  // Handles to see if there is auth required at the object level
  visitObject(type) {
    this.ensureFieldsWrapped(type);
    type._requiresAuth = true;
  }
  
  // Handles to see if there is auth required at the field level
  visitFieldDefinition(field, details){
    this.ensureFieldsWrapped(details.objectType);
    field._requiresAuth = true;
  }

  // Handles the actual logic of ensuring Auth 
  ensureFieldsWrapped(objectType){

    // Mark the object or field coming through so we avoid re-wrapping
    if (objectType._authFieldsWrapped){
      return;
    }
    objectType._authFieldsWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName];
      const {resolve = defaultFieldResolver } = field;
      field.resolve = async function (... args) {
        // Get the context so we can use the token info
        const [, , ctx] = args;

        // Get the Auth required setting from field first and fall back to oject if defined.
        const requiresAuth = field._requiresAuth || objectType._requiresAuth;

        // If no auth is required then pass through
        if (!requiresAuth){
          return resolve.apply(this.args);
        }

        // If auth is required then put it through the wringer
        // If there is a sub in the token then it's valid.
        if (propertyExists(ctx.token,"sub")){
          const result = await resolve.apply(this, args);
          return result;
        } else {
          throw new Error("Requires authentication to view");
        }
      };
    });
  }
}

module.exports = {
  // OrganizationDirective,
  AuthenticatedDirective
};