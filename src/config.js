require("dotenv").config();

const env = process.env.NODE_ENV; // 'development' or 'production'
const clientId = process.env.client_id;
const clientSecret = process.env.client_secret;
const engineAPI = process.env.ENGINE_API_KEY;
const mqUser = process.env.MQ_USER;
const mqPass = process.env.MQ_PASS;

const development = {
 app: {
   port: 4000,
   multicore: false,
   tracing: true
 },
 prisma: {
     host:"localhost",
     debug: false
 },
 image:{
   url:"http://localhost:8007/backend.php",
   format:"jpeg",
   size:300
 },
 rabbitMQ:{
   host:"localhost",
   user: mqUser,
   password: mqPass
 },
 openId:{
   url:"https://dev.account.gccollab.ca"
 },
 client:{
   id:clientId,
   secret:clientSecret
 },
 elastic:{
   host:"http://localhost:9200"
 },
 engine:{
   apiID: engineAPI
 },
 directoryApp:{
   url:"http://localhost:8000"
 }
};

const production = {
 app: {
   port: 4000,
   multicore: true,
   tracing: false
 },
 prisma: {
     host: "prisma",
     debug: false
 },
 image:{
  url:"http://image/backend.php",
  format:"jpeg",
  size:300
},
rabbitMQ:{
  host:"mq.gccollab.ca",
  user: mqUser,
  password: mqPass
},
openId:{
  url:"https://account.gccollab.ca"
},
client:{
  id:clientId,
  secret:clientSecret
},
elastic:{
  host:"http://localhost:9200"
},
engine:{
  apiID: engineAPI
},
directoryApp:{
  url:"https://profile.gccollab.ca"
}
};

const config = {
 development,
 production
};

module.exports = config[env];
