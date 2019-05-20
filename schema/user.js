var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const userSchema=Schema({
    username:String,
    id:String,
    trophies: Array,
    journal: Array,
    score: Number,
    knowledgeScore:Number,
    knowledgeHistory:Array,
    gamificationMode: Boolean,
    differentSpecie: Array,
    differentGenus: Array,
    mission: Object,
    activite: Object,
    indexActivite: Number,
    completion: Number,
    goal: Number

})

module.exports = mongoose.model('user', userSchema);