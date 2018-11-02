const assert = require('chai').assert
const expect = require('chai').expect

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

function runQueryAndExpectError(server, query)
{
    return server.query(query).then((data) =>{
        var errors = data.errors;
        if(errors)
        {
            assert.isTrue(errors.length > 0)
        }
        else{
            assert.fail("Should have thrown exception.")
        }
    })
}

function expectOneErrorWithText(errors, expectedErrorMessage)
{
    expect(errors.length).to.equal(1)
    var error = errors[0];
    expect(error.message).to.contain(expectedErrorMessage);
}

function expectNoErrors(errors)
{
    expect(errors).to.be.undefined;
}

module.exports = {runQuery, runQueryAndExpectError, expectOneErrorWithText,expectNoErrors}