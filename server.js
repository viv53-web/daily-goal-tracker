const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize SQLite database
const db = new Database('goals.db');

// Create goals table if it doesn't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// GET all goals
app.get('/api/goals', (req, res) => {
    const goals = db.prepare('SELECT * FROM goals ORDER BY id ASC').all();
    res.json(goals.map(goal => ({
        id: goal.id,
        text: goal.text,
        completed: Boolean(goal.completed)
    })));
});

// POST new goal
app.post('/api/goals', (req, res) => {
    const { text } = req.body;
    if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Goal text is required' });
    }

    const result = db.prepare('INSERT INTO goals (text) VALUES (?)').run(text.trim());
    const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
        id: goal.id,
        text: goal.text,
        completed: Boolean(goal.completed)
    });
});

// PUT update goal
app.put('/api/goals/:id', (req, res) => {
    const { id } = req.params;
    const { text, completed } = req.body;

    const existing = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    if (!existing) {
        return res.status(404).json({ error: 'Goal not found' });
    }

    const newText = text !== undefined ? text.trim() : existing.text;
    const newCompleted = completed !== undefined ? (completed ? 1 : 0) : existing.completed;

    db.prepare('UPDATE goals SET text = ?, completed = ? WHERE id = ?').run(newText, newCompleted, id);

    res.json({
        id: Number(id),
        text: newText,
        completed: Boolean(newCompleted)
    });
});

// DELETE goal
app.delete('/api/goals/:id', (req, res) => {
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    if (!existing) {
        return res.status(404).json({ error: 'Goal not found' });
    }

    db.prepare('DELETE FROM goals WHERE id = ?').run(id);
    res.status(204).send();
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Access from other devices using your computer's IP address on port ${PORT}`);
});
