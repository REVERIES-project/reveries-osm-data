module.exports = function (app, db, logger) {
    app.get('/trees', function (req, res) {
     
        
      db.collection('points').find({ geometry:
            { $near:{$geometry: { type: "Point",
              coordinates: [ -0.75763, 48.08498 ] },
              $minDistance: 1,$maxDistance: 50000}}} )
              .toArray(function(err,results){
               var toSend=results.map(function(el){
                 return {center:[el.geometry.coordinates[1],el.geometry.coordinates[0]]}
                })
                res.send(toSend)
              })
    })


}