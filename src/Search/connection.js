const elasticsearch = require("@elastic/elasticsearch");
const conf = require("../config");

var elastic = new elasticsearch.Client({
    node: conf.elastic.host
});

module.exports = elastic;