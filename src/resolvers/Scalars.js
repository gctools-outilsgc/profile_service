const {GraphQLScalarType } =require('graphql')
const CountryQuery = require("country-query")

exports.Country = new GraphQLScalarType({
    name : 'Country',
    serialize:value=>value,
    parseValue:value=>value,
    parseLiteral(ast)
    {
        var country = ast.value
        var result = CountryQuery.findByNameCommon(country)
        if(result)
            return ast;
        else
            throw new Error('Invalid country name.')
    }
})

exports.Province = new GraphQLScalarType({
    name : 'Province',
    serialize:value=>value,
    parseValue:value=>value,
    parseLiteral(ast)
    {
        console.log(ast)
        return ast;
    }
})