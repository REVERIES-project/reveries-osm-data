module.exports = function (app, logger, pusher) {
  var Tree = require('../schema/tree')
  var Observation = require('../schema/observation')
  var Identification = require('../schema/identification')
  var Verification = require('../schema/verification')
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
          id: req.session.user
        }
        observation.validation.push(validation)
        observation.save()
        pusher.trigger('observation', 'validate_obs', observation)
        let obs = observation.toJSON()
        obs.validated = true
        res.send({
          success: true,
          observation: obs
        })
      })
  })
  app.post('/api/modifyObservation', function (req, res) {
    Observation.findById(req.body.releve._id)
      .exec(function (err, result) {
        result.prev.push(result.toObject())
        result.genus = req.body.releve.genus
        result.common = req.body.releve.common
        result.specie = req.body.releve.specie
        result.image = req.body.releve.image
        result.modifierId = req.session.user
        result.modifierName = req.session.username
        result.date = Date.now()
        result.validation = [{
          name: req.session.username,
          id: req.session.user
        }]
        pusher.trigger('observation', 'modify_obs', result)
        result.save()
        let observation = result.toJSON()
        observation.validated = true
        res.send({
          success: true,
          observation: observation
        })
      })
  })

  app.get('/api/identification', function (req, res) {
    Identification.find({}).sort('userOsmId')
      .exec(function (err, results) {
        res.send(results)
      })
  })

  app.get('/api/verification', function (req, res) {
    Verification.find({}).sort('userOsmId')
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
    identification.releveId = req.body.releve._id
    identification.osmId = req.body.osmId
    identification.date = Date.now()
    identification.userGenus = req.body.releve.identificationValue.genus
    identification.userCommon = req.body.releve.identificationValue.common
    identification.userSpecie = req.body.releve.identificationValue.specie
    identification.userOsmId = req.session.user
    identification.username = req.session.username
    identification.save()
    res.send({
      success: true
    })

  })

  app.post('/api/verification', function (req, res) {
    Observation.findById(req.body.releve._id)
      .exec(function (err, releve) {

        var verification = new Verification()
        verification.coordinates = releve.coordinates
        verification.genus = releve.genus
        verification.common = releve.common
        verification.specie = releve.specie
        verification.image = releve.image
        verification.releveId = req.body.releve._id
        verification.osmId = releve.osmId
        verification.username = req.session.username
        verification.userOsmId = req.session.user
        verification.validated = req.body.releve.validated
        verification.date = Date.now()
        if(!verification.validated){
        verification.userGenus = req.body.releve.genus
        verification.userCommon = req.body.releve.common
        verification.userSpecie = req.body.releve.specie}
        verification.save()
        let verif = verification.toJSON()
        verif.verificationValue = {
          verification: true,
          success: true
        }
        res.send({
          success: true,
          observation: verif
        })
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
    observation.identificationValue = {
      identification: req.body.releve.identificationMode,
      success: false
    }
    observation.verificationValue = {
      verification: req.body.releve.verificationMode,
      success: false
    }

    observation.authorName = req.session.username
    observation.date = Date.now()
    observation.validation.push({
      name: req.session.username,
      id: req.session.user
    })
    observation.save()
    let obs = observation.toJSON()
    pusher.trigger('observation', 'new_obs', obs)
    if (!req.body.releve.verificationMode) {
      console.log(req.body)
      obs.validated = true
    }

    res.send({
      success: true,
      observation: obs
    })
  })
  app.get('/api/observation', function (req, res) {
    Observation.find({})
      .exec(function (err, results) {
        for (var i = 0; i < results.length; i++) {
          let validated = results[i].validation.find(function (value) {
            return value && value.id == req.session.user
          })
          if (validated && !results[i].verificationValue.verification) {
            results[i] = results[i].toJSON()
            results[i].validated = true
          } else {
            results[i] = results[i].toJSON()
          }
        }
        Identification.find()
          .exec(function (err, identifications) {
            for (let releve of results) {
              for (let identification of identifications) {
                if (releve._id == identification.releveId) {
                  if (identification.userOsmId == req.session.user) {
                    releve.identificationValue = {
                      identification: true,
                      success: true
                    }
                  }
                }
              }
            }
            Verification.find()
              .exec(function (err, verifications) {
                for (let releve of results) {
                  for (let verification of verifications) {
                    if (releve._id == verification.releveId) {
                      if (verification.userOsmId == req.session.user) {
                        // releve=releve.toJSON()
                        releve.validated = true
                        releve.verificationValue = {
                          verification: true,
                          success: true
                        }
                      }
                    }
                  }
                }
                res.send(results)
              })
          })
        //console.log(results)
      })
  })

}