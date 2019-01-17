const account = require("./AccountMsConnector");
const { SchemaDirectiveVisitor } = require("apollo-server");
const { defaultFieldResolver } = require("graphql");

function getOwner(query){
  // Get the gcId either trough the query or by using the ID on the query and finding the user with Prisma.
  try{
    if(query["gcId"]){
      return query["gcId"];
    } else {
      checkPrisma;
    }
  } catch(e){
      console.error("The @isOwner directive should only be used on resolvers that have a gcId or ID requirement");
      console.error(e);
  }
}

class AuthenticatedDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function(...args) {
      const [, , ctx] = args;

      await account.getTokenInfo(ctx);
      if (ctx.token.sub){
        const result = await resolve.apply(this, args);
        return result;
      } else {
        throw new Error("Access Token is not valid or system error");
      }
    };
  }
}

class OwnerDirective extends SchemaDirectiveVisitor{
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function(...args) {
      const [, requestQuery, ctx] = args;
      //const [, gcId] = await Promise.all([account.getTokenInfo(ctx), getOwner(requestQuery)]);
      // Get the owner of the object and verify if the access token owner is the same.
      await account.getTokenInfo(ctx);
      await getOwner(requestQuery);
      if(gcId == ctx.token.sub){
        const result = await resolve.apply(this, args);
        return result;      
      } else {
        throw new Error("Must be owner of the data to access");
      }

    };
  }
}

module.exports = {
  AuthenticatedDirective,
  OwnerDirective,
};