function main() {
    const express = require('express');
    const { ExpressPeerServer } = require('peer');
    var path = require('path');
    const lowercasePaths = require("express-lowercase-paths");
    
    const app = express();
    const port = 5500;

    app.use(express.static(path.join(__dirname, "public")));

    const server = app.listen(port, () => {console.log(`App listening on port ${port}!`);});
    const peerServer = ExpressPeerServer(server, {
        debug: true
    });

    app.use(lowercasePaths());

    app.get('/play', (_req, res) => {
        res.sendFile('./public/classic.html', {root: __dirname});
    });

    app.use('/peerjs', peerServer);
    app.get('/peerjs/*', peerServer);

    app.get('/', (_req, res) => {
        res.sendFile('./public/index.html', { root: __dirname });
    });

    app.get('/*', (_req, res) => {
        res.sendFile('./public/multiplayer.html', { root: __dirname });
    });


}

main();
