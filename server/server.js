// Import the 'express' module — a minimalist web framework for Node.js
const express = require('express');

// Import Node's built-in 'path' module for handling file paths
const path = require('path');

// Import Node's built-in 'fs' module for file operations
const fs = require('fs');

// Create an instance of an Express application
const app = express();

// Define the port number the server will listen on
const PORT = 3000;

// Path to JSON data file where entries are stored
const DATA_FILE = path.join(__dirname, '../data/entries.json');

// --------------------
// MIDDLEWARE
// --------------------

// Serve static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, '../public')));

// Parse incoming JSON requests (e.g., from fetch POST)
app.use(express.json());


// --------------------
// ROUTES
// --------------------

//POST /entry
//Receives a journal entry from the client and appends it to the entries.json file.

app.post('/entry', (req, res) => {
  const newEntry = req.body; //Grab the entry object sent from frontend
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  // Read the existing entries file
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading entries.json:', err);
      return res.status(500).json({ error: 'Failed to read entries file.' });
    }

    let entries = [];
    try {
      entries = JSON.parse(data); //Parse JSON file into array
    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
    }

    // Check if there is already an entry for today
    const alreadySubmitted = entries.some(entry => entry.timestamp.slice(0, 10) === today);
    if (alreadySubmitted) {
      return res.status(400).json({ error: 'You have already submitted an entry today.' });
    }

    // Add a timestamp to the new entry before saving
    newEntry.timestamp = new Date().toISOString();
    entries.push(newEntry); // Push it into the array

    // Write the updated entries back to the JSON file
    fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2), (err) => {
      if (err) {
        console.error('Error writing to entries.json:', err);
        return res.status(500).json({ error: 'Failed to save entry.' });
      }

      res.status(200).json({ message: 'Entry saved successfully!' });
    });
  });
});



// GET /entries
// Returns all saved journal entries (for timeline, history, etc).

app.get('/entries', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading entries.json:', err);
      return res.status(500).json({ error: 'Failed to read entries file.' });
    }

    try {
      const entries = JSON.parse(data); // Parse JSON string into array
      res.status(200).json(entries); // Send the entries back to the frontend
    } catch (parseErr) {
      console.error('Error parsing entries.json:', parseErr);
      res.status(500).json({ error: 'Failed to parse entries file.' });
    }
  });
});


// --------------------
// START SERVER
// --------------------

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});