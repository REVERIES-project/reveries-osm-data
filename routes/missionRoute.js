module.exports = function (app,pusher) {
    var fs = require('fs')
    var User = require('../schema/user')
    var _ = require('lodash')
    app.get('/api/mission',function(req,res){
       let f= fs.readFileSync('./missions/mission.json')
       let missionStr=JSON.parse(f.toString())
       res.set('Content-Type', 'application/json')
       res.send(missionStr)
    })
    app.post('/api/uploadMission', function (req, res) {
        let part = req.files;
        let mission = part.file.data.toString()
        try {
            JSON.parse(mission)
        } catch (error) {
            res.status(500).send(error)
            return
        }
        pusher.trigger('observation', 'progression_lost',{valid:true})

        fs.writeFileSync('./missions/mission.json', mission)
        User.find()
            .exec(function (err, users) {
                for (let user of users) {
                    let key = _.without(_.keys(user.toObject()), '_id', 'id', '__v', 'username')
                    for (let k of key) {
                        user[k] = null
                    }
                    user.lostProgression = 1
                    user.save()
                }
            })
        res.send({ success: true })
    })
    app.post('/api/restoreMission', function (req, res) {
        pusher.trigger('observation', 'progression_lost',{valid:true})

        fs.copyFile('./missions/mission.bak', './missions/mission.json', function (err) {
            if (err) {
                console.log(err)
                res.status(500).send(err)
                return
            }
        })
        User.find()
            .exec(function (err, users) {
                for (let user of users) {
                    let key = _.without(_.keys(user.toObject()), '_id', 'id', '__v', 'username')
                    for (let k of key) {
                        user[k] = null
                    }
                    user.lostProgression = 1
                    user.save()
                }
            })
        res.send({ success: true })
    })

}