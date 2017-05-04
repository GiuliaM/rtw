# Real time Spotify app

## Spotichat
This real time app shows the user what song they are listening to. Besides seeing the current song, the user can also chat with other people that are listening to that same song through the chat.

When visiting the website, the user needs to login to spotify and give the app permission to get data from the user. This happens with OAuth. After that the user gets redirected to the page with the current song. They can choose to press the button 'Go to the chat' to go to the chat of the current song.

The purpose of this app is to bring music lovers together and make it able for people to share their opinion about music.

### Wishlist
- Chat
- Combine birthdates of artist/icons to the date and a chat

---

## Index
- [Making of](#makingof)
- [Installation](#installation)

## [Making of](#makingof)
### Spotify api
### OAth
I used express-session to create an access token that only last a session. This way every user has his own session id and can see their own spotify.

### Socket.io

## [Installation](#installation)
First clone the repo:
```git
git clone https://github.com/GiuliaM/rtw.git
```

After that:
```git
npm install
```

Create an .env file with these variables:
```javascript
CLIENT_ID=[Your client ID]
CLIENT_SECRET=[Your client secret]
REDIRECT_URI=[Your callback url]
```

Now start up the server:
```git
npm start
```
