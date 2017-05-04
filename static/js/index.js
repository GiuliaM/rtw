(function() {
  var song = document.getElementById('song');
  var artist = document.getElementById('artist');
  var image = document.getElementById('image');
    var socket = io();

    socket.on('update song', function(data){
      // data.artists, data.name, data.album;
      // Replace the song title
      song.innerHTML = data.name;

      // Replace the album images
      var images = '';
      data.album.images.forEach(function(img) {
        images += `<img src="${img.url}" alt="">`;
      });
      image.innerHTML = images;

      // Replace the album artists
      var artists = '';
      data.artists.forEach(function(artist, idx) {
        if (data.artists.length - 1 === idx) {
          artists += artist.name;
          return;
        }

        artists += (artist.name + ', ');
      });
      artist.innerHTML = artists;
    });
  })();

(function() {
    var socket = io(); // load the socket.io client
    var chatArea = document.getElementById('chatForm')
    var message = document.getElementById('message');
    var messageForm = document.getElementById('messageForm');
    var chatArea = document.getElementById('chatArea');
    var username = document.getElementById('username');
    var usernameForm = document.getElementById('usernameForm');
    var usernameArea = document.getElementById('usernameArea');
    var users = document.getElementById('users');

//    usernameForm.addEventListener('submit', function() {
//      event.preventDefault();
//      socket.emit('new user', username.value, function(data){
//        if(data){
//          usernameArea.classList.add('hide');
//          chatArea.classList.remove('hide');
//        };
//      });
//      username.value = '';
//    });

    socket.on('get users', function(data) {
      var html = ''; // clear html
      for(i = 0; i < data.length; i++){
        html += `<li>${data[i]}</li>`;
      };
      users.innerHTML = html;
    });
    messageForm.addEventListener('submit', function(event){
      event.preventDefault();
      socket.emit('send message', message.value); //translate to server new message is send
      message.value = '';
    });

    socket.on('new message', function(data) {
      var newMessage = document.createElement('li');
      var messageSender = document.createTextNode(data.user);
      console.log(data.user);
      var messageContent = document.createTextNode(data.msg);
      newMessage.append(messageSender, ': ' , messageContent);
      chat.append(newMessage)
    });
  })();
