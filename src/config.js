require("dotenv").config();

const env = process.env.NODE_ENV; // 'development' or 'production'

const development = {
 app: {
   port: 4000,
   multicore: false
 },
 prisma: {
     host:"localhost",
     debug: true
 },
 gm: {
  // eslint-disable-next-line camelcase
  image_width:300,
  // eslint-disable-next-line camelcase
  image_height:300,
  // eslint-disable-next-line camelcase
  image_format:"jpg"
 },
 imageserver:{
   url:"http://image/backend.php"
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
 gm: {
  // eslint-disable-next-line camelcase
  image_width:300,
  // eslint-disable-next-line camelcase
  image_height:300,
  // eslint-disable-next-line camelcase
  image_format:"jpg"
 },
 imageserver:{
  url:"http://image/backend.php"
 }
};

const config = {
 development,
 production
};

module.exports = config[env];