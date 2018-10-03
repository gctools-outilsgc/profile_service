const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')
const {EmailAddress, RegularExpression, PostalCode} =  require("@okgrow/graphql-scalars")
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutations')
const {Country, Province} = require('./resolvers/Scalars')
const config = require('./config')

const PhoneNumberRegex = new RegularExpression("PhoneNumberRegex", /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)

const resolvers = {
  Query,
  Mutation,
  Country, Province,
  Email : EmailAddress,
  PhoneNumberRegex,
  PostalCode
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false 
  },
  context: req => ({
    ...req,
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