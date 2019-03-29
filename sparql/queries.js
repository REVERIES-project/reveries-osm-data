var pref = require('./prefixes.js')

module.exports = {




    listSpecies: function() {
        var query = pref.getPrefixes() + '\n' +
            "SELECT ?speciesName WHERE {?species rdf:type <https://reveries-project.fr#speciesformat-v1-xls-feuil1-csv>.?species rev:species  ?speciesName}"
        return query
    },

    listSpeciesPropValues: function() {
        var query = pref.getPrefixes() + '\n' +
            'select ?speciesName (group_concat(?property; separator=",") as ?props)where { ?species rev:species ?speciesName.?species ?prop ?value.BIND(concat(str(?prop),"?",str(?value)) AS ?property)FILTER ( !strstarts(str(?prop), "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") ) FILTER ( !strstarts(str(?prop), "https://reveries-project.fr#number")) FILTER ( !strstarts(str(?prop), "https://reveries-project.fr#species") )}group by ?speciesName order by ?speciesName'
        return query
    },

    listProp: function() {
        var query = pref.getPrefixes() + '\n' +
            "SELECT DISTINCT ?prop ?label WHERE {?species rdf:type <https://reveries-project.fr#speciesformat-v1-xls-feuil1-csv>.?species ?prop ?val. ?prop rdf:label ?label.     FILTER ( !strstarts(str(?prop), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') )      FILTER ( !strstarts(str(?prop), 'https://reveries-project.fr#numbers') )      FILTER ( !strstarts(str(?prop), 'https://reveries-project.fr#species') )}"
        return query
    },
    listSpeciesConstraint: function(constrainArray) {
        console.log('constraint arrazay',constrainArray)
        var queryConstraint = ''
        if (constrainArray) {
            if (typeof constrainArray == 'string') {
                queryConstraint = '?species ' + constrainArray + '.}'
            } else {
                for (var i = 0; i < constrainArray.length; i++) {
                    var newConstraint = '?species ' + constrainArray[i] + '.'
                    queryConstraint = queryConstraint + newConstraint;
                }
                queryConstraint = queryConstraint + '}'
            }
            var query = pref.getPrefixes() + '\n' +
                "SELECT DISTINCT ?species WHERE {?species rdf:type <https://reveries-project.fr#speciesformat-v1-xls-feuil1-csv>."  + queryConstraint;
            return query
        }
        return this.listSpecies()
    },

    listPropValue: function(propName) {
        var query = pref.getPrefixes() + '\n' +
            "SELECT DISTINCT ?value WHERE {?species rdf:type <https://reveries-project.fr#speciesformat-v1-xls-feuil1-csv>." + '\n' +
            "?species rev:" + propName + " ?value }"
        return query
    },

    listPropValueConstraint: function(propName, constrainArray) {
        var queryConstraint = ''
        if (constrainArray) {
            if (typeof constrainArray == 'string') {
                queryConstraint = '?species ' + constrainArray + '.}'
            } else {
                for (var i = 0; i < constrainArray.length; i++) {
                    var newConstraint = '?species ' + constrainArray[i] + '.'
                    queryConstraint = queryConstraint + newConstraint;
                }
                queryConstraint = queryConstraint + '}'
            }
            var query = pref.getPrefixes() + '\n' +
                "SELECT DISTINCT ?value WHERE {?species rdf:type <https://reveries-project.fr#speciesformat-v1-xls-feuil1-csv>." + '\n' +
                "?species rev:" + propName + " ?value." + queryConstraint;
            return query
        }
        return this.listPropValue(propName)
    },


    /*
        listDescriptorsValueByClass: function(descClass) {
            var query = pref.getPrefixes() + '\n' +
                "SELECT DISTINCT ?descriptorLabel ?descriptorValue  WHERE {\
      ?descriptorValue rdf:type rev:" + descClass + " .\
      ?descriptorValue skos:prefLabel ?descriptorLabel.\
    }"
            return query;

        },

        listPlantsByProp: function(prop) {
                var descriptorArray = []
                for (var x in prop) {
                    descriptorArray.push(prop[x])
                }
                console.log(descriptorArray)
                var descriptionString = ""
                for (var i = 0; i < descriptorArray.length; i++) {
                    var desc = descriptorArray[i].split('#')[1];
                    descriptionString = descriptionString + "?b rev:hasDescriptor <http://reveries-project.fr#" + desc + ">.";
                }

                var query = pref.getPrefixes() + '\n' +
                    "SELECT DISTINCT ?plant ?label  WHERE {\
      ?plant rdf:type rev:Family .\
      ?plant skos:prefLabel ?label.\
      ?plant rev:hasMorphologicalTrait ?b. " + descriptionString + "}"
                console.log(query)
                return query;

            }*/
    /**
    Liste des organes et de leurs types de descripteurs (sans les valeurs)
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX rev: <http://reveries-project.fr#>
    SELECT DISTINCT ?organ ?lorgan  ?descriptorLabel ?descriptorDef  WHERE {
      ?trait rdf:type rev:MorphologicalTrait .
      ?trait rev:hasRelatedOrgan ?blankorgan.
      ?blankorgan rdf:type ?organ.
      ?organ skos:prefLabel ?lorgan.
      ?organ rdfs:subClassOf rev:Organ.
      ?trait rev:hasDescriptor ?desc.
      ?descriptorDef skos:prefLabel ?descriptorLabel.
     ?desc skos:prefLabel ?lab.
    ?desc rdf:type ?descriptorDef.} 
    LIMIT 100


    **/

}
