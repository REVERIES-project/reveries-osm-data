let Express = require('express')
let session = require('express-session');
let cors=require('cors')
var mongoose = require('mongoose')
let Winston = require('winston')
let BodyParser=require('body-parser')
let fs=require('fs')
let ENV=process.env.NODE_ENV
let PORT=process.env.PORT
let https=require('https')
let sparqlClient=require('./sparql/sparql')

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
app.use(cors({
    origin:['http://localhost:8000','http://localhost:3000','http://albiziapp.reveries-project.fr','https://albiziapp.reveries-project.fr'],
    methods:['GET','POST'],
    credentials: true // enable set cookie
}
));

app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: "thedogsleepsatnight",
}));

app.use(BodyParser.urlencoded({
    extended: true,
    limit: '50mb'
}))
app.use(BodyParser.json({limit: '50mb'}))

  
  
// attempt to connect to mongodb
const assert = require('assert');

// Connection URL
const url = require('./config/mongoURL').mongoURL;

// Database Name
const dbName = 'geospatial';
mongoose.connect(url)
var database = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
database.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Create  new MongoClient
require('./routes/routes')(app,logger)
require('./routes/keyRoute')(app,sparqlClient)
if (ENV === "production") {
	var secureServer = https.createServer({
			key: fs.readFileSync('/etc/letsencrypt/live/albiziapp.reveries-project.fr/privkey.pem'),
			cert: fs.readFileSync('/etc/letsencrypt/live/albiziapp.reveries-project.fr/cert.pem')
		}, app)
		.listen(PORT, function () {
			console.log('Secure Server listening on port ' + PORT)
		})
}

//start a simple server for developpement
if (ENV === "development") {
	app.listen(PORT)
}
// Use connect method to connect to the Server
