const assert = require('chai').assert

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

module.exports = {runQuery, runQueryAndExpectError}