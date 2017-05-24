# Real time Spotify app

## Spotichat
With this app you can search a song from your favorite artist. After finding the song you were looking for, you can click on the song and it will send you to a chatroom. Here you can live chat with other users about the song.

### Wishlist
- Combine birthdates of artist/icons to the currentdate on the homepage and link that to a chat
- Create a sticy scroll for the chat
- Show how many users are online

---

## Index
- [Making of](#makingof)
  ..*[Dependencies](#dependencies)
  ..*[Spotify api](#spotifyapi)
  ..*[express-session](#express-session)
  ..*[Socket.io](#socket.io)
- [Installation](#installation)

## [Making of](#makingof)

### [Dependencies](#dependencies)
- [http](http://jariz.github.io/vibrant.js/)
- [express](https://www.npmjs.com/package/express)  // Express web server framework
- [body-parser](https://www.npmjs.com/package/body-parser) // parses the body of an http-request to JSON
- [express-session](https://www.npmjs.com/package/express-session) // to save information in a session
- [superagent](https://www.npmjs.com/package/superagent) // to make a http request
- [shortid](https://www.npmjs.com/package/shortid) //Produces an id
- [socket.io](https://www.npmjs.com/package/socket.io) // for real-time communication
- [node-vibrant](http://jariz.github.io/vibrant.js/) // Color extracter

### [Spotify api](#spotifyapi)
I used the [spotify api](https://spotichat.herokuapp.com) to gain access to all the songs and artists.

### [express-session](#express-session)
I used express-session to create an access token that only last a session. This way every user can access multiple chats with the same ID and nickname.

```javascript
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
```

### [Socket.io](#socket.io)
I used Socket.io for the real time connection for sending messages.

```javascript
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
```

## [Installation](#installation)
First clone the repo:
```git
git clone https://github.com/GiuliaM/rtw.git
```

After that:
```git
npm install
```

Now start up the server:
```git
npm start
```
