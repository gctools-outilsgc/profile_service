require("dotenv").config();

const env = process.env.NODE_ENV; // 'development' or 'production'
const id = process.env.client_id;
const secret = process.env.client_secret;

const development = {
 app: {
   port: 4000,
   multicore: false
 },
 prisma: {
     host:"localhost",
     debug: true
 },
 image:{
   url:"http://localhost:8007/backend.php",
   format:"jpeg",
   size:300
 },
 open_id:{
   url:"http://localhost:8000"
 },
 client:{
   id:id,
   secret:secret
 }
};

const production = {
 app: {
   port: 4000,
   multicore: true
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
open_id:{
  url:"https://account.gccollab.ca"
},
client:{
  id:id,
  secret:secret
}
};

const config = {
 development,
 production
};

module.exports = config[env];
