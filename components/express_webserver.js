
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var querystring = require('querystring');
var debug = require('debug')('botkit:webserver');
var http = require('http');
var hbs = require('express-hbs');

const { google } = require('googleapis');
const fs = require('fs');

module.exports = function(controller) {

    var webserver = express();
    webserver.use(function(req, res, next) {
        req.rawBody = '';

        req.on('data', function(chunk) {
            req.rawBody += chunk;
        });

        next();
    });
    webserver.use(cookieParser());
    webserver.use(bodyParser.json());
    webserver.use(bodyParser.urlencoded({ extended: true }));

    // set up handlebars ready for tabs
    webserver.engine('hbs', hbs.express4({partialsDir: __dirname + '/../views/partials'}));
    webserver.set('view engine', 'hbs');
    webserver.set('views', __dirname + '/../views/');

    // import express middlewares that are present in /components/express_middleware
    var normalizedPath = require("path").join(__dirname, "express_middleware");
    require("fs").readdirSync(normalizedPath).forEach(function(file) {
        require("./express_middleware/" + file)(webserver, controller);
    });

    webserver.use(express.static('public'));

    webserver.get('/hello_world', function(req, res) {
      console.log('state/user', req.query.state);
      
      controller.storage.users.get(req.query.state, (err, user) => {
          console.log(user);
          user.oAuth2Client.getToken(req.query.code, (err, token) => {
              if (err) return console.error('Error retrieving access token', err);
              user.token = token;
              user.oAuth2Client.setCredentials(token);
          });
      });
      
      res.send('This is working!');
    });
  
    // Google Domain Authentication
    webserver.get('/google08c1ff764232bff6.html', function(req, res) {
      res.render('google08c1ff764232bff6.hbs');
    });
  
    var server = http.createServer(webserver);

    server.listen(process.env.PORT || 3000, null, function() {

        console.log('Express webserver configured and listening at http://localhost:' + process.env.PORT || 3000);

    });

    // import all the pre-defined routes that are present in /components/routes
    var normalizedPath = require("path").join(__dirname, "routes");
    require("fs").readdirSync(normalizedPath).forEach(function(file) {
      require("./routes/" + file)(webserver, controller);
    });

    controller.webserver = webserver;
    controller.httpserver = server;

    return webserver;

}