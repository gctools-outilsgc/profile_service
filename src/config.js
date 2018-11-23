require('dotenv').config();

const env = process.env.NODE_ENV; // 'development' or 'production'

const development = {
 app: {
   port: 4000,
   multicore: false
 },
 prisma: {
     host:'localhost',
     debug: true
 },
 image:{
   url:"http://image/backend.php",
   format:"jpg",
   size:300
 }
};

const production = {
 app: {
   port: 4000,
   multicore: true
 },
 prisma: {
     host: 'prisma',
     debug: false
 },
 image:{
  url:"http://image/backend.php",
  format:"jpg",
  size:300
}
};

const config = {
 development,
 production
};

module.exports = config[env];