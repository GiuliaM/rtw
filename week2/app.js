var request = require('request'); // require "Request" library
var querystring = require('querystring'); //parsing and formatting URL query strings
var env = require('dotenv').config(); //loads environment variables into process.env
var express = require('express'); // Express web server framework

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(process.env.PORT || 3000);
console.log('server listening on port 3000');

app.use('/static', express.static('./static')); //app looks in the static folder

var client_id = process.env.CLIENT_ID; // Your client id
var client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri = process.env.REDIRECT_URI; // Your redirect uri
var users = [];
var connections = [];

app.set('view engine', 'ejs'); // set the view engine to ejs

app.get('/', function(req, res) {
  res.render('index');
})

app.get('/login', function(req, res) {
  var permissions = encodeURIComponent('client'); //It's necessary to encode the permissions string to allow for scopes like channels:read

  console.log("serving Spotify button with permissions: " + permissions);

  // Here we need request.app to access Express instance called 'app' we created in our main server file
  if (app.accessToken){ // controle if the oauth has been done
    console.log("already have oauth, reroute client to /playlist");
    res.redirect('/playlist');
  } else { // if it doesn't exist, ask permission for this information
    console.log("new instance");
    var scope = 'user-read-private user-read-email user-read-currently-playing user-read-playback-state user-read-recently-played';

    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri
        }));
  }
});

app.get('/callback', function(req, res) {
  var code = req.query.code; //code that appears in the url

  var authOptions = { // Info to send the tokens to spotify
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) //base64 = binary-to-text encoding
    },
    json: true
  };

  // Sending tokens to spotify to ask permission to access the API
  request.post(authOptions, function(error, response, body) {
    var access_token = body.access_token;
    var refresh_token = body.refresh_token;
    app.accessToken = body.access_token; // save in express users access token
    // console.log(body);
    res.redirect('/playlist'); // redirect to playlist.ejs
  });
});

app.get('/playlist', function(req, res) { // render the playlist page

  if (app.accessToken){

    var options = {
      url: 'https://api.spotify.com/v1/me/player/currently-playing',
      headers: { 'Authorization': 'Bearer ' + app.accessToken },
      json: true
    }

    request.get(options, function(error, response, body) {
      // console.log(app.accessToken);
//     console.log(body.item);
//    console.log(body);


      res.render('playlist', {body: body});
    });
  } else {
    res.redirect('/');
  }
});

//app.get('/chatroom', function(req, res) { // render the playlist page
//
//    var profile = {
//      url: 'https://api.spotify.com/v1/me',
//      headers: { 'Authorization': 'Bearer ' + app.accessToken },
//      json: true
//    }
//
//    request.get(profile, function(error, response, body) {
//      // console.log(app.accessToken);
////     console.log(body.item);
//    console.log(body);
//
//      res.render('chatroom', {body: body});
//    });
//
//})
//

//Socket connections
io.on('connection', function(socket){
  connections.push(socket);
  console.log('Connected: %s sockets connected', connections.length);

  // Disconnect
  socket.on('disconnect', function(data){
    users.splice(users.indexOf(socket.username), 1);
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s sockets connected', connections.length)
  });

  // Checks if a new song is played:
  socket.on('next song', function(data) {
    // console.log(data.song, data.artist);
    var options = {
      url: 'https://api.spotify.com/v1/me/player/currently-playing',
      headers: { 'Authorization': 'Bearer ' + app.accessToken },
      json: true
    }

    request.get(options, function(error, response, body) {
//      console.log(data.song == body.item.name);
//      console.log(data.artist == app.artists);
//      console.log(data.song);
//      console.log(body.item.name, "hier");
//        var data = JSON.parse(body);
//        console.log(body);

      body.item.artists.map(function(obj){
        app.artists = obj.name;
      })

      if(data.song !== body.item.name || data.artist !== app.artists) {
//        console.log('update this sonnng!');
        socket.emit('update song', {body: body});
      } else {
//        console.log('still listening to the same tune?');
      }
    });
//    console.log('Check if a new song is played');
  })

});
