module.exports=function(app){
    var Flore = require('../schema/albiziappTree')
    app.get('/api/listTrees',function(req,res){
        Flore.find({},'telaBotanicaTaxon species genus common_genus common')
        .exec(function(err,result){
            res.send(result)
        })

    })
    app.get('/api/info/:taxon',function(req,res){
        Flore.find({telaBotanicaTaxon:req.params.taxon},'description usage habitat images')
        .exec(function(err,result){
            res.send(result)
        })

    })

}