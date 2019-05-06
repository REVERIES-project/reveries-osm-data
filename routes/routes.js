module.exports = function (app, logger, pusher) {
  var Tree = require('../schema/tree')
  var Observation = require('../schema/observation')
  var Identification = require('../schema/identification')
  var express = require('express')
  var axios = require('axios')
  app.use(express.static('../osm-vuejs/www/'))
  app.get('/api/osmdata', function (req, res) {
    let south = req.query.south
    let west = req.query.west
    let north = req.query.north
    let east = req.query.east
    axios.get('http://overpass-api.de/api/interpreter?data=[out:json];node["natural"="tree"](' + south + ',' + west + ',' + north + ',' + east + ');out;')
      .then(function (response) {
        res.send(response.data.elements)
      })
  })
  app.get('/osmtest', function (req, res) {
    axios.get('http://overpass-api.de/api/interpreter?data=[out:json];node[%22natural%22=%22tree%22](46.900246243056245,6.356577873229981,46.906667550492045,6.37007474899292);out;').then(function (response) {
      res.send(response.data);
      console.log(response.data)
    })
  })
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
  app.get('/api/login', function (req, res) {
    req.session.user = req.query.id
    req.session.username = req.query.name
    req.session.save()
    res.send('ok')
  })
  app.post('/api/anonymous',function(req,res){
    req.session.user=(Math.floor(Math.random() * 1000) + 200).toString();
    req.session.username='Anon' + req.session.user
    req.session.save()
    res.send({success:true,username:req.session.username,userId:req.session.user})  
  })
  app.post('/api/restoreSession',function(req,res){
    req.session.user=req.body.id
    req.session.username=req.body.username
    req.session.save()
    res.send({success:true})
  })
  app.get('/api/user', function (req, res) {
    res.send(req.session)
  })
  app.post('/api/pusher/auth', function (req, res) {
    var socketId = req.body.socket_id;
    var channel = req.body.channel_name;
    var presenceData = {
      user_id: req.session.user,
      user_info: {
        name: req.session.username,
      }
    };
    var auth = pusher.authenticate(socketId, channel, presenceData);
    res.send(auth);
  });

  app.post('/api/validate', function (req, res) {
    Observation.findById(req.body.releve._id)
      .exec(function (err, observation) {
        let validation = {
          name: req.session.username,
          id: req.session.user,
          date:Date.now()
        }
        observation.validation.push(validation)
        observation.save()
        pusher.trigger('observation', 'validate_obs', {observation:observation,userId:req.session.user})
        res.send({
          success: true,
          observation: observation
        })
      })
  })

  app.post('/api/remove',function(req,res){
    Observation.findByIdAndRemove(req.body.releve._id)
    .exec(function(err,result){
      console.log(result)
      pusher.trigger('observation', 'remove_obs', {observation:req.body.releve,userId:req.session.user})
      res.send({success:true})
    })
  })
  app.post('/api/noTree',function(req,res){
    Observation.findById(req.body.releve._id)
    .exec(function(err,result){
      let index = result.noTree.findIndex(val=>val.osmId==req.session.user)
      if(index==-1){
        result.noTree.push({osmId:req.session.user,username:req.session.username,date:Date.now()})
      }
      pusher.trigger('observation', 'invalidate_tree', {observation:result,userId:req.session.user})
      res.send({success:true,observation:result})
      result.save()
    })
  })

  app.post('/api/unsetNoTree',function(req,res){
    Observation.findById(req.body.releve._id)
    .exec(function(err,result){
      let index = result.noTree.findIndex(val=>val.osmId==req.session.user)
      if(index!=-1){
        result.noTree.splice(index,1)
      }
      console.log(result.noTree)
      pusher.trigger('observation', 'uninvalidate_tree', {observation:result,userId:req.session.user})
      res.send({success:true,observation:result})
      result.save()
    })
  })

  app.post('/api/modifyObservation', function (req, res) {
    Observation.findById(req.body.releve._id)
      .exec(function (err, result) {
        //Case where suspicion of tree absence
        // Only the noTree indicator is updated
        let prev = result.toObject()
        delete prev.coordinates
        delete prev.noTree
        if (prev.prev) {
          delete prev.prev
        }
        result.prev.push(prev)
        result.genus = req.body.releve.genus
        result.crown = req.body.releve.crown
        result.height = req.body.releve.height
        result.common = req.body.releve.common
        result.specie = req.body.releve.specie
        if (req.body.releve.image) {
          result.image = req.body.releve.image
        } else {
          result.image = prev.image
        }
        result.modifierId = req.session.user
        result.modifierName = req.session.username
        result.date = Date.now()
        result.validation = [{
          name: req.session.username,
          id: req.session.user,
          date:Date.now()
        }]
        pusher.trigger('observation', 'modify_obs', {observation:result,userId:req.session.user})
        result.save()
        res.send({
          success: true,
          observation: result
        })
      })
  })

  app.get('/api/identification', function (req, res) {
    Identification.find({}).sort('userOsmId')
      .exec(function (err, results) {
        res.send(results)
      })
  })

  app.post('/api/identification', function (req, res) {
    var identification = new Identification()
    identification.coordinates = req.body.releve.coordinates
    identification.genus = req.body.releve.genus
    identification.common = req.body.releve.common
    identification.specie = req.body.releve.specie
    identification.image = req.body.releve.image
    identification.crown = req.body.releve.crown
    identification.height = req.body.releve.height
    identification.releveId = req.body.releve._id
    identification.osmId = req.body.osmId
    identification.date = Date.now()
    identification.userGenus = req.body.releve.identificationValue.genus
    identification.userCommon = req.body.releve.identificationValue.common
    identification.userSpecie = req.body.releve.identificationValue.specie
    identification.userImage = req.body.releve.identificationValue.image
    identification.userOsmId = req.session.user
    identification.username = req.session.username
    identification.save()
    res.send({
      success: true
    })

  })


  app.post('/api/observation', function (req, res) {
    console.log(req.body.releve)
    var observation = new Observation()
    observation.coordinates = req.body.releve.coordinates
    observation.genus = req.body.releve.genus
    observation.common = req.body.releve.common
    observation.specie = req.body.releve.specie
    observation.image = req.body.releve.image
    observation.crown = req.body.releve.crown
    observation.height= req.body.releve.height
    observation.osmId = req.session.user
    observation.identificationValue = {
      identification: req.body.releve.identificationMode,
      success: false
    }
    observation.authorName = req.session.username
    observation.date = Date.now()
    observation.validation.push({
      name: req.session.username,
      id: req.session.user
    })
    observation.save()
    pusher.trigger('observation', 'new_obs', {observation:observation,userId:req.session.user})
    res.send({
      success: true,
      observation: observation
    })
  })
  app.get('/api/observation', function (req, res) {
    Observation.find({})
      .exec(function (err, results) {
        for (var i = 0; i < results.length; i++) {
          let validated = results[i].validation.find(function (value) {
            return value && value.id == req.session.user
          })
          results[i]=results[i].toJSON()
        }
        Identification.find()
          .exec(function (err, identifications) {
            for (let releve of results) {
              for (let identification of identifications) {
                if (releve._id == identification.releveId) {
                  if (identification.userOsmId == req.session.user) {
                    releve.identificationValue = {
                      identification: true,
                      success: true,
                      userSpecie: identification.userSpecie,
                      userGenus:identification.userGenus,
                      userImage:identification.userImage,
                      userCrown:identification.userCrown,
                      userHeight:identification.userHeight,
                      userCommon:identification.userCommon,
                  
                    }
                  }
                }
              }
            }
            res.send(results)

          })
        //console.log(results)
      })
  })

}