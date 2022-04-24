function main() {
    const express = require('express');
    const app = express();
    const port = 5500;
    app.use(express.static(__dirname));
    app.get('/', (_req, res) => {
        res.sendFile('./src/views/index.html', { root: __dirname });
    });
    app.listen(port, () => {
        console.log(`App listening on port ${port}!`);
    });
}

main();
