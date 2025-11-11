// server.js - starter Express server for Week 2 assignment

//Import require modules
const Express = require("express");
const bodyParser = require("body-parser");
const {v4: uuidv4} = require("uuid");

// Initialize Express app
const app = Express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());

// sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price:1200,
    category: 'electronics',
    instock: true
  },
  {
    id: '2',
    name: 'smartphone',
    description: 'latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    instock: true
  },
  {
    id: '3',
    name: 'coffee Maker',
    description: 'programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    instock: false
  }
];

// --- CUSTOM MIDDLEWARE IMPLEMENTATION ---

// 1. Request loggin Middleware

const requestLogger = (req, res, next) => {
  console.log('[${new Date().toISOString()}] ${req.method} ${req.url}');
  next(); // Must call next() to pass control to the next middleware/route handler
};

// 2. Simple Authentication Middleware (Stub)
const authenticate = (req, res, next) => {
  // In a real app, you would check for a token/session here.
  // For this assignment, we'll just log and proceed.
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    console.log(`Authentication check: Token present.`);
  } else {
    console.log(`Authentication check: No token present.`);
  }

  // To simulate a failure, you could do:
  // if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

  next();
};

// Apply custom middleware globally
app.use(requestLogger);
app.use(authenticate); // Note: For a real app, you might apply this to specific routes

// --- ROUTES ---

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

// GET /api/products - Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// GET /api/products/:id - Get a specific product
app.get('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const product = products.find(p => p.id === id);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: `Product with id ${id} not found.` });
  }
});

// POST /api/products - Create a new product
app.post('/api/products', (req, res) => {
  const { name, description, price, category, inStock } = req.body;

  // Basic input validation
  if (!name || !price) {
    return res.status(400).json({ message: 'Name and price are required fields.' });
  }

  const newProduct = {
    id: uuidv4(), // Generate a unique ID
    name,
    description: description || '',
    price: Number(price),
    category: category || 'miscellaneous',
    inStock: inStock === undefined ? true : Boolean(inStock)
  };

  products.push(newProduct);
  res.status(201).json(newProduct); // 201 Created
});

// PUT /api/products/:id - Update a product
app.put('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const index = products.findIndex(p => p.id === id);

  if (index !== -1) {
    // Merge existing product with new data from req.body
    products[index] = {
      ...products[index],
      ...req.body,
      id: id // Ensure the ID remains unchanged
    };
    res.json(products[index]);
  } else {
    res.status(404).json({ message: `Product with id ${id} not found for update.` });
  }
});

// DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const initialLength = products.length;
  
  // Filter out the product with the matching ID
  products = products.filter(p => p.id !== id);

  if (products.length < initialLength) {
    res.status(200).json({ message: `Product with id ${id} deleted successfully.` });
  } else {
    res.status(404).json({ message: `Product with id ${id} not found for deletion.` });
  }
});

// --- ERROR HANDLING MIDDLEWARE ---

// 3. Error Handling Middleware (must be the last middleware defined)
// It takes four arguments: (err, req, res, next)
app.use((err, req, res, next) => {
  console.error(`ERROR: ${err.stack}`);
  res.status(500).json({ 
    message: 'Something went wrong on the server.',
    error: err.message 
  });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = app;