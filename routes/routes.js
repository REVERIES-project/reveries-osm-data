module.exports = function (app, logger,pusher) {
  var Tree = require('../schema/tree')
  var Observation = require('../schema/observation')
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
  app.get('/api/user', function (req, res) {
    res.send(req.session)
  })
  app.post('/api/validate', function (req, res) {
    console.log(req.body.id)
    Observation.findById(req.body.id)
      .exec(function (err, observation) {
        let validation = {
          name: req.session.username,
          id: req.session.user
        }
        observation.validation.push(validation)
        observation.save()
        res.send({
          success: true
        })
      })
  })
  app.post('/api/modifyObservation', function (req, res) {
    Observation.findById(req.body.releve._id)
    .exec(function(err,result){
      result.prev.push(result.toObject())
      result.genus = req.body.releve.genus
      result.common = req.body.releve.common
      result.specie = req.body.releve.specie
      result.image = req.body.releve.image
      result.modifierId = req.session.user
      result.modifierName=req.session.username
      result.date = Date.now()
      result.validation.push({
        name: req.session.username,
        id: req.session.user
      })
      pusher.trigger('observation','modify_obs',result)
      result.save()
      res.send({success:true,observation:result})
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
    observation.osmId = req.session.user
    observation.authorName
    observation.date = Date.now()
    observation.validation.push({
      name: req.session.username,
      id: req.session.user
    })
    observation.save()
    let obs=observation.toJSON()
    pusher.trigger('observation','new_obs',obs)
    obs.validated=true

    res.send({
      success: true,
      observation: obs
    })
  })
  app.get('/api/observation', function (req, res) {
    Observation.find({
      })
      .exec(function (err, results) {
        for (var i=0;i<results.length;i++) {
          let validated = results[i].validation.find(function (value) {
            return value.id == req.session.user
          })
          if (validated) {
            results[i] = results[i].toJSON()
            results[i].validated=true
          }
        }
        //console.log(results)
        res.send(results)
      })
  })

}