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
var httpProxy = require('http-proxy');
let sparqlClient=require('./sparql/sparql')
var proxy = httpProxy.createProxyServer();
console.log(ENV)
var Pusher = require('pusher');

var pusher = new Pusher({
  appId: '757395',
  key: 'f204a3eb6cfeb87e594b',
  secret: '5b48ab538756ebf88912',
  cluster: 'eu',
  encrypted: true
});

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
  app.post('/api/setupImages', function(req, res) {
    console.log("proxying setup Image", req.url);
    proxy.web(req, res, { target: 'http://localhost:8081/api/setupImages'})
    proxy.once('proxyReq', (proxyReq, req) => {
      if (req.body && req.complete) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    });
     
  
  });
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
require('./routes/routes')(app,logger,pusher)
require('./routes/logRoute')(app)
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
    server=app.listen(PORT)
   // server.on('upgrade',function(event){console.log(event)})
}
// Use connect method to connect to the Server
