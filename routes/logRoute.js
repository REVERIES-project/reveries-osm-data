module.exports=function(app){
    var Logger = require('../schema/eventlog')
    app.post('/api/logger',function(req,res){
        let params=req.body
        let log=new Logger()
        log.event=params.event
        log.activity=params.activity
        log.object=params.payload
        log.userId=req.session.user
        log.username=req.session.username
        log.date=new Date()
        log.save()
        res.send()
    })
app.get('/api/history',function(req,res){
    Logger.find({})
    .exec(function(err,response){
        res.send(response)
    })
})
}