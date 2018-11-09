module.exports = function (app, db, logger) {
    app.get('/', function (req, res) {
        db.collection('trees').find().toArray(function(err,results){res.send(results)})
    })

    app.post('/quotes', (req, res) => {
        db.collection('quotes').save(req.body, (err, result) => {
            if (err) return console.log(err)

            console.log('saved to database')
            res.send('saved')
        })
    })



}