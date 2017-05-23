var express = require('express'); // Express web server framework
var bodyParser = require('body-parser'); // parses the body of an http-request to JSON
var request = require('superagent'); // to make a http request
var session = require('express-session');
var shortid = require('shortid'); //Produces an id

var app = express();

/*
{
    [id]: {
        name: String
    }
}
*/
var users = {};

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

//Make a dynamic url for the chats
app.get('/chat/:trackID', function(req, res) {
    var apiUrl = 'https://api.spotify.com/v1/tracks/' + req.params.trackID;
    request
        .get(apiUrl)
        .end(function(err, apiResponse) {
            if(err) {
                console.log(err);
                return res.send(err);
            }

            res.render('chat', {
                track: apiResponse.body
            });
        });

});

app.listen(3000, function() {
    console.log('server listening on port 3000');
});
