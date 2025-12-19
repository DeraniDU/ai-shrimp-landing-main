const http = require('http');

// /c:/Users/Deranindu/Desktop/ai-shrimp-landing-main/api-land/home.js
// Simple "Hello, world" handler.
// Exports a Node-style request handler and can run standalone.


function handler(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Hello, world\n');
}

if (require.main === module) {
    const port = process.env.PORT || 3000;
    http.createServer(handler).listen(port, () => {
        console.log(`Listening on http://localhost:${port}/`);
    });
} else {
    module.exports = handler;
}