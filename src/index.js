const { GraphQLServer } = require("graphql-yoga");
const { Prisma } = require("prisma-binding");
const {EmailAddress, PostalCode} =  require("@okgrow/graphql-scalars");
const Query = require("./resolvers/Query");
const Mutation = require("./resolvers/Mutations");
const {Country, Province, PhoneNumber} = require("./resolvers/Scalars");
const config = require("./config");
const AuthDirectives = require('./Auth/Directives');

const resolvers = {
  Query,
  Mutation,
  Country, Province,
  Email : EmailAddress,
  PhoneNumber,
  PostalCode
}



const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  schemaDirectives: {
    isAuthenticated: AuthDirectives.AuthenticatedDirective,
    isOwner: AuthDirectives.OwnerDirective,
  },
  resolverValidationOptions: {
    requireResolversForResolveType: false 
  },
  context: req => ({
    req,
    prisma: new Prisma({
      typeDefs: './src/generated/prisma.graphql',
      endpoint: 'http://'+config.prisma.host+':4466/profile/',
      debug: config.prisma.debug,
    }),
  }),
})
const options = {
  port: 4000,
  endpoint: '/graphql',
  subscriptions: '/subscriptions',
  playground: '/playground',
}
server.start(options,() => console.log(`GraphQL server is running on http://localhost:4000`))