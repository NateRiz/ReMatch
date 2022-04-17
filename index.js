const express = require('express')
const path = require('path')
const app = express();
const port = 5500;

app.use(express.static(path.join(__dirname, "src")));

app.get('/', (req, res) => {
  res.sendFile('./src/views/index.html', { root: __dirname })
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});