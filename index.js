const express = require('express');
const sequelize = require('./config/database');
const app = express();
const Product = require('./models/product');
const admin = require('firebase-admin');
const credentials = require("./ServiceAccountKey.json");


app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Utilisation de la méthode createUser d'admin.auth() pour créer un utilisateur
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      userId: userRecord.uid,
      email: userRecord.email,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route POST pour Sign In (Connexion)
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await admin.auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    res.status(200).json({ message: 'Connexion réussie', email: user.email });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



app.get('/', async (req, res) => {
  const allProducts = await Product.findAll(); // Récupérer les produits depuis la base de données
  res.status(200).json(allProducts);
});

// Ajouter un produit par son ID
app.get('/product/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const product = await Product.findByPk(id); // Trouver le produit par sa clé primaire
  if (product) {
    res.status(200).json(product);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

app.post('/products', async (req, res) => {
  const { name, description, price, category_id } = req.body;

  try {
    const newProduct = await Product.create({
      name,
      description,
      price,
      category_id
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/products/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, description, price, category_id } = req.body;

  try {
    const product = await Product.findByPk(id); // Trouver le produit par son ID
    if (product) {
      product.name = name || product.name; // Met à jour uniquement si des nouvelles valeurs sont fournies
      product.description = description || product.description;
      product.price = price || product.price;
      product.category_id = category_id || product.category_id;

      await product.save(); // Sauvegarder les changements
      res.status(200).json(product); // Retourner le produit mis à jour
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


app.delete('/products/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const product = await Product.findByPk(id); // Trouver le produit par son ID
    if (product) {
      await product.destroy(); // Supprimer le produit
      res.status(200).json({ message: "Product deleted successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// Insérer les produits JSON dans la base de données
// Synchroniser la base de données et démarrer le serveur
const PORT = 3000;

sequelize.sync({ alter: true }) // Synchronisation des modèles
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Erreur lors de la synchronisation de la base de données :', err);
    });
