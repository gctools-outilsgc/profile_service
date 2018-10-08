const{mockServer, makeExecutableSchema} = require('graphql-tools')
const {Country, Province} = require("../../src/resolvers/Scalars")
const {} = require('mocha')
const Mutation = require("./addressMutationHelper")
const helper = require('../test_helpers')

const resolvers = {
  Country, Province, Mutation
}

describe('Validate PROVINCE scalar after country was selected', () =>
{
    //var server;
    beforeEach(() => 
    {
        const schema = makeExecutableSchema({
            typeDefs: `
            scalar Province
            scalar Country

            type Address {
                province(code:String): Province
                country: Country
            }

            type Query{
                addresses(province:Province, country:Country) : [Address]
            }

            type Mutation{
                createAddress(province : Province, country : Country):Address
            }
            `,
            resolvers
          });
        const mocks = {Province: () => { return "A province"}, Country: () => {return "A country"}}
        server = new mockServer(schema, mocks);
    })
    it('validate the province from previous selected country', async () =>
    {
        var query = `
        mutation
        {
            createAddress(province{code:"CA"},country:"Canada"){province, country}
        }`
        await helper.runQuery(server, query)
    })
})