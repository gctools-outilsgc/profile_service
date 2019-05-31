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

function responseFormatter(suggestion){
    return {
        gcID: suggestion._source.gcID,
        name: suggestion._source.name,
        email: suggestion._source.email,
        avatar: suggestion._source.avatar,
        titleEn: suggestion._source.titleEn,
        titleFr: suggestion._source.titleFr,
        mobilePhone: suggestion._source.mobilePhone,
        officePhone: suggestion._source.officePhone
    };
}

async function autoCompleter(partialName){
    const response = await getSuggestions(partialName);
    return response.body.suggest.nameAutoComplete[0].options.map((suggestion) => responseFormatter(suggestion));
}

module.exports = {
    autoCompleter
};