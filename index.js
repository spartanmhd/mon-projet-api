const express = require('express');
const app = express();
const product = require('./data/product.json')


app.use(express.json()); // Pour parser les requêtes JSON

app.get('/', (req, res) => {
  res.status(200).json(product)
});

app.listen(8000, () => { console.log("Server Up")});
