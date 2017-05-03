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
