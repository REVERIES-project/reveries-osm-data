var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const keyValue = Schema({
    normalizedForm:String,
    frName:String,   
    enName:String,
    keyProperty:{ type: Schema.Types.ObjectId, ref: 'keyProp'}

});


module.exports = mongoose.model('keyValue', keyValue);