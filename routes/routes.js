module.exports = function (app, db, logger) {
  var Tree = require('../schema/tree')
  var Observation=require('../schema/observation')
  app.get('/trees', function (req, res) {


    Tree.find({
        geometry: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [-0.75763, 48.08498]
            },
            $minDistance: 1,
            $maxDistance: 100000
          }
        }
      })
      .exec(function (err, results) {
        var toSend = results.map(function (el) {
          return {
            center: [el.geometry.coordinates[1], el.geometry.coordinates[0]]
          }
        })
        res.send(toSend)
      })
  })
  app.get('/login', function (req, res) {
    req.session.user=req.query.id
    req.session.save()
    res.send('ok')
  })
  app.get('/user',function(req,res){
    res.send(req.session)
  })
  app.post('/observation',function(req,res){
    console.log(req.body.releve)
    var observation=new Observation()
    observation.coordinates=req.body.releve.coordinates
    observation.genus=req.body.releve.genus
    observation.specie=req.body.releve.specie
    observation.image=req.body.releve.image
    observation.osmId=req.session.user
    observation.date=Date.now()
    observation.save()
    res.send({success:true})
  })
  app.get('/observation',function(req,res){
    Observation.find({osmId:req.session.user})
    .exec(function(err,results){res.send(results)})
  })

}