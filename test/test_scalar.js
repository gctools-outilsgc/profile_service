const{mockServer, makeExecutableSchema, addMockFunctionsToSchema } = require('graphql-tools')
const assert = require('chai').assert
const {Country, Province} = require("../src/resolvers/Scalars")
const {} = require('mocha')
const Mutation = require("./mutationHelpers")

const resolvers = {
  Country, Province, Mutation
}

describe('Address validation', () =>
{
    //var server;
    beforeEach(() => 
    {
        const schema = makeExecutableSchema({
            typeDefs: `
            scalar Province
            scalar Country

            type Address {
                province: Province
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
            createAddress(province:"test",country:"Canada"){province, country}
        }`
        await runQuery(server, query)
    })
})

function runQuery(server, query)
{
    return server.query(query).then((data) =>{
        var errors = data.errors;
        if(errors)
        {
            assert.equal(errors.length, 0, errors)
        }
    })
}