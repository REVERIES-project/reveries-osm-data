var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const logSchema=Schema({
    activity:Object,
    event:String,
    object:Object,
    date:Date,
    username:String,
    userId:String
})

module.exports = mongoose.model('logger', logSchema);