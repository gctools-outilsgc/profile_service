const {GraphQLScalarType} =require("graphql");
const {RegularExpression} =  require("@okgrow/graphql-scalars");

exports.PhoneNumber = new RegularExpression("PhoneNumber", /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im);