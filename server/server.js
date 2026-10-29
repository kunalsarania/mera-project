const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

const ADMIN_PASSWORD = "admin@123password";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

function readData() {
  const content = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(content || '[]');
}

function writeData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Sabhi fields zaroori hain!" });
  }

  const messages = readData();
  const newMessage = {
    id: Date.now().toString(),
    name,
    email,
    message,
    date: new Date().toLocaleString()
  };

  messages.unshift(newMessage);
  writeData(messages);
  res.json({ success: true, message: "Aapka message safalta-purvak save ho gaya!" });
});

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: "admin-logged-in-secret" });
  }
  return res.status(401).json({ success: false, error: "Galat password!" });
});

app.get('/api/admin/messages', (req, res) => {
  const auth = req.headers['authorization'];
  if (auth !== "admin-logged-in-secret") {
    return res.status(403).json({ error: "Unauthorized access" });
  }
  res.json({ success: true, data: readData() });
});

app.delete('/api/admin/messages/:id', (req, res) => {
  const auth = req.headers['authorization'];
  if (auth !== "admin-logged-in-secret") {
    return res.status(403).json({ error: "Unauthorized access" });
  }
  const { id } = req.params;
  let messages = readData();
  messages = messages.filter(item => item.id !== id);
  writeData(messages);
  res.json({ success: true, message: "Entry delete ho gayi." });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});