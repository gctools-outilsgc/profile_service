const account = require('./AccountMsConnector')
const { SchemaDirectiveVisitor } = require('graphql-tools');
const { defaultFieldResolver } = require('graphql');

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
        throw new Error('Access Token is not valid or system error')
      }
    }
  };
}

class OwnerDirective extends SchemaDirectiveVisitor{
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function(...args) {
      const [, requestQuery, ctx] = args;
      const [, subject] = await Promise.all([account.getTokenInfo(ctx), getSubject(requestQuery)]);
      if(subject.gcId == ctx.token.sub){
        const result = await resolve.apply(this, args);
        return result;      
      } else {
        throw new Error('Must be owner of the data to access');
      }

    }
  }
}

function getSubject(query){
  try{
    if(query['ID'] || query['gcId']){
      return {id:query['ID'], gcId:query['gcId']};
    }
  } catch(e){
      console.error('The @isOwner directive should only be used on resolvers that have a gcId or ID requirement');
      console.error(e);
  }
}


  module.exports = {
    AuthenticatedDirective,
    OwnerDirective,
  }