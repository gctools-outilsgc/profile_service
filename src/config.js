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
 gm: {
  image_width:300,
  image_height:300,
  image_format:"jpg"
 },
 imageserver:{
   url:`http://localhost:8007/backend.php`
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
 gm: {
  image_width:300,
  image_height:300,
  image_format:"jpg"
 },
 imageserver:{
  url:`http://localhost:8007/backend.php`
 }
};

const config = {
 development,
 production
};

module.exports = config[env];