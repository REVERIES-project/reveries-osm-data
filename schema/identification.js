var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const identificationSchema = Schema({
    coordinates: [Number],
    
    specie: String,
    genus:String,
    osmId:String,
    image:String,
    common:String,
    userSpecie: String,
    userGenus:String,
    username:String,
    userOsmId:String,
    userCommon:String,
    date:Date,
    releveId:String,
});
  

module.exports = mongoose.model('identification', identificationSchema);