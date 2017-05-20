
import * as express from 'express';
import { Express } from 'express';
import  * as config  from './app/config';
import { router as collections } from './app/routes/collectionsRoutes';
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

const httpsApp: Express = express();
const httpApp: Express = express();

const port: number =  process.env.port || config.applicationPort;
const httpsport: number =  process.env.port || config.applicationHttpsPort;

console.log("Dir name - "+__dirname)
httpsApp.use(express.static(__dirname + '/public'));


// Add headers
httpsApp.use(function (req, res, next) {

    console.log("Origin  - "+req.header('Origin'));
    // Website you wish to allow to connect
    if(req.header('Origin')){
    res.setHeader('Access-Control-Allow-Origin', req.header('Origin'));
    }

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Pass to next layer of middleware
    next();
});

httpsApp.use('/',collections);

httpApp.set('port', port);
httpApp.get("*", function (req, res, next) {
    res.redirect("https://" + req.host + ":" + httpsport+req.url);
});

http.createServer(httpApp).listen(httpApp.get('port'), function() {
    console.log('Express HTTP server listening on port ' + httpApp.get('port'));
});


https.createServer({
    key: fs.readFileSync(path.join(__dirname)+'/nginx.key'),
    cert: fs.readFileSync(path.join(__dirname)+'/nginx.crt')
},httpsApp).listen(httpsport);

console.log(`Started running HTTPS on port ${httpsport} `);