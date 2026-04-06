/* ===== INKWELL ADMIN PANEL ===== */

let adminState = {
    users: [...SAMPLE_USERS],
    books: [...SAMPLE_BOOKS],
    filteredUsers: [...SAMPLE_USERS],
    filteredBooks: [...SAMPLE_BOOKS],
};

document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
});

function initAdmin() {
    // Update counts
    document.getElementById('adminTotalUsers').textContent = adminState.users.length;
    document.getElementById('adminTotalBooks').textContent = adminState.books.length;
    document.getElementById('userCountBadge').textContent = adminState.users.length;
    document.getElementById('bookCountBadge').textContent = adminState.books.length;

    renderUsersTable(adminState.users);
    renderBooksTable(adminState.books);
    renderRecentActivity();
    renderReports();
}

// ===== TABS =====
function showAdminTab(name) {
    document.querySelectorAll('[id^="admin-tab-"]').forEach(el => el.classList.add('hidden'));
    const tab = document.getElementById(`admin-tab-${name}`);
    if (tab) { tab.classList.remove('hidden'); tab.classList.add('fade-in'); }
    document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sidebar-item').forEach(item => {
        if (item.textContent.toLowerCase().includes(name)) item.classList.add('active');
    });
}

// ===== USERS TABLE =====
function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="avatar" style="width:32px;height:32px;font-size:0.75rem;flex-shrink:0">${user.avatar}</div>
          <span style="font-weight:600">${user.name}</span>
        </div>
      </td>
      <td style="color:var(--text-muted)">${user.email}</td>
      <td>${user.books}</td>
      <td style="color:var(--text-muted)">${user.joined}</td>
      <td><span class="status-badge status-${user.status}">${user.status}</span></td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm btn-secondary" onclick="viewUser(${user.id})">View</button>
          <button class="btn btn-sm ${user.status === 'banned' ? 'btn-secondary' : 'btn-danger'}" onclick="toggleBanUser(${user.id})">
            ${user.status === 'banned' ? 'Unban' : 'Ban'}
          </button>
        </div>
      </td>`;
        tbody.appendChild(tr);
    });
}

function searchUsers(query) {
    const q = query.toLowerCase();
    adminState.filteredUsers = q
        ? adminState.users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
        : [...adminState.users];
    renderUsersTable(adminState.filteredUsers);
}

function viewUser(id) {
    const user = adminState.users.find(u => u.id === id);
    if (user) showToast(`Viewing profile: ${user.name}`, 'info');
}

function toggleBanUser(id) {
    const user = adminState.users.find(u => u.id === id);
    if (!user) return;
    const action = user.status === 'banned' ? 'unban' : 'ban';
    document.getElementById('confirmTitle').textContent = `${action.charAt(0).toUpperCase() + action.slice(1)} User`;
    document.getElementById('confirmMessage').textContent = `Are you sure you want to ${action} ${user.name}?`;
    document.getElementById('confirmBtn').onclick = () => {
        user.status = user.status === 'banned' ? 'active' : 'banned';
        renderUsersTable(adminState.filteredUsers);
        closeModal('confirmModal');
        showToast(`User ${action}ned successfully`, user.status === 'active' ? 'success' : 'warning');
    };
    openModal('confirmModal');
}

// ===== BOOKS TABLE =====
function renderBooksTable(books) {
    const tbody = document.getElementById('booksTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    books.forEach(book => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="${book.cover} flex-center" style="width:36px;height:48px;border-radius:6px;font-size:1.1rem;flex-shrink:0">${book.emoji}</div>
          <span style="font-weight:600">${book.title}</span>
        </div>
      </td>
      <td style="color:var(--text-muted)">${book.author}</td>
      <td><span class="badge">${book.category}</span></td>
      <td>${book.reads}</td>
      <td><span class="status-badge ${book.published !== false ? 'status-active' : 'status-pending'}">${book.published !== false ? 'Published' : 'Draft'}</span></td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm btn-secondary" onclick="location.href='reader.html?id=${book.id}'">View</button>
          <button class="btn btn-sm btn-danger" onclick="removeBook(${book.id})">Remove</button>
        </div>
      </td>`;
        tbody.appendChild(tr);
    });
}

function searchAdminBooks(query) {
    const q = query.toLowerCase();
    adminState.filteredBooks = q
        ? adminState.books.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
        : [...adminState.books];
    renderBooksTable(adminState.filteredBooks);
}

