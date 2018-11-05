const{ makeExecutableSchema } = require('graphql-tools')
const { graphql } = require('graphql');
const {Country} = require("../../src/resolvers/Scalars")
const Mutation = require("./addressMutationHelper")
const helpers = require("../test_helpers")

const resolvers = {
  Country, Mutation
}

var schema;

describe('Validate COUNTRY scalar', () =>
{
    beforeEach(()=>{
        schema = makeExecutableSchema({
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
    }),
    it('validate country and expect to be a valid one', async () =>
    {
        var query = `
        mutation
        {
            createAddress(country:"CA"){country}
        }`
        await graphql(schema, query).then((result) => {
            helpers.expectNoErrors(result.errors)
        });
    })
    it('expect an error when country does not exist', async ()=>
    {
        var query = `
        mutation
        {
            createAddress(country:"NoWhere"){country}
        }`
        await graphql(schema, query).then((result) => {
            helpers.expectOneErrorWithText(result.errors, "Invalid country name")
        });
    })
})