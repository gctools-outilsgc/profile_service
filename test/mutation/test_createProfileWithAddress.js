const{makeExecutableSchema} = require('graphql-tools')
const { graphql } = require('graphql');
const {Country, Province, PhoneNumber} = require("../../src/resolvers/Scalars")
const fs = require('fs')
const path = require('path')
const {} = require('mocha')
const Mutation = require("../../src/resolvers/Mutations")
const assert = require('chai').assert

var schema;
describe('Create profile with address', () => {
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
    it("throws exception when 'streetAddress' is missing", async () =>{
        var query = `
        mutation{createProfile(gcId:"123",name:"someone",email:"email",
            address:{city:"city_name",province:"province_name",country:"Canada",postalCode:"postal_code"}
        )}`
        await graphql(schema, query).then((result) => {
            var errors = result.errors
            console.log(errors)
            assert.isTrue(errors.length == 1, "When using address property all fields are mandatory including 'streetAddress'")
        });
    }),
    it("throws exception when 'city' is missing", async () =>{
        var query = `
        mutation{createProfile(gcId:"123",name:"someone",email:"email",
            address:{streetAddress:"street_name",province:"province_name",country:"Canada",postalCode:"postal_code"}
        )}`
        await graphql(schema, query).then((result) => {
            var errors = result.errors
            console.log(errors)
            assert.isTrue(errors.length == 1, "When using address property all fields are mandatory including 'city'")
        });
    }),
    it("throws exception when 'province' is missing", async () =>{
        var query = `
        mutation{createProfile(gcId:"123",name:"someone",email:"email",
            address:{streetAddress:"street_name",city:"city_name",country:"Canada",postalCode:"postal_code"}
        )}`
        await graphql(schema, query).then((result) => {
            var errors = result.errors
            console.log(errors)
            assert.isTrue(errors.length == 1, "When using address property all fields are mandatory including 'province'")
        });
    }),
    it("throws exception when 'country' is missing", async () =>{
        var query = `
        mutation{createProfile(gcId:"123",name:"someone",email:"email",
            address:{streetAddress:"street_name",city:"city_name",province:"province_name",postalCode:"postal_code"}
        )}`
        await graphql(schema, query).then((result) => {
            var errors = result.errors
            console.log(errors)
            assert.isTrue(errors.length == 1, "When using address property all fields are mandatory including 'country'")
        });
    }),
    it("throws exception when 'postal code' is missing", async () =>{
        var query = `
        mutation{createProfile(gcId:"123",name:"someone",email:"email",
            address:{streetAddress:"street_name",city:"city_name",province:"province_name",country:"Canada"}
        )}`
        await graphql(schema, query).then((result) => {
            var errors = result.errors
            console.log(errors)
            assert.isTrue(errors.length == 1, "When using address property all fields are mandatory including 'postal code'")
        });
    })
})

function createProfileWithContext(schema, query)
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