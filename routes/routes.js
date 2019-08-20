module.exports = function (app, logger, pusher) {
  var Observation = require('../schema/observation')
  var _ =require('lodash')
  var Identification = require('../schema/identification')
  var osmtogeojson=require('osmtogeojson')
  var DOMParser = require('xmldom').DOMParser;
  var User = require('../schema/user')
  var request=require('request')
  var expressStaticGzip = require("express-static-gzip");

  app.use("/", expressStaticGzip("/home/reveries/albiziapp/dist/"));
  
  app.get('/api/getOsmData',function(req,res){
    let bottom = req.query.south
    let left = req.query.west
    let top = req.query.north
    let right = req.query.east
    request.get('https://api.openstreetmap.org/api/0.6/map?bbox='+left+','+bottom+','+right+','+top,
      function(err,httpresponse,body){
        console.log(body)
          var doc = new DOMParser().parseFromString(body)   
                 console.log(doc)
          let resultJson=osmtogeojson(doc)
          let nodes=[]
          for(let node of resultJson.features){
            console.log(node)
            if(node.properties.natural && node.properties.natural=="tree"){
              nodes.push(node)
            }
          }
          res.send(nodes)
      
      })
  })
  app.get('/api/login', function (req, res) {
    req.session.user = req.query.id
    req.session.username = req.query.name
    req.session.save()

    User.findOne({id:req.query.id})
      .exec(function(err,result){
        if(!result){
          let user = new User()
          user.id=req.query.id
          user.username=req.query.name
          user.save()
          res.send({success:true,user:user})
          return      
        }
        res.send({success:true,user:result})
      })
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
    if(!req.session.user){
      res.send({success:false,details:'Not authenticated'})
      return
    }

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
    if(!req.session.user){
      res.send({success:false,details:'Not authenticated'})
      return
    }

    Observation.findByIdAndRemove(req.body.releve._id)
    .exec(function(err,result){
      pusher.trigger('observation', 'remove_obs', {observation:req.body.releve,userId:req.session.user})
      res.send({success:true})
    })
  })
  app.post('/api/noTree',function(req,res){
    if(!req.session.user){
      res.send({success:false,details:'Not authenticated'})
      return
    }

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
    if(!req.session.user){
      res.send({success:false,details:'Not authenticated'})
      return
    }

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
    if(!req.session.user){
      res.send({success:false,details:'Not authenticated'})
      return
    }

    Observation.findById(req.body.releve._id)
      .exec(function (err, result) {
        //Case where suspicion of tree absence
        // Only the noTree indicator is updated
        let prev = result.toObject()
        delete prev.location
        delete prev.noTree
        if (prev.prev) {
          delete prev.prev
        }
        result.prev.push(prev)
        result.genus = req.body.releve.genus
        result.common = req.body.releve.common
        result.specie = req.body.releve.specie
        result.telaBotanicaTaxon= req.body.releve.telaBotanicaTaxon
        result.commonGenus = req.body.releve.commonGenus
        result.confidence=req.body.releve.confidence

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
        result.save()
        result=result.toJSON()
        result.hasImage = result.image ? true : false
        delete result.image
        for(let prev of result.prev){
          prev.hasImage=prev.image ? true:false
          delete prev.image
        }
        pusher.trigger('observation', 'modify_obs', {observation:result,userId:req.session.user})

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
  app.post('/api/resetBackup'
    ,function(req,res){
      let id=req.session.user
      if(!id){
        res.send({success:false,details:'noUser'})
        return
      }
      User.findOne({id:req.session.user})
      .exec(function(err,user){
        if(!user)
        {
          res.send('no user')
          return
        }
        let key=_.without(_.keys(user.toObject()),'_id','id','__v','username','gamificationMode')
        console.log(key)
        for(let k of key){
          user[k]=null
        }
        user.save()
        res.send({success:true})
      })
  
    }
  )
  app.post('/api/backup',function(req,res){
    let id=req.session.user
    if(!id){
      res.send({success:false,details:'noUser'})
      return
    }
    User.findOne({id:req.session.user})
    .exec(function(err,user){
      if(!user)
      {
        res.send('no user')
        return
      }
      let prop=req.body.field
      let value=req.body.value
      user[prop]=value
      user.save(function(err){
        console.log(err)
      })
      res.send({success:true})
    })
  })
  app.post('/api/identification', function (req, res) {
    var identification = new Identification()
    identification.location.coordinates = req.body.releve.location.coordinates
    identification.genus = req.body.releve.genus
    identification.common = req.body.releve.common
    identification.specie = req.body.releve.specie
    identification.image = req.body.releve.image
    identification.releveId = req.body.releve._id
    identification.osmId = req.body.osmId
    identification.date = Date.now()
    identification.confidence=req.body.releve.identificationValue.confidence
    identification.userGenus = req.body.releve.identificationValue.genus
    identification.userCommon = req.body.releve.identificationValue.common
    identification.userSpecie = req.body.releve.identificationValue.specie
    identification.userImage = req.body.releve.identificationValue.userImage
    identification.userOsmId = req.session.user
    identification.username = req.session.username
    identification.save()
    res.send({
      success: true
    })

  })

  app.get('/api/cleanObservations',function(req,res){
    let incorrect=[]
    Observation.find({})
    .exec(function(err,result){
      for(let obs of result){
        if(!obs.validation){
          obs.validation=[]
          incorrect.push(obs)
        }
        if(obs.validation.includes(null)){
          obs.validation=[]
          incorrect.push(obs)
        }
        for(let hist of obs.prev){
          if(!hist.validation){
            hist.validation=[]
            incorrect.push(hist)
          }
          if(hist.validation.includes(null)){
            hist.validation=[]
            incorrect.push(hist)
          }
        }
      obs.save()
      }
      res.send({problems:incorrect})
    })
  })
  app.get('/api/image/:id',function(req,res){
    Observation.findById(req.params.id)
    .exec(function(err,result){
      if(result && result.image){
      var img = new Buffer(result.image.split(',')[1], 'base64');
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length 
      });
      res.end(img);
      }})
  })
  app.get('/api/image/:id/hist/:version',function(req,res){
    Observation.findById(req.params.id)
    .exec(function(err,result){
      let version=parseInt(req.params.version)
      if(result && result.prev && result.prev[version] && result.prev[version].image){
      let image=result.prev[version].image
      console.log(image.split(',')[1])
      var img = new Buffer(image.split(',')[1], 'base64');
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length 
      });
      res.end(img);
      }})
  })

  app.post('/api/observation', function (req, res) {
    if(!req.session.user){
      res.send({success:false,details:'Not authenticated'})
      return
    }
    var observation = new Observation()
    observation.location.coordinates = req.body.releve.coordinates
    observation.genus = req.body.releve.genus
    observation.common = req.body.releve.common
    observation.specie = req.body.releve.specie
    observation.telaBotanicaTaxon= req.body.releve.telaBotanicaTaxon
    observation.commonGenus=req.body.releve.commonGenus
    observation.image = req.body.releve.image
    observation.crown = req.body.releve.crown
    observation.height= req.body.releve.height
    observation.osmId = req.session.user
    observation.confidence=req.body.releve.confidence
    observation.identificationValue = {
      identification: req.body.releve.identificationMode,
      success: false
    }
    observation.authorName = req.session.username
    observation.date = Date.now()
    observation.validation.push({
      name: req.session.username,
      id: req.session.user,
      date:Date.now()
    })
    observation.save()
    observation=observation.toJSON()
    observation.hasImage = observation.image ? true : false
    delete observation.image

    pusher.trigger('observation', 'new_obs', {observation:observation,userId:req.session.user})
    res.send({
      success: true,
      observation: observation
    })
  })

  app.post('/api/observationAnon', function (req, res) {
    if(!req.session.user){
      res.send({success:false,details:'Not authenticated'})
      return
    }
    var observation = new Observation()
    observation.location.coordinates = req.body.releve.coordinates
    observation.genus = req.body.releve.genus
    observation.common = req.body.releve.common
    observation.specie = req.body.releve.specie
    observation.image = req.body.releve.image
    observation.crown = req.body.releve.crown
    observation.height= req.body.releve.height
    observation.osmId = req.session.user.split("").reverse().join("")
    observation.confidence=req.body.releve.confidence
    observation.identificationValue = {
      identification: req.body.releve.identificationMode,
      success: false
    }
    observation.authorName = 'Anon' + observation.osmId
    observation.date = Date.now()
    observation.validation.push({
      name: 'Anon' + observation.osmId,
      id: observation.osmId,
      date:Date.now()
    })
    observation.save()
    observation=observation.toJSON()
    observation.hasImage = observation.image ? true : false
    delete observation.image

    pusher.trigger('observation', 'new_obs', {observation:observation,userId:observation.osmId})
    res.send({
      success: true,
      observation: observation
    })
  })

  app.post('/api/importFromOSM',function(req,res){
    if(!req.session.user){
      res.send({success:false,details:'Not authenticated'})
      return
    }

    var observation = new Observation()
    observation.location.coordinates = req.body.releve.coordinates
    observation.image = req.body.releve.image
    observation.source = 'OSM'
    observation.nodeId= req.body.releve.nodeId
    observation.osmId = req.session.user
    observation.version=req.body.releve.version
    observation.authorName = req.session.username
    observation.identificationValue = {
      identification: false,
      success: false
    }

    observation.date = Date.now()
    observation.validation.push({
      name: req.session.username,
      id: req.session.user,
      date:Date.now()
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
          results[i]=results[i].toJSON()
          results[i].hasImage = results[i].image ? true : false
          delete results[i].image
          for(let prev of results[i].prev){
            prev.hasImage=prev.image ? true:false
            delete prev.image
          }
          let validated = results[i].validation.find(function (value) {
            return value && value.id == req.session.user
          })
        }
        Identification.find()
          .exec(function (err, identifications) {
            for (let releve of results) {
              for (let identification of identifications) {
                console.log(identification.releveId)
                if (releve._id == identification.releveId) {
                  console.log('releve._id == identification.releveId')
                  console.log(identification.userOsmId)
                  console.log(req.session.user)
                  if (identification.userOsmId == req.session.user) {
                    releve.identificationValue = {
                      identification: true,
                      success: true,
                      userSpecie: identification.userSpecie,
                      userGenus:identification.userGenus,
                      userImage:identification.userImage,
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