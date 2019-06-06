const elastic = require("./connection");

async function getSuggestions(partialName){
    return elastic.search({
        index:"profiles",
        body:{
            suggest:{
                nameAutoComplete:{
                    prefix: partialName,
                    completion: {
                        field:"suggest",
                        size:"10"
                    }
                }
            }
        }
    })
    .catch((e) => {
        // Need to implement error handling
        // eslint-disable-next-line no-console
        console.log(e);
    });
}

async function responseFormatter(suggestion, context, info){
    return await context.prisma.query.profile(
        {
            where: {
                gcID: suggestion._source.gcID
            }
        }, info
    );
}

async function autoCompleter(partialName, context, info){
    const response = await getSuggestions(partialName);
    return Promise.all(
        response.body.suggest.nameAutoComplete[0].options.map((suggestion) => responseFormatter(suggestion, context, info))
        );
}

module.exports = {
    autoCompleter
};