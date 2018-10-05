const{mockServer, makeExecutableSchema } = require('graphql-tools')
const {} = require('mocha')
const Mutation = require("./profileMutationHelper")
const helper = require('../test_helpers')
const {RegularExpression} =  require("@okgrow/graphql-scalars");
const PhoneNumberRegex = new RegularExpression("PhoneNumberRegex", /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im);

const resolvers = { PhoneNumberRegex, Mutation }

describe('Validate profile PHONE', () =>
{
    //var server;
    beforeEach(() => 
    {
        const schema = makeExecutableSchema({
            typeDefs: `
            scalar PhoneNumberRegex

            type Profile {
                phone: PhoneNumberRegex
            }

            type Query{
                profiles(phone:PhoneNumberRegex) : [Profile]
            }

            type Mutation{
                createProfile(phone:PhoneNumberRegex):Profile
            }
            `,
            resolvers
          });
        const mocks = {PhoneNumberRegex: () => { return "1234567890"}}
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
    it('validate phone number format for ###-##########', async () =>
    {
        var query = `
        mutation
        {
            createProfile(phone:"123-4567890"){phone}
        }`
        await helper.runQuery(server, query)
    })
})