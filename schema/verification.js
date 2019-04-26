var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const verificationSchema = Schema({
    coordinates: [Number],
    
    specie: String,
    genus:String,
    osmId:String,
    image:String,
    common:String,
    username:String,
    userSpecie: String,
    userGenus:String,
    userOsmId:String,
    userCommon:String,
    validated:Boolean,
    date:Date,
    releveId:String,
});
  

module.exports = mongoose.model('verification', verificationSchema);