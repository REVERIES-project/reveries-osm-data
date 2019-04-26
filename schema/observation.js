var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const observationSchema = Schema({
    coordinates: [Number],
    
    specie: String,
    genus:String,
    osmId:String,
    image:String,
    common:String,
    authorName:String,
    modifierName:String,
    modifierId:String,
    date:Date,
    validation:[Object],
    prev:[Object],
    identificationValue:Object,
    verificationValue:Object,
  });
  

module.exports = mongoose.model('observation', observationSchema);