const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Temporary database (we will use this for now)
let assignments = [
    { id: 1, subject: "Web Technology", title: "HTML Forms", deadline: "2026-09-30", status: "Completed" },
    { id: 2, subject: "JavaScript", title: "DOM Manipulation", deadline: "2026-10-03", status: "In Progress" }
];

// 1. GET all assignments (and filter by status)
app.get('/api/assignments', (req, res) => {
    const { status } = req.query;
    if (status) {
        return res.json(assignments.filter(a => a.status === status));
    }
    res.json(assignments);
});

// 2. POST a new assignment
app.post('/api/assignments', (req, res) => {
    const newAssignment = {
        id: Date.now(),
        subject: req.body.subject,
        title: req.body.title,
        deadline: req.body.deadline,
        status: req.body.status || "Pending"
    };
    assignments.push(newAssignment);
    res.status(201).json(newAssignment);
});

// 3. PUT (Update) status
app.put('/api/assignments/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
        assignment.status = req.body.status;
        res.json(assignment);
    } else {
        res.status(404).json({ message: "Not found" });
    }
});

// 4. DELETE an assignment
app.delete('/api/assignments/:id', (req, res) => {
    const id = parseInt(req.params.id);
    assignments = assignments.filter(a => a.id !== id);
    res.json({ message: "Deleted" });
});
// This makes the homepage show a message instead of an error
app.get('/', (req, res) => {
    res.send('Study Planner API is running perfectly!');
});
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});