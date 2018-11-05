const{makeExecutableSchema } = require('graphql-tools')
const { graphql } = require('graphql');
const Mutation = require("./profileMutationHelper")
const helpers = require('../test_helpers')
const {PhoneNumber} = require("../../src/resolvers/Scalars")
const resolvers = { PhoneNumber, Mutation }

var schema;

describe('Validate profile PHONE', () =>
{
    beforeEach(()=>{
        schema = makeExecutableSchema({
            typeDefs: `
            scalar PhoneNumber

            type Profile {
                phone: PhoneNumber
            }

            type Query{
                profiles(phone:PhoneNumber) : [Profile]
            }

            type Mutation{
                createProfile(phone:PhoneNumber):Profile
            }
            `,
            resolvers
          });
    }),
    it('validate phone number format for ##########', async () =>
    {
        var query = `
        mutation
        {
            createProfile(phone:"1234567890"){phone}
        }`
        await graphql(schema, query).then((result) => {
            helpers.expectNoErrors(result.errors)
        });
    })
    it('validate phone number format for ###-###-####', async () =>
    {
        var query = `
        mutation
        {
            createProfile(phone:"123-456-7890"){phone}
        }`
        await graphql(schema, query).then((result) => {
           helpers.expectNoErrors(result.errors)
        });
    })
    it('validate phone number format for ###.###.####', async () =>
    {
        var query = `
        mutation
        {
            createProfile(phone:"123.456.7890"){phone}
        }`
        await graphql(schema, query).then((result) => {
            helpers.expectNoErrors(result.errors)
         });
    })
    it('validate phone number format for (###) ###-####', async () =>
    {
        var query = `
        mutation
        {
            createProfile(phone:"(123) 456-7890"){phone}
        }`
        await graphql(schema, query).then((result) => {
            helpers.expectNoErrors(result.errors)
         });
    })
    it('validate phone number format for (###)###-####', async () =>
    {
        var query = `
        mutation
        {
            createProfile(phone:"(123)456-7890"){phone}
        }`
        await graphql(schema, query).then((result) => {
            helpers.expectNoErrors(result.errors)
         });
    })
    it('validate phone number format for +###########', async () =>
    {
        var query = `
        mutation
        {
            createProfile(phone:"+11234567890"){phone}
        }`
        await graphql(schema, query).then((result) => {
            helpers.expectNoErrors(result.errors)
         });
    })
    it('validate phone number format for ###-#######', async () =>
    {
        var query = `
        mutation
        {
            createProfile(phone:"123-4567890"){phone}
        }`
        await graphql(schema, query).then((result) => {
            helpers.expectNoErrors(result.errors)
         });
    })
})