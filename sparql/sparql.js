module.exports ={ 

	getQueryResult : function(query,res) {
    var SparqlClient = require('sparql-client');
    var util = require('util');
    var client = new SparqlClient('http://localhost:3030/flore/query');
    client.query(query)
        .execute(function(error, results) {
        	res.send(results.results.bindings)
        });
}
}