var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const observationSchema = Schema({
    coordinates: [Number],
    specie: String,
    genus:String,
    osmId:String,
    image:String,
    common:String,
    date:Date,
    validation:[Object]
  });
  

module.exports = mongoose.model('observation', observationSchema);