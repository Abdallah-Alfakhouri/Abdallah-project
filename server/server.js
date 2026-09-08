import express from 'express';
import sqlite3 from 'sqlite3';

const app = express();
app.use(express.json());

const db = new sqlite3.Database('./app.db', (err) => {
    if (err) console.error("Database connection error:", err.message);
    else console.log("Connected to the SQLite database.");
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        user_id INTEGER,
        category_id INTEGER
    )`);
});

app.post('/api/items', (req, res) => {
    const { title } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    const query = `INSERT INTO Tasks (title, user_id, category_id) VALUES (?, 1, 1)`;
    db.run(query, [title], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ 
            message: "Task added successfully!", 
            id: this.lastID 
        });
    });
});

app.get('/api/items', (req, res) => {
    const query = `SELECT * FROM Tasks`;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
});

app.listen(8080, () => {
    console.log("Server running on http://localhost:8080");
});
