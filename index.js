let Express = require('express')
let session = require('express-session');
let cors=require('cors')
var mongoose = require('mongoose')
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
app.use(cors({
    origin:['http://localhost:3000','http://osm.reveries-project.fr'],
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
	extended: true
}))
app.use(BodyParser.json())

  
  
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
app.listen(PORT)

// Use connect method to connect to the Server
