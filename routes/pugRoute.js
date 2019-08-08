module.exports = function (app) {
    var Observation = require('../schema/observation')
    var Identification=require('../schema/identification')
    app.get('/observations', function (req, res) {
        Observation.find()
        .exec(function(err,result){
            res.render('observations', { title: 'Hey', observations: result});

        })
      });
      app.get('/identifications', function (req, res) {
        Identification.find()
        .exec(function(err,result){
            console.log(err)
            res.render('identifications', { title: 'Hey', identifications: result});

        })
      });

}