require("dotenv").config();

// set runtime environment as'development' or 'production'
const env = process.env.NODE_ENV;

// OpenID provider url, clientID and Secret
const accountURL = process.env.account_url;
const clientId = process.env.client_id;
const clientSecret = process.env.client_secret;
const directoryApp = process.env.directory_app;

// Message queue host, username and password
const mqHost = process.env.MQ_HOST;
const mqUser = process.env.MQ_USER;
const mqPass = process.env.MQ_PASS;

// Prisma, Elastic, and image server hosts / urls
const prismaHost = process.env.PRISMA_HOST;
const elasticHost = process.env.ELASTIC_HOST;
const imageURL = process.env.IMAGE_URL;

// Apollo engine api key
const engineAPI = process.env.ENGINE_API_KEY;

const development = {
  app: {
    port: 4000,
    multicore: false,
    tracing: true
  },
  prisma: {
    host: prismaHost,
    debug: false
  },
  image: {
    url: imageURL,
    format: "jpeg",
    size: 300
  },
  rabbitMQ: {
    host: mqHost,
    user: mqUser,
    password: mqPass
  },
  openId: {
    url: accountURL
  },
  client: {
    id: clientId,
    secret: clientSecret
  },
  elastic: {
    host: elasticHost
  },
  engine: {
    apiID: engineAPI
  },
  directoryApp: {
    url: directoryApp
  }
};

const production = {
  app: {
    port: 4000,
    multicore: true,
    tracing: false
  },
  prisma: {
    host: prismaHost,
    debug: false
  },
  image: {
    url: imageURL,
    format: "jpeg",
    size: 300
  },
  rabbitMQ: {
    host: mqHost,
    user: mqUser,
    password: mqPass
  },
  openId: {
    url: accountURL
  },
  client: {
    id: clientId,
    secret: clientSecret
  },
  elastic: {
    host: elasticHost
  },
  engine: {
    apiID: engineAPI
  },
  directoryApp: {
    url: directoryApp
  }
};

const config = {
  development,
  production
};

module.exports = config[env];
