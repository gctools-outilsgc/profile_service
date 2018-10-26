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
};

const production = {
 app: {
   port: 4000,
   multicore: true
 },
 prisma: {
     host: 'prisma',
     debug: false
 }

};

const config = {
 development,
 production
};

module.exports = config[env];