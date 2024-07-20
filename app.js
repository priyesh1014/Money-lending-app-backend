const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/routing');
const app = express();

mongoose.connect('mongodb+srv://jumpydesk:priyesh123@cluster0.mn8nqg1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use('/api', userRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000!');
});
