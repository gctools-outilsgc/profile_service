const{makeExecutableSchema} = require("graphql-tools")
const { graphql } = require("graphql");
const {Country, Province, PhoneNumber} = require("../../src/resolvers/Scalars")
const fs = require("fs")
const path = require("path")
const Mutation = require("../../src/resolvers/Mutations")
const expect = require("chai").expect

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
            address:{city:"city_name",province:"province_name",country:"CA",postalCode:"postal_code"}
        ){name}}`
        await graphql(schema, query).then((result) => {
            expectOneErrorWithText(result.errors, "streetAddress is not defined and is a required field")
        });
    }),
    it("throws exception when 'city' is missing", async () =>{
        var query = `
        mutation{createProfile(gcId:"123",name:"someone",email:"email",
            address:{streetAddress:"street_name",province:"province_name",country:"CA",postalCode:"postal_code"}
        ){name}}`
        await graphql(schema, query).then((result) => {
            expectOneErrorWithText(result.errors, "city is not defined and is a required field")
        });
    }),
    it("throws exception when 'province' is missing", async () =>{
        var query = `
        mutation{createProfile(gcId:"123",name:"someone",email:"email",
            address:{streetAddress:"street_name",city:"city_name",country:"CA",postalCode:"postal_code"}
        ){name}}`
        await graphql(schema, query).then((result) => {
            expectOneErrorWithText(result.errors, "province is not defined and is a required field")
        });
    }),
    it("throws exception when 'country' is missing", async () =>{
        var query = `
        mutation{createProfile(gcId:"123",name:"someone",email:"email",
            address:{streetAddress:"street_name",city:"city_name",province:"province_name",postalCode:"postal_code"}
        ){name}}`
        await graphql(schema, query).then((result) => {
            expectOneErrorWithText(result.errors, "country is not defined and is a required field")
        });
    }),
    it("throws exception when 'postal code' is missing", async () =>{
        var query = `
        mutation{createProfile(gcId:"123",name:"someone",email:"email",
            address:{streetAddress:"street_name",city:"city_name",province:"province_name",country:"CA"}
        ){name}}`
        await graphql(schema, query).then((result) => {
            expectOneErrorWithText(result.errors, "postalCode is not defined and is a required field")
        });
    }),
    it("throws exception for invalid province/states in country", async () =>{
        var query = `
        mutation{createProfile(gcId:"123",name:"someone",email:"email",
            address:{streetAddress:"street_name",city:"city_name",province:"province_name",country:"CA", postalCode:"postalCode"}
        ){name}}`
        await graphql(schema, query, null, givenBasicContext()).then((result) => {
            expectOneErrorWithText(result.errors, "invalid province for selected country")
        });
    }),
    it("works if all mandatory fields are filled properly", async () =>{
        var query = `
        mutation{createProfile(gcId:"123",name:"someone",email:"email",
            address:{streetAddress:"street_name",city:"city_name",province:"quebec",country:"CA", postalCode:"postalCode"}
        ){name}}`
        await graphql(schema, query, null, givenBasicContext()).then((result) => {
            expect(result.errors).to.be.undefined;
        });
    })
})

function givenBasicContext()
{
    return {prisma:{mutation:{
        createProfile:function(data){
            data.name = ""
            return data
        }
    }}}
}

function expectOneErrorWithText(errors, expectedErrorMessage)
{
    expect(errors.length).to.equal(1)
    var error = errors[0];
    expect(error.message).to.contain(expectedErrorMessage);
}