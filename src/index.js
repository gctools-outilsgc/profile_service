const { ApolloServer, gql, makeExecutableSchema } = require("apollo-server");
const { Prisma } = require("prisma-binding");
const {EmailAddress, PostalCode} =  require("@okgrow/graphql-scalars");
const Query = require("./resolvers/Query");
const Mutation = require("./resolvers/Mutations");
const {PhoneNumber} = require("./resolvers/Scalars");
const config = require("./config");
const fs = require("fs");

const resolvers = {
  Query,
  Mutation,
  Email : EmailAddress,
  PhoneNumber,
  PostalCode
};

const typeDefs = gql`${fs.readFileSync(__dirname.concat("/schema.graphql"), "utf8")}`;

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false 
  }
});


const server = new ApolloServer({
  schema,
  context: (req) => ({
    ...req,
    prisma: new Prisma({
      typeDefs: "./src/generated/prisma.graphql",
      endpoint: "http://"+config.prisma.host+":4466/profile/",
      debug: config.prisma.debug,
    }),
  }),
});
const options = {
  port: 4000,
  endpoint: "/graphql",
  subscriptions: "/subscriptions",
  playground: "/playground",
};
// eslint-disable-next-line no-console
server.listen().then(({ url }) => {
  console.log(`🚀 GraphQL Server ready at ${url}`);
});
