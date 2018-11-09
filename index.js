let Express = require('express')
let Mongodb = require('mongodb')
let Winston = require('winston')
let BodyParser=require('body-parser')
let ENV = "development"
let PORT = "8000"

// create logger first
var logger = Winston.createLogger({
    transports: [
        new(Winston.transports.File)({
            filename: './logs/problem.log'
        })
    ]
})
// creating express server
let app = Express()
app.use(BodyParser.urlencoded({
	extended: true
}))

// attempt to connect to mongodb
const assert = require('assert');

// Connection URL
const url = require('./config/mongoURL').mongoURL;

// Database Name
const dbName = 'osm';

// Create  new MongoClient
const client = new Mongodb.MongoClient(url)
var db
// Use connect method to connect to the Server
client.connect(function (err) {
    assert.equal(null, err);
    logger.log("info", "Connected successfully to database server");
    db = client.db(dbName);
    require('./routes/routes')(app,db,logger)

    console.log(ENV )
    // start an https server for production
    if (ENV === "production") {
        var secureServer = https.createServer({
                key: fs.readFileSync('/etc/letsencrypt/live/conception.reveries-project.fr/privkey.pem'),
                cert: fs.readFileSync('/etc/letsencrypt/live/conception.reveries-project.fr/cert.pem')
            }, app)
            .listen(PORT, function () {
                console.log('Secure Server listening on port ' + PORT)
            })
    }
    //start a simple server for developpement
    if (ENV === "development") {
        app.listen(PORT)
        console.log('Listenning on port ' + PORT)

    }
})
