var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const userSchema=Schema({
    username:String,
    id:String,
    trophies: Array,
    explorationHistory: Array,
    explorationScore: Number,
    knowledgeScore:Number,
    knowledgeHistory:Array,
    gamificationMode: Boolean,
    differentSpecie: Array,
    differentGenus: Array,
    mission: Object,
    activite: Object,
    indexActivite: Number,
    completion: Number,
    goal: Number,
    activities:[],
    status:[],
    scores:[],
    actionsTransActivite:Map,
    time:Object,
    commonData_verification:{type:Boolean,default:false},
    commonData_identification:{type:Boolean,default:false}

})

module.exports = mongoose.model('user', userSchema);