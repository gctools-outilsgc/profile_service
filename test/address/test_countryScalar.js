const{mockServer, makeExecutableSchema } = require('graphql-tools')
const {Country} = require("../../src/resolvers/Scalars")
const {} = require('mocha')
const Mutation = require("./addressMutationHelper")
const helper = require('../test_helpers')

const resolvers = {
  Country, Mutation
}

describe('Validate COUNTRY scalar', () =>
{
    //var server;
    beforeEach(() => 
    {
        const schema = makeExecutableSchema({
            typeDefs: `
            scalar Country

            type Address {
                country: Country
            }

            type Query{
                addresses(country: Country) : [Address]
            }

            type Mutation{
                createAddress(country: Country):Address
            }
            `,
            resolvers
          });
        const mocks = {Province: () => { return "A province"}, Country: () => {return "A country"}}
        server = new mockServer(schema, mocks);
    })
    it('validate country and expect to be a valid one', async () =>
    {
        var query = `
        mutation
        {
            createAddress(country:"CA"){country}
        }`
        await helper.runQuery(server, query)
    })
    it('expect an error when country does not exist', async ()=>
    {
        var query = `
        mutation
        {
            createAddress(country:"NoWhere"){country}
        }`
        await helper.runQueryAndExpectError(server, query)
    })
})