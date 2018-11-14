const {GraphQLScalarType} =require("graphql");
const {RegularExpression} =  require("@okgrow/graphql-scalars");
const countries = require("countryjs");


exports.Country = new GraphQLScalarType({
    name : "Country",
    serialize:value=>value,
    parseValue:value=>value,
    parseLiteral(ast) {
        var country = ast.value;
        var result = countries.info(country);
        if(result)
            return ast;
        else
            throw new Error("Invalid country name.");
    }
});

exports.Province = new GraphQLScalarType({
    name : "Province",
    serialize:value=>value,
    parseValue:value=>value,
    parseLiteral(ast) {
        return ast;
    }
});

exports.PhoneNumber = new RegularExpression("PhoneNumber", /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im);