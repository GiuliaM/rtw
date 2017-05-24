(function() {
    var socket = io();

    var chatWindow = document.querySelector('#chatwindow');

    // Render a single message to the DOM
    // @param  {Boolean} currentUser If this message is by the current user, add a class
    // @param  {String} userID ID of the message author
    // @param  {String} username Authors username
    // @param  {String} message
    function renderMessageToDOM(currentUser, userID, username, message) {
        chatWindow.innerHTML +=
            '<li data-userID="' + userID + '" class="' + (currentUser ? 'currentUser' : '') + '"><span>' + username + '</span> ' + message + '</li>';
    }

    // Update username on existing messages
    // @param  {String} userID ID of the user with a new name
    // @param  {String} newUsername The new username to put in the DOM
    function updateUsername(userID, newUsername) {
        var messages = document.querySelectorAll('[data-userID="' + userID + '"]');
        messages.forEach(function(message) {
            message.querySelector('span').innerHTML = newUsername;
        });
    }


    // Send new message to server
    // ------------------------------------------------------------------------

    var messageForm = document.querySelector('#messageForm');

    messageForm.addEventListener('submit', function(event) {
        // Get values from form
        var userID = messageForm.querySelector('input[name="userID"]').value;
        var trackID = messageForm.querySelector('input[name="trackID"]').value;
        var message = messageForm.querySelector('input[name="message"]').value;

        // Render message to DOM
        renderMessageToDOM(true, userID, currentUsername, message);

        // Send message to server
        socket.emit('message', { // [1]
            userID: userID,
            trackID: trackID,
            message: message
        });

        // Empty message field after send
        messageForm.querySelector('input[name="message"]').value = '';

        // Prevent form from submitting
        event.preventDefault();
        return false;
    });

    // Send users to server
    // ------------------------------------------------------------------------

    var usernameForm = document.querySelector('#usernameForm');

    usernameForm.addEventListener('submit', function(event) {
        // Get values from form
        var userID = usernameForm.querySelector('input[name="userID"]').value;
        var username = usernameForm.querySelector('input[name="username"]').value;

        currentUsername = username;

        // Send message to server
        socket.emit('changeUsername', {
            userID: userID,
            username: username
        });

        // Empty message field after send
        usernameForm.querySelector('input[name="username"]').value = '';

        // Update username in DOM
        updateUsername(userID, username);

        // Prevent form from submitting
        event.preventDefault();
        return false;
    });


    // On new message from server
    // ------------------------------------------------------------------------

    socket.on('message', function(messageData) { // [4]
        var username = messageData.username;
        var message = messageData.message;
        var userID = messageData.userID;

        // Render message to DOM
        renderMessageToDOM(false, userID, username, message);
    });

    socket.on('changeUsername', function(usernameData) {
        var userID = usernameData.userID;
        var newUsername = usernameData.username;

        // Update username in DOM
        updateUsername(userID, newUsername);
    });

}());
