var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const Confidence = Object.freeze({
    confident: 'Confiant',
    unconfident: 'Peu confiant',
    unknown: 'Non renseigné',
  });
  
const identificationSchema = Schema({
    coordinates: [Number],
    
    specie: String,
    crown:String,
    height:String,
    genus:String,
    osmId:String,
    image:String,
    common:String,
    confidence:{type:String,enum:Object.values(Confidence)},
    userSpecie: String,
    userGenus:String,
    username:String,
    userImage:String,
    userCrown:String,
    userHeight:String,
    userOsmId:String,
    userCommon:String,
    date:Date,
    releveId:String,
});
  

module.exports = mongoose.model('identification', identificationSchema);