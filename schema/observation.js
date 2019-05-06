var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const observationSchema = Schema({
    coordinates: [Number],
    
    specie: String,
    genus:String,
    osmId:String,
    image:String,
    crown:String,
    height:String,
    noTree:[Object],
    common:String,
    authorName:String,
    modifierName:String,
    modifierId:String,
    date:Date,
    contributor:[String ],
    validation:[Object],
    prev:[Object],
    identificationValue:Object,
  });
  

module.exports = mongoose.model('observation', observationSchema);