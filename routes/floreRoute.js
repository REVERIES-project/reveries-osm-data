module.exports=function(app){
    var Flore = require('../schema/albiziappTree')
    var KeyProp = require('../schema/keyProp')
    var KeyValue = require('../schema/keyValue')
    app.get('/api/listTrees',function(req,res){
        Flore.find({},'telaBotanicaTaxon species genus common_genus common floreProperties')
        .exec(function(err,result){
            res.send(result)
        })

    })

    app.get('/api/floreProps',async function(req,res){
        let keyProps=await KeyProp.find()
        let keyValues=await KeyValue.find()
        let result=[]
        for(let p of keyProps){
            let elem={prop:p}
            let values=keyValues.filter(v=>v.keyProperty.toString()==p._id.toString())
            elem.values=values
            result.push(elem)
        }
        res.send(result)
    })

    app.get('/api/info/:taxon',function(req,res){
        Flore.find({telaBotanicaTaxon:req.params.taxon},'description usage habitat images')
        .exec(function(err,result){
            res.send(result)
        })

    })

}