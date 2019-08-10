var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const albiziappTree = Schema({
    telaBotanicaTaxon:String,
    species:String,
    genus:String,
    common_genus:String,
    common:String,
    description:String,
    usage:String,
    habitat:String,
    images:Array,
});
  

module.exports = mongoose.model('albiziappTree', albiziappTree,'albiziappTrees');