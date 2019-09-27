var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const keyProp = Schema({
    normalizedForm:String,
    frTitle:String, // used for constructing the key from Excel
    enTitle:String,
    frSubtitle:String,   
    enSubtitle:String,
    informationHTLM:String,
    informationHTLM_en:String,
});
  

module.exports = mongoose.model('keyProp', keyProp);