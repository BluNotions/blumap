const express = require('express');
require('dotenv').config();  // Load environment variables from .env file

const app = express();
const port = 3000;

app.get('/api/google-maps', (req, res) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const callback = process.env.GOOGLE_API_CALLBACK;
  const scriptTag = `<script src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callback}" async defer></script>`;
  res.send(scriptTag);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
