const account = require('./AccountMsConnector')

const directiveResolvers = {
    hasRoles: (next, source, {role}, ctx) => {
        const user = getUser()
        if (role === user.role) return next();
        throw new Error(`Must have role: ${role}, you have role: ${user.role}`)
      },
    isAuthenticated: (next, source, ctx) => {
        account.checkAccessToken(ctx)        

      },
    hasScopes: (next, source, ctx) => {
        account.checkAccessToken(ctx)        

      }

}

  module.exports = {
    directiveResolvers
  }