const express = require('express');
const { ExpressPeerServer } = require('peer');

function main() {
    const app = express();
    const port = 5500;

    app.use(express.static(__dirname));

    const server = app.listen(port, () => {console.log(`App listening on port ${port}!`);});
    const peerServer = ExpressPeerServer(server, {
        debug: true
    });
    app.use('/peerjs', peerServer);
    app.get('/peerjs/*', peerServer);

    app.get('/*', (_req, res) => {
        res.sendFile('./src/views/index.html', { root: __dirname });
    });
}

main();