function removeBook(id) {
    const book = adminState.books.find(b => b.id === id);
    if (!book) return;
    document.getElementById('confirmTitle').textContent = 'Remove Book';
    document.getElementById('confirmMessage').textContent = `Are you sure you want to remove "${book.title}"? This action cannot be undone.`;
    document.getElementById('confirmBtn').onclick = () => {
        adminState.books = adminState.books.filter(b => b.id !== id);
        adminState.filteredBooks = adminState.filteredBooks.filter(b => b.id !== id);
        renderBooksTable(adminState.filteredBooks);
        document.getElementById('adminTotalBooks').textContent = adminState.books.length;
        document.getElementById('bookCountBadge').textContent = adminState.books.length;
        closeModal('confirmModal');
        showToast('Book removed', 'success');
    };
    openModal('confirmModal');
}

// ===== RECENT ACTIVITY =====
function renderRecentActivity() {
    const el = document.getElementById('recentActivity');
    if (!el) return;
    const activities = [
        { icon: '👤', text: 'New user registered: <strong>Priya Sharma</strong>', time: '2 min ago', type: 'user' },
        { icon: '📚', text: 'New book published: <strong>"Quantum Hearts"</strong> by Priya Sharma', time: '15 min ago', type: 'book' },
        { icon: '🚨', text: 'Content report filed for <strong>"Shadow Protocol"</strong>', time: '1 hour ago', type: 'report' },
        { icon: '👤', text: 'New user registered: <strong>Liam O\'Brien</strong>', time: '2 hours ago', type: 'user' },
        { icon: '📚', text: 'Book unpublished: <strong>"The Forgotten King"</strong>', time: '3 hours ago', type: 'book' },
        { icon: '💬', text: 'New comment flagged for review', time: '4 hours ago', type: 'report' },
    ];
    activities.forEach(a => {
        const item = document.createElement('div');
        item.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)';
        item.innerHTML = `
      <div style="width:36px;height:36px;border-radius:10px;background:var(--bg-hover);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0">${a.icon}</div>
      <div style="flex:1;font-size:0.88rem">${a.text}</div>
      <div style="font-size:0.75rem;color:var(--text-muted);white-space:nowrap">${a.time}</div>`;
        el.appendChild(item);
    });
}

// ===== REPORTS =====
function renderReports() {
    const el = document.getElementById('reportsList');
    if (!el) return;
    const reports = [
        { id: 1, type: 'Book', target: '"Shadow Protocol"', reason: 'Inappropriate content', reporter: 'User #1042', status: 'pending' },
        { id: 2, type: 'Comment', target: 'Comment on "Dragon\'s Oath"', reason: 'Spam', reporter: 'User #2891', status: 'pending' },
        { id: 3, type: 'User', target: 'User: james@example.com', reason: 'Harassment', reporter: 'User #3344', status: 'pending' },
    ];
    reports.forEach(r => {
        const card = document.createElement('div');
        card.className = 'card mb-2';
        card.innerHTML = `
      <div class="flex-between mb-2">
        <div style="display:flex;align-items:center;gap:10px">
          <span class="badge">${r.type}</span>
          <span style="font-weight:600">${r.target}</span>
        </div>
        <span class="status-badge status-pending">${r.status}</span>
      </div>
      <p style="font-size:0.88rem;margin-bottom:12px"><strong>Reason:</strong> ${r.reason} · <span style="color:var(--text-muted)">Reported by ${r.reporter}</span></p>
      <div style="display:flex;gap:8px">
        <button class="btn btn-sm btn-danger" onclick="resolveReport(${r.id},'remove')">Remove Content</button>
        <button class="btn btn-sm btn-secondary" onclick="resolveReport(${r.id},'dismiss')">Dismiss</button>
        <button class="btn btn-sm btn-secondary" onclick="resolveReport(${r.id},'warn')">Warn User</button>
      </div>`;
        el.appendChild(card);
    });
}

function resolveReport(id, action) {
    showToast(`Report ${id} resolved: ${action}`, 'success');
}

// ===== ADMIN AUTHENTICATION =====
function checkAdminPassword() {
    const input = document.getElementById('adminPasswordInput');
    const errorMsg = document.getElementById('adminLoginError');
    const overlay = document.getElementById('adminLoginOverlay');

    if (input.value === 'admin123' || input.value === 'admine') {
        // Correct Password
        document.body.style.overflow = 'auto'; // Re-enable scrolling if previously blocked
        overlay.classList.remove('active');
        overlay.style.display = 'none';
        showToast('Admin access granted', 'success');
        
        // Optional: Save to sessionStorage so they don't have to login on refresh
        sessionStorage.setItem('isAdminAuth', 'true');
    } else {
        // Incorrect Password
        errorMsg.style.display = 'block';
        input.value = '';
        input.focus();
    }
}

// Auto-bypass if already authenticated in this session
document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('isAdminAuth') === 'true') {
        const overlay = document.getElementById('adminLoginOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            overlay.style.display = 'none';
        }
    } else {
        // Block scrolling while overlay is active
        document.body.style.overflow = 'hidden';
    }
});
