function main() {
    const express = require('express');
    const { ExpressPeerServer } = require('peer');
    const lowercasePaths = require("express-lowercase-paths");
    
    const app = express();
    const port = 5500;

    app.use(express.static(__dirname));

    const server = app.listen(port, () => {console.log(`App listening on port ${port}!`);});
    const peerServer = ExpressPeerServer(server, {
        debug: true
    });

    app.use(lowercasePaths());

    app.get('/play', (_req, res) => {
        res.sendFile('./src/views/classic.html', {root: __dirname});
    });

    app.use('/peerjs', peerServer);
    app.get('/peerjs/*', peerServer);

    app.get('/', (_req, res) => {
        res.sendFile('./src/views/index.html', { root: __dirname });
    });

    app.get('/*', (_req, res) => {
        res.sendFile('./src/views/Multiplayer.html', { root: __dirname });
    });


}

main();
