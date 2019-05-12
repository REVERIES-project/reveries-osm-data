var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const Confidence = Object.freeze({
  confident: 'Confiant',
  unconfident: 'Peu confiant',
  unknown: 'Non renseignée',
});
const observationSchema = Schema({
    coordinates: [Number],
    
    specie: String,
    genus:String,
    osmId:String,
    image:String,
    crown:String,
    height:String,
    source:{type:String,default:'Albiziapp'},
    osmNodeId:String,
    noTree:[Object],
    common:String,
    confidence:{type:String,enum:Object.values(Confidence),default:'Non renseignée'},
    authorName:String,
    modifierName:String,
    modifierId:String,
    date:Date,
    validation:[Object],
    prev:[Object],
    identificationValue:Object,
  });
  

module.exports = mongoose.model('observation', observationSchema);