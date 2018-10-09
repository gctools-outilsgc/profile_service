const{mockServer, makeExecutableSchema } = require('graphql-tools')
const {} = require('mocha')
const Mutation = require("./profileMutationHelper")
const helper = require('../test_helpers')
const {PhoneNumber} = require("../../src/resolvers/Scalars")
const resolvers = { PhoneNumber, Mutation }

describe('Validate profile PHONE', () =>
{
    //var server;
    beforeEach(() => 
    {
        const schema = makeExecutableSchema({
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
        const mocks = {PhoneNumber: () => { return "1234567890"}}
        server = new mockServer(schema, mocks);
    })
    it('validate phone number format for ##########', async () =>
    {
        var query = `
        mutation
        {
            createProfile(phone:"1234567890"){phone}
        }`
        await helper.runQuery(server, query)
    })
    it('validate phone number format for ###-###-####', async () =>
    {
        var query = `
        mutation
        {
            createProfile(phone:"123-456-7890"){phone}
        }`
        await helper.runQuery(server, query)
    })
    it('validate phone number format for ###.###.####', async () =>
    {
        var query = `
        mutation
        {
            createProfile(phone:"123.456.7890"){phone}
        }`
        await helper.runQuery(server, query)
    })
    it('validate phone number format for (###) ###-####', async () =>
    {
        var query = `
        mutation
        {
            createProfile(phone:"(123) 456-7890"){phone}
        }`
        await helper.runQuery(server, query)
    })
    it('validate phone number format for (###)###-####', async () =>
    {
        var query = `
        mutation
        {
            createProfile(phone:"(123)456-7890"){phone}
        }`
        await helper.runQuery(server, query)
    })
    it('validate phone number format for +###########', async () =>
    {
        var query = `
        mutation
        {
            createProfile(phone:"+11234567890"){phone}
        }`
        await helper.runQuery(server, query)
    })
    it('validate phone number format for ###-#######', async () =>
    {
        var query = `
        mutation
        {
            createProfile(phone:"123-4567890"){phone}
        }`
        await helper.runQuery(server, query)
    })
})