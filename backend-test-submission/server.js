const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const urls = {};

function generateCode() {
  return Math.random().toString(36).substring(2, 8);
}

app.post('/shorten', (req, res) => {
  const { url } = req.body;
  let code = generateCode();
  
  while (urls[code]) {
    code = generateCode();
  }
  
  urls[code] = {
    url,
    clicks: 0,
    created: new Date()
  };
  
  res.json({ 
    shortUrl: `http://localhost:3001/${code}`,
    code 
  });
});

app.get('/stats/:code', (req, res) => {
  const data = urls[req.params.code];
  if (!data) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json(data);
});

app.get('/list', (req, res) => {
  const result = Object.entries(urls).map(([code, data]) => ({
    code,
    ...data
  }));
  res.json(result);
});

app.get('/:code', (req, res) => {
  const data = urls[req.params.code];
  if (!data) {
    return res.status(404).send('URL not found');
  }
  
  data.clicks++;
  res.redirect(data.url);
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
