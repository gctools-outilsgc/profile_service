const{makeExecutableSchema} = require('graphql-tools')
const { graphql } = require('graphql');
const {Country, Province, PhoneNumber} = require("../../src/resolvers/Scalars")
const fs = require('fs')
const path = require('path')
const {} = require('mocha')
const Mutation = require("../../src/resolvers/Mutations")
const assert = require('chai').assert

var schema;
describe('Create profile', () => {
    beforeEach(()=>{
        const resolvers = {Mutation, PhoneNumber, Country, Province}
        const typeDefs = fs.readFileSync(path.join(__dirname, '../../src', 'schema.graphql'), 'utf8')
        schema = makeExecutableSchema({
            typeDefs: typeDefs + `
            type Address {
                id: ID!
                streetAddress: String!
                city: String!
                province: String!
                postalCode: String!
                country: String!
              }
            `,
            resolvers
          });
    }),
    it('works when entering mandatory information.', async () =>{
        var query = `
        mutation
        {
            createProfile(gcId:"123", name:"someone", email:"email@email.com"){name}
        }`
        await createProfile(schema,query)
    })
})

function createProfile(schema, query)
{
    var context ={prisma:{mutation:{
        createProfile:function(data){
            data.name = ""
            return data
        }
    }}}
    return executeGraphQL(schema, query, context)
}

function executeGraphQL(schema, query, context)
{
    return graphql(schema, query,null, context).then((result) => {
        var errors = result.errors
        if(errors)
        {
            assert.equal(errors.length, 0, errors)
        }
    });
}