// IMPORTANT: If your backend is on a different port, change it here.
const API_URL = 'https://studyplanner-ktmhxq5a-abinayavn7-ctrl.vercel.app/api/assignments';
let currentFilter = 'All';
let searchQuery = '';

// Fetch data from backend
async function fetchAssignments() {
    try {
        const response = await fetch(API_URL);
        allAssignments = await response.json();
        renderAssignments();
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById('assignment-list').innerHTML = `
            <div class="empty-state">⚠️ Could not connect to the server. Is the backend running?</div>
        `;
    }
}

// Display assignments on the screen
function renderAssignments() {
    const list = document.getElementById('assignment-list');
    list.innerHTML = '';

    // Filter logic (by search text and by status button)
    let filtered = allAssignments.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              a.subject.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = currentFilter === 'All' || a.status === currentFilter;
        return matchesSearch && matchesFilter;
    });

    if (filtered.length === 0) {
        list.innerHTML = `<div class="empty-state">No assignments found. Time to relax! ☕</div>`;
        return;
    }

    filtered.forEach(task => {
        const card = document.createElement('div');
        // Fix class name for "In Progress" for CSS
        const statusClass = task.status.replace(' ', '\\.');
        card.className = `card ${statusClass}`;
        
        card.innerHTML = `
            <div class="card-info">
                <div class="subject">${task.subject}</div>
                <h3>${task.title}</h3>
                <div class="deadline">📅 Due: ${task.deadline}</div>
            </div>
            <div class="card-actions">
                <select class="status-select" onchange="updateStatus('${task.id}', this.value)">
                    <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
                <button class="btn-delete" onclick="deleteAssignment('${task.id}')">✕</button>
            </div>
        `;
        list.appendChild(card);
    });
}

// Add new assignment
document.getElementById('assignment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newTask = {
        subject: document.getElementById('subject').value,
        title: document.getElementById('title').value,
        deadline: document.getElementById('deadline').value,
        status: document.getElementById('status').value
    };

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
    });

    e.target.reset();
    fetchAssignments(); // Refresh list
});

// Update status
async function updateStatus(id, newStatus) {
    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    });
    fetchAssignments();
}

// Delete assignment
async function deleteAssignment(id) {
    if(confirm("Are you sure you want to delete this assignment?")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchAssignments();
    }
}

// Search logic
document.getElementById('search').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderAssignments();
});

// Filter buttons logic
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderAssignments();
    });
});

// Run on page load
fetchAssignments();