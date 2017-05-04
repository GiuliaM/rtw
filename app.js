var request = require('request'); // require "Request" library
var querystring = require('querystring'); //parsing and formatting URL query strings
var env = require('dotenv').config(); //loads environment variables into process.env
var express = require('express'); // Express web server framework
var session = require('express-session') // Session to save an accesstoken

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
var connections= [];

app.use(session({
    secret: 'just another secret',
    saveUninitialized: true,
    resave: false
}));

app.set('view engine', 'ejs'); // set the view engine to ejs

app.get('/', function(req, res) {
//    var sess = req.session;
    res.render('index');
})

app.get('/login', function(req, res) {
  var permissions = encodeURIComponent('client'); //It's necessary to encode the permissions string to allow for scopes like channels:read

  console.log("serving Spotify button with permissions: " + permissions);

  // Here we need request.app to access Express instance called 'app' we created in our main server file
  if (req.session.accessToken){ // controle if the oauth has been done
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
    req.session.accessToken = body.access_token;
    req.session.refreshToken = body.refresh_token;
    res.redirect('/playlist'); // redirect to playlist.ejs
  });
});

app.get('/playlist', function(req, res) { // render the playlist page
    if (req.session.accessToken) {
        var options = {
            url: 'https://api.spotify.com/v1/me/player/currently-playing',
            headers: {
                Authorization: 'Bearer ' + req.session.accessToken
            },
            json: true
        };

        request.get(options, function(error, response, body) {
            if (error) throw error;
            req.session.currentlyPlaying = body.item.id;
            res.render('playlist', {
                artists: body.item.artists,
                album: body.item.album,
                name: body.item.name
            });
        });

      io.on('connection', function(socket) {
          setInterval(function(){
              request.get(options, function(error, response, body) {
                  console.log(req.session.currentlyPlaying, body.item.id);
                if (req.session.currentlyPlaying !== body.item.id) {
                    req.session.currentlyPlaying = body.item.id;
                    socket.emit('update song', {
                        artists: body.item.artists,
                        album: body.item.album,
                        name: body.item.name
                    });
                }
              });
          }, 1000);

          // When a client disconnects, do
          socket.on('disconnect', function(data){
              // remove the user from the users array
              users.splice(users.indexOf(socket.username), 1);
          });
      });
  } else {
    res.redirect('/');
  }
});

app.get('/chatroom', function(req, res) { // render the chatroom page

    var profile = {
      url: 'https://api.spotify.com/v1/me',
      headers: { 'Authorization': 'Bearer ' + req.session.accessToken },
      json: true
    }

    request.get(profile, function(error, response, body) {
      var nickname = body.id;
    console.log(body);

      res.render('chatroom', {body: body});

    io.on('connection', function(socket){
      connections.push(socket);
      console.log('Connected: %s sockets connected', connections.length);

      console.log(profile.id, "dat ben ik");

      socket.on('send message', function(data){
          io.sockets.emit('new message', {msg: data, user: nickname});
    });

//    socket.on('new user', function(data, callback){
//      callback(true);
//      nickname = data;
//      users.push(nickname);
//      updateUsernames();
//    });

      // Disconnect
    socket.on('disconnect', function(data){
        users.splice(users.indexOf(socket.username), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });

    function updateUsernames(){
      io.sockets.emit('get users', users);
    }
});
    });
});
