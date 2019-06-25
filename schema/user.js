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
    gamificationMode: {type:Boolean,default:true},
    differentSpecie: Array,
    differentGenus: Array,
    mission: Object,
    activite: Object,
    indexActivite: Number,
    lostProgression:Number,
    completion: Number,
    goal: Number,
    activities:Array,
    status:Array,
    scores:Array,
    actionsTransActivite:Map,
    time:Object,
    commonData_verification:{type:Boolean,default:false},
    commonData_identification:{type:Boolean,default:false}

})

module.exports = mongoose.model('user', userSchema);