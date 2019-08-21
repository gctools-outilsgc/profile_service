const { ApolloServer, gql, makeExecutableSchema } = require("apollo-server");
const { Prisma } = require("prisma-binding");
const {EmailAddress, PostalCode} =  require("@okgrow/graphql-scalars");
const Query = require("./resolvers/Query");
const {modifyProfile, createTeam, modifyTeam, deleteTeam, modifyApproval} = require("./resolvers/Mutations");
const {PhoneNumber} = require("./resolvers/Scalars");
const config = require("./config");
const AuthDirectives = require("./Auth/Directives");
const fs = require("fs");
const { connectMessageQueueListener } = require("./Service_Mesh/listener_connector");
const { connectMessageQueuePublisher } = require("./Service_Mesh/publisher_connector");
const introspect = require("./Auth/introspection");
const { getDefaults } = require("./resolvers/helper/default_setup");
const { applyMiddleware } = require("graphql-middleware");
const { profileApprovalRequired } = require("./Middleware/profileApprovalCreation");
const { teamApprovalRequired } = require("./Middleware/teamApprovalCreation");
const {allowedToModifyProfile, allowedToModifyApproval, allowedToModifyTeam, mustbeAuthenticated} = require("./Middleware/authMiddleware");

const resolvers = {
  Query,
  Mutation : {
    modifyProfile,
    createTeam,
    modifyTeam,  
    deleteTeam,
    modifyApproval
  },
  Email : EmailAddress,
  PhoneNumber,
  PostalCode
};

const profileApprovalRequiredApplications = {
  Mutation:{
    modifyProfile: profileApprovalRequired
  },  
};

const teamApprovalRequiredApplications = {
  Mutation:{
    modifyTeam: teamApprovalRequired
  },
};

const ownershipRequiredApplications = {
  Mutation:{
    modifyProfile: allowedToModifyProfile,
    modifyApproval: allowedToModifyApproval,
    modifyTeam: allowedToModifyTeam 
  },
};

const authenticationRequiredApplications = 
{
  Mutation:{
    modifyProfile: mustbeAuthenticated,
    createTeam: mustbeAuthenticated,
    modifyTeam: mustbeAuthenticated,
    deleteTeam: mustbeAuthenticated,
    modifyApproval: mustbeAuthenticated
  }
};

const typeDefs = gql`${fs.readFileSync(__dirname.concat("/schema.graphql"), "utf8")}`;

const schemaBeforeMiddleware = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives: {
    isAuthenticated: AuthDirectives.AuthenticatedDirective,
    inOrganization: AuthDirectives.OrganizationDirective,
    isSameTeam: AuthDirectives.SameTeamDirective,
    isSupervisor: AuthDirectives.SupervisorDirective,
    isOwner: AuthDirectives.OwnerDirective,
    requiresApproval: AuthDirectives.RequiresApproval,    
  },
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
});

const schema = applyMiddleware(
  schemaBeforeMiddleware,
  authenticationRequiredApplications,
  ownershipRequiredApplications,
  profileApprovalRequiredApplications,
  teamApprovalRequiredApplications,
);

const server = new ApolloServer({
  schema,
  engine: {
      apiKey: config.engine.apiID,
  },
  tracing: config.app.tracing,
  introspection: true,
  playground: true,
  cors: {
    origin: "*"
  },
  context: async (req) => ({
    ...req,
    prisma: new Prisma({
      typeDefs: "./src/generated/prisma.graphql",
      endpoint: "http://"+config.prisma.host+":4466/profile/",
      debug: config.prisma.debug,
    }),
    token: await introspect.verifyToken(req),
    defaults: await getDefaults()
  }),
});



server.listen().then(({ url }) => {
  // eslint-disable-next-line no-console
  console.info(`🚀 GraphQL Server ready at ${url}`);
});

// Lauch process to listen to service message queue
if (config.rabbitMQ.user && config.rabbitMQ.password){
  connectMessageQueueListener();
  connectMessageQueuePublisher();
}



