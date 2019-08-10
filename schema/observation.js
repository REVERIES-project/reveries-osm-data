var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const Confidence = Object.freeze({
  confident: 'Confiant',
  unconfident: 'Peu confiant',
  unknown: 'Non renseignée',
});



const observationSchema = Schema({
    specie: {type:String,default:''},
    genus:{type:String,default:''},
    common:{type:String,default:''},
    commonGenus:{type:String,default:''},
    telaBotanicaTaxon:{type:String,default:''},
    osmId:String,
    image:String,
    crown:String,
    height:String,
    version:String,
    source:{type:String,default:'Albiziapp'},
    nodeId:String,
    noTree:[Object],
    confidence:{type:String,enum:Object.values(Confidence),default:'Non renseignée'},
    authorName:String,
    modifierName:String,
    modifierId:String,
    date:Date,
    validation:[Object],
    prev:[Object],
    identificationValue:Object,
    location : {
      type: {
        type: String,
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  });
  

module.exports = mongoose.model('observation', observationSchema);