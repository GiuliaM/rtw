var http = require('http'); // Load http library

// server setup
http.createServer(function(request, response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    response.end();
}).listen(8888); // Listen to port 8888
