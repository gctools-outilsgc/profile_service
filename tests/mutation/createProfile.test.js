/* eslint-disable no-use-before-define */
const{makeExecutableSchema} = require("graphql-tools");
const { graphql } = require("graphql");
const {Country, Province, PhoneNumber} = require("../../src/resolvers/Scalars");
const fs = require("fs");
const path = require("path");
const Mutation = require("../../src/resolvers/Mutations");
const assert = require("chai").assert;

var schema;
describe("Create profile", () =>{
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
    it("throws exception when gcId field is missing", async () =>{
        var query = `
        mutation
        {
            createProfile(name:"someone", email:"email@email.com"){name}
        }`;
        await graphql(schema, query).then((result) =>{
            var errors = result.errors;
            assert.isTrue(errors.length > 0, "Missing mandatory field 'gcId' must throw exception.");
        });
    }),
    it("throws exception when name field is missing", async () =>{
        var query = `
        mutation
        {
            createProfile(gcId:"123", email:"email@email.com"){name}
        }`;
        await graphql(schema, query).then((result) =>{
            var errors = result.errors;
            assert.isTrue(errors.length > 0, "Missing mandatory field 'name' must throw exception.");
        });
    }),
    it("throws exception when email field is missing", async () =>{
        var query = `
        mutation
        {
            createProfile(gcId:"123", name:"someone"){name}
        }`;
        await graphql(schema, query).then((result) =>{
            var errors = result.errors;
            assert.isTrue(errors.length > 0, "Missing mandatory field 'email' must throw exception.");
        });
    }),
    it("works when entering mandatory information.", async () =>{
        var query = `
        mutation
        {
            createProfile(gcId:"123", name:"someone", email:"email@email.com"){name}
        }`;
        await createProfileWithContext(schema,query);
    });
});

function createProfileWithContext(schema, query) {
    var context ={prisma:{mutation:{
        createProfile(data){
            data.name = "";
            return data;
        }
    }}};
    return executeGraphQL(schema, query, context);
}

function executeGraphQL(schema, query, context) {
    return graphql(schema, query,null, context).then((result) =>{
        var errors = result.errors;
        if(errors) {
            assert.equal(errors.length, 0, errors);
        }
    });
}
