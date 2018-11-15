/* eslint-disable no-use-before-define */
const{makeExecutableSchema} = require("graphql-tools");
const { graphql } = require("graphql");
const {Country, Province, PhoneNumber} = require("../../src/resolvers/Scalars");
const fs = require("fs");
const path = require("path");
const Mutation = require("../../src/resolvers/Mutations");
const helpers = require("../test_helpers");

var schema;
describe("Modify existing profile with an existing actual address", () =>{
    beforeEach(() =>{
        const resolvers = {Mutation, PhoneNumber, Country, Province};
        const typeDefs = fs.readFileSync(path.join(__dirname, "../../src", "schema.graphql"), "utf8");
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
    it("throws exception for invalid province/states in country", async () =>{
        var query = `
        mutation{modifyProfile(gcId:"123",
            address:{streetAddress:"street_name",city:"city_name",province:"province_name",country:"CA", postalCode:"postalCode"}
        ){name}}`;
        await graphql(schema, query, null, contextWithExistingProfile()).then((result) =>{
            helpers.expectOneErrorWithText(result.errors, "invalid province for selected country");
        });
    });
});

function contextWithExistingProfile() {
    return {prisma:{
        Profile(){
            return {address:{id:{}}};
        },
        mutation:{
            updateProfile(data){
                data.name = "";
                return data;
            }
        }
    }};
}