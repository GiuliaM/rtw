// Require Node Modules
// ----------------------------------------------------------------------------------------
var http = require('http');
var express = require('express'); // Express web server framework
var bodyParser = require('body-parser'); // parses the body of an http-request to JSON
var request = require('superagent'); // to make a http request
var session = require('express-session');
var shortid = require('shortid'); //Produces an id
var socket= require('socket.io');
var vibrant = require('node-vibrant'); // Color extracter



// "Databases"
// ----------------------------------------------------------------------------------------

/*
{
    [userID]: {
        name: String
    }
}
*/
var users = {};
/*
{
    [trackID]: {
        activeUsers: [String],
        messages: [{
            date: Date,
            user: String,
            message: String
        }]
    }
}
*/
var chatrooms = {};


// Express Routes
// ----------------------------------------------------------------------------------------

var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

//app looks in the static folder
app.use('/static', express.static('./static'));

//translate all x-www-form-urlencoded to JSON
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret: 'cookiemonster',
    cookie: {maxAge: 3600000},
    saveUninitialized: false,
    resave: false
}));

//https://expressjs.com/en/guide/using-middleware.html
//checks if there is a userID in session, if not, create one
app.use(function(req, res, next) {
    if(req.session.userID === undefined){
        // generate id for new user
        var userID = shortid.generate();

        // save id to session
        req.session.userID = userID;

        // save id to users "database"
        users[userID] = {
            name: 'Ano niem'
        }
    }

    next();
});

// Homepage
app.get('/', function(req, res) {
    res.render('index', {
        items: []
    });
});

//clientside posts searchQuery to server and sends request to spotify. After that render this data in index.
app.post('/', function(req, res) {
    var apiUrl = 'https://api.spotify.com/v1/search?type=track&q=' + req.body.searchQuery;
    request
        .get(apiUrl)
        .end(function(err, apiResponse) {
            if(err) {
                console.log(err);
                return res.send(err);
            }

            res.render('index', {
                items: apiResponse.body.tracks.items
            });
        });
});

//Checks if the trackID already exists in chatrooms, if not create one
function checkIfChatroomExists(req, res, next) {
    var trackID = req.params.trackID;

    if(chatrooms[trackID] === undefined) {
        chatrooms[trackID] = {
            activeUsers: [],
            messages: []
        };
    }

    next();
}

//Make a dynamic url for the chats
app.get('/chat/:trackID', checkIfChatroomExists, function(req, res) {
    var trackID = req.params.trackID;
    var apiUrl = 'https://api.spotify.com/v1/tracks/' + trackID;

    request
        .get(apiUrl)
        .end(function(err, apiResponse) {
            if(err) {
                console.log(err);
                return res.send(err);
            }

            vibrant
                .from(apiResponse.body.album.images[1].url)
                .getPalette(function(err, palette) {
                    // Default colors
                    var colorPalette = {
                        backgroundColor: [255, 255, 255],
                        color: [0, 0, 0]
                    }

                    if (err) {
                        console.log(err);
                    } else {
                        colorPalette.backgroundColor = palette.DarkMuted['_rgb'];
                        colorPalette.color = palette.Vibrant['_rgb'];
                    }

                    res.render('chat', {
                        colorPalette: colorPalette,
                        track: apiResponse.body,
                        trackID: trackID,
                        username: users[req.session.userID].name,
                        userID: req.session.userID,
                        //Define that username is users[userID].name and return the array message with the updated name
                        //Add username from users object to each message
                        messages: chatrooms[trackID].messages.map(function(message) {
                            var userID = message.userID;
                            var username = users[userID].name;
                            message.username = username;
                            return message;
                        })
                    });
                });
        });

});

//Receive a message from the message form
app.post('/chat/:trackID', checkIfChatroomExists, function(req, res) {
    var trackID = req.params.trackID;

    chatrooms[trackID].messages.push({
        userID: req.body.userID,
        message: req.body.message,
        date: new Date()
    });

    res.redirect('/chat/' + trackID);
});

//Receive request to change username
app.post('/change-username', function(req, res) {
    var userID = req.body.userID;
    var newUsername = req.body.username;

    users[userID].name = newUsername;

    // Redirect back to where the user came from
    res.redirect(req.header('Referer') || '/');
});

var server = http.createServer(app);


// Socket.io Events
// ----------------------------------------------------------------------------------------

var io = socket(server);

io.on('connection', function(socket) {

    // Receive a message from the message form
    socket.on('message', function(messageData) { // [2]
        var trackID = messageData.trackID;
        var message = messageData.message;
        var userID = messageData.userID;
        var username = users[userID].name;

        var message = {
            userID: userID,
            message: message,
            date: new Date()
        };

        // Update "database"
        chatrooms[trackID].messages.push(message);

        // Add the username to the message before we send it to the other clients
        message.username = username;

        // Send message to all clients without sender
        socket.broadcast.emit('message', message); // [3]
    });

    socket.on('changeUsername', function(usernameData) {
        var userID = usernameData.userID;
        var newUsername = usernameData.username;

        // Update "database"
        users[userID].name = newUsername;

        // Send updated username to all other clients
        socket.broadcast.emit('changeUsername', usernameData);
    });
});


// Listen to server
// ----------------------------------------------------------------------------------------

server.listen(process.env.PORT || 3000, function() {
    console.log('server listening on port 3000');
});
