require('dotenv').config()

const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutations')
const directives = require('./Auth/Permissions')
const jwt = require('express-jwt')
const fetch = require('node-fetch')

const resolvers = {
  Query,
  Mutation,
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  directives,
  resolverValidationOptions: {
    requireResolversForResolveType: false 
  },
  context: req => ({
    ...req,
    prisma: new Prisma({
      typeDefs: './src/generated/prisma.graphql',
      endpoint: 'http://prisma:4466/profile/dev',
      debug: true,
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