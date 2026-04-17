/* ===== INKWELL — CORE APP ===== */

// ===== SAMPLE DATA =====
const SAMPLE_BOOKS = [
    { id: 1, title: "Dragon's Oath", author: "Elena Voss", category: "Fantasy", emoji: "🐉", cover: "cover-1", rating: 4.8, reads: "24.5K", likes: 1240, desc: "A young dragon rider must forge an unbreakable oath to save her kingdom from an ancient darkness.", published: true },
    { id: 2, title: "Stellar Drift", author: "Marcus Chen", category: "Sci-Fi", emoji: "🚀", cover: "cover-3", rating: 4.7, reads: "18.2K", likes: 980, desc: "When humanity's last colony ship drifts off course, one engineer must make an impossible choice.", published: true },
    { id: 3, title: "Midnight Rose", author: "Sofia Laurent", category: "Romance", emoji: "💕", cover: "cover-2", rating: 4.9, reads: "31.1K", likes: 2100, desc: "Two rival florists discover that love blooms in the most unexpected places.", published: true },
    { id: 4, title: "The Oracle", author: "James Blackwood", category: "Mystery", emoji: "🔮", cover: "cover-4", rating: 4.6, reads: "15.8K", likes: 760, desc: "A detective with the gift of foresight hunts a killer who always seems one step ahead.", published: true },
    { id: 5, title: "Neon Shadows", author: "Yuki Tanaka", category: "Thriller", emoji: "⚡", cover: "cover-5", rating: 4.5, reads: "12.3K", likes: 640, desc: "In a cyberpunk city, a hacker uncovers a conspiracy that reaches the highest levels of power.", published: true },
    { id: 6, title: "The Haunting", author: "Clara Nightingale", category: "Horror", emoji: "👻", cover: "cover-6", rating: 4.4, reads: "9.7K", likes: 520, desc: "A family moves into their dream home, unaware that the previous owners never truly left.", published: true },
    { id: 7, title: "Echoes of Time", author: "David Park", category: "Sci-Fi", emoji: "⏳", cover: "cover-7", rating: 4.7, reads: "20.4K", likes: 1050, desc: "A physicist discovers a way to send messages to the past, but every change has consequences.", published: true },
    { id: 8, title: "Crimson Tide", author: "Ana Reyes", category: "Fantasy", emoji: "🌊", cover: "cover-8", rating: 4.6, reads: "16.9K", likes: 890, desc: "The ocean holds ancient magic, and one girl is the only one who can hear its call.", published: true },
    { id: 9, title: "The Last Café", author: "Pierre Dubois", category: "Romance", emoji: "☕", cover: "cover-1", rating: 4.8, reads: "28.7K", likes: 1680, desc: "A Parisian café becomes the backdrop for a love story that spans three generations.", published: true },
    { id: 10, title: "Quantum Hearts", author: "Priya Sharma", category: "Sci-Fi", emoji: "💫", cover: "cover-3", rating: 4.5, reads: "11.2K", likes: 590, desc: "When quantum entanglement connects two strangers across dimensions, love defies physics.", published: true },
    { id: 11, title: "Shadow Protocol", author: "Alex Turner", category: "Thriller", emoji: "🕵️", cover: "cover-5", rating: 4.6, reads: "14.5K", likes: 720, desc: "A spy must choose between loyalty to her country and the truth that could destroy it.", published: true },
    { id: 12, title: "The Forgotten King", author: "Liam O'Brien", category: "Fantasy", emoji: "👑", cover: "cover-4", rating: 4.9, reads: "35.2K", likes: 2340, desc: "A peasant discovers he is the lost heir to a kingdom that was erased from history.", published: true },
];

const SAMPLE_USERS = [
    { id: 1, name: "Jane Doe", email: "jane@example.com", books: 3, joined: "Jan 2026", status: "active", avatar: "JD" },
    { id: 2, name: "Marcus Chen", email: "marcus@example.com", books: 5, joined: "Dec 2025", status: "active", avatar: "MC" },
    { id: 3, name: "Sofia Laurent", email: "sofia@example.com", books: 2, joined: "Feb 2026", status: "active", avatar: "SL" },
    { id: 4, name: "James Blackwood", email: "james@example.com", books: 1, joined: "Mar 2026", status: "banned", avatar: "JB" },
    { id: 5, name: "Yuki Tanaka", email: "yuki@example.com", books: 4, joined: "Nov 2025", status: "active", avatar: "YT" },
];

// ===== STATE =====
let state = {
    theme: localStorage.getItem('theme') || 'light',
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    books: JSON.parse(localStorage.getItem('userBooks') || '[]'),
    readingList: JSON.parse(localStorage.getItem('readingList') || '[]'),
    bookmarks: JSON.parse(localStorage.getItem('bookmarks') || '[]'),
    likedBooks: JSON.parse(localStorage.getItem('likedBooks') || '[]'),
};

// ===== THEME =====
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    state.theme = theme;
    localStorage.setItem('theme', theme);
    localStorage.setItem('readerTheme', theme);
    try {
        let s = JSON.parse(localStorage.getItem('inkwellSettings') || '{}');
        s.theme = theme;
        localStorage.setItem('inkwellSettings', JSON.stringify(s));
    } catch(e) {}
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = theme === 'dark' ? '🌙' : '☀️';
    const settingsBtn = document.getElementById('settingsThemeBtn');
    if (settingsBtn) settingsBtn.textContent = theme === 'dark' ? '🌙 Dark' : '☀️ Light';
}

function toggleTheme() {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
}

// ===== TOAST =====
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ===== MODAL =====
function openModal(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.add('active', 'on'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('active', 'on'); document.body.style.overflow = ''; }
}
function openM(id) { openModal(id); }
function closeM(id) { closeModal(id); }
function switchModal(from, to) { closeModal(from); setTimeout(() => openModal(to), 200); }

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('overlay')) {
        closeModal(e.target.id);
    }
});

// ===== DROPDOWN =====
function toggleDropdown(id) {
    const menu = document.getElementById(id);
    if (!menu) return;
    const isOpen = menu.classList.contains('open');
    document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
    if (!isOpen) menu.classList.add('open');
}
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
    }
});

// ===== AUTH =====
function handleLogin() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    if (!email || !password) { showToast('Please fill in all fields', 'error'); return; }
    const user = { name: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase()), email, avatar: email.slice(0, 2).toUpperCase() };
    localStorage.setItem('user', JSON.stringify(user));
    state.user = user;
    closeModal('loginModal');
    showToast(`Welcome back, ${user.name}! 👋`, 'success');
    setTimeout(() => location.href = 'dashboard.html', 1000);
}

function handleSignup() {
    const name = document.getElementById('signupName')?.value;
    const email = document.getElementById('signupEmail')?.value;
    const password = document.getElementById('signupPassword')?.value;
    if (!name || !email || !password) { showToast('Please fill in all fields', 'error'); return; }
    if (password.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
    const user = { name, email, avatar: name.slice(0, 2).toUpperCase(), bio: 'New writer on Inkwell ✨' };
    localStorage.setItem('user', JSON.stringify(user));
    state.user = user;
    closeModal('signupModal');
    showToast(`Welcome to Inkwell, ${name}! 🎉`, 'success');
    setTimeout(() => location.href = 'dashboard.html', 1000);
}

function handleLogout() {
    localStorage.removeItem('user');
    state.user = null;
    showToast('Signed out successfully', 'info');
    setTimeout(() => location.href = 'index.html', 800);
}

// ===== BOOK CARD RENDERER =====
function createBookCard(book, onclick) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.onclick = onclick || (() => openBookDetail(book));
    card.innerHTML = `
    <div class="book-cover ${book.cover || 'cover-1'}">
      <span style="font-size:3rem">${book.emoji || '📖'}</span>
      <div class="book-category">${book.category}</div>
    </div>
    <div class="book-info">
      <div class="book-title">${book.title}</div>
      <div class="book-author">by ${book.author}</div>
      <div class="book-meta">
        <div class="book-rating">⭐ ${book.rating || '4.5'}</div>
        <div class="book-reads">👁️ ${book.reads || '0'}</div>
      </div>
    </div>`;
    return card;
}

function renderBooks(containerId, count = 6, books = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const source = books || SAMPLE_BOOKS.slice(0, count);
    source.forEach(book => container.appendChild(createBookCard(book)));
}

// ===== BOOK DETAIL MODAL =====
let selectedBook = null;
function openBookDetail(book) {
    selectedBook = book;
    document.getElementById('modalBookTitle').textContent = book.title;
    document.getElementById('modalBookAuthor').textContent = book.author;
    document.getElementById('modalBookCategory').textContent = book.category;
    document.getElementById('modalBookRating').textContent = book.rating;
    document.getElementById('modalBookReads').textContent = book.reads;
    document.getElementById('modalBookLikes').textContent = book.likes;
    document.getElementById('modalBookDesc').textContent = book.desc;
    const cover = document.getElementById('modalBookCover');
    cover.className = book.cover || 'cover-1';
    cover.style.cssText = 'width:100px;height:140px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:3rem';
    cover.textContent = book.emoji;
    const readBtn = document.getElementById('readBookBtn');
    if (readBtn) readBtn.onclick = () => { location.href = `reader.html?id=${book.id}`; };
    openModal('bookDetailModal');
}

function addToReadingList() {
    if (!selectedBook) return;
    const list = JSON.parse(localStorage.getItem('readingList') || '[]');
    if (!list.find(b => b.id === selectedBook.id)) {
        list.push(selectedBook);
        localStorage.setItem('readingList', JSON.stringify(list));
        showToast('Added to reading list 📚', 'success');
    } else {
        showToast('Already in your reading list', 'info');
    }
}

// ===== HAMBURGER / MOBILE NAV =====
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(state.theme);

    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');

    if (hamburger && sidebar) {
        hamburger.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay?.classList.toggle('show');
        });
        overlay?.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        });
    }

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    // Update avatar
    if (state.user) {
        document.querySelectorAll('.avatar').forEach(el => {
            if (el.id === 'userAvatar' || !el.id) el.textContent = state.user.avatar || 'U';
        });
    }
});

// ===== LIBRARY =====
let allBooks = [...SAMPLE_BOOKS];
let filteredBooks = [...SAMPLE_BOOKS];
let displayedCount = 12;
let currentFilter = 'all';

function initLibrary() {
    renderLibrary();
}

function renderLibrary(books = null) {
    const grid = document.getElementById('libraryGrid');
    if (!grid) return;
    const source = books || filteredBooks.slice(0, displayedCount);
    grid.innerHTML = '';
    source.forEach(book => grid.appendChild(createBookCard(book)));
    const countEl = document.getElementById('bookResultCount');
    if (countEl) countEl.textContent = filteredBooks.length;
}

function filterBooks(category, el) {
    currentFilter = category;
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    filteredBooks = category === 'all' ? [...allBooks] : allBooks.filter(b => b.category === category);
    displayedCount = 12;
    renderLibrary();
}

function searchBooks(query) {
    const q = query.toLowerCase().trim();
    filteredBooks = q
        ? allBooks.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.category.toLowerCase().includes(q))
        : (currentFilter === 'all' ? [...allBooks] : allBooks.filter(b => b.category === currentFilter));
    renderLibrary();
}

function sortBooks(by) {
    const sorted = [...filteredBooks];
    if (by === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    else if (by === 'reads') sorted.sort((a, b) => parseFloat(b.reads) - parseFloat(a.reads));
    else if (by === 'newest') sorted.sort((a, b) => b.id - a.id);
    filteredBooks = sorted;
    renderLibrary();
}

function loadMoreBooks() {
    displayedCount += 6;
    renderLibrary();
    if (displayedCount >= filteredBooks.length) {
        const btn = document.getElementById('loadMoreBtn');
        if (btn) btn.style.display = 'none';
    }
}

// ===== DASHBOARD =====
function initDashboard() {
    if (!state.user) {
        window.location.href = 'index.html';
        return;
    }
    const user = state.user || { name: 'Writer', avatar: 'W' };
    const nameEl = document.getElementById('dashUsername');
    if (nameEl) nameEl.textContent = user.name.split(' ')[0];

    const profileName = document.getElementById('profileName');
    if (profileName) profileName.textContent = user.name;

    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) profileAvatar.textContent = user.avatar || user.name.slice(0, 2).toUpperCase();

    const profileBio = document.getElementById('profileBio');
    if (profileBio && user.bio) profileBio.textContent = user.bio;

    // Load user books
    const userBooks = JSON.parse(localStorage.getItem('userBooks') || '[]');
    const bookCount = document.getElementById('bookCount');
    if (bookCount) bookCount.textContent = userBooks.length;
    const statBooks = document.getElementById('statBooks');
    if (statBooks) statBooks.textContent = userBooks.filter(b => b.published).length;
    const profileBooks = document.getElementById('profileBooks');
    if (profileBooks) profileBooks.textContent = userBooks.length;

    // Render recent books
    const recentGrid = document.getElementById('recentBooksGrid');
    if (recentGrid) {
        const allUserBooks = [...userBooks, ...SAMPLE_BOOKS.slice(0, 3)];
        allUserBooks.slice(0, 6).forEach(book => recentGrid.appendChild(createBookCard(book)));
    }

    // My books grid
    renderMyBooks(userBooks);

    // Profile books
    const profileGrid = document.getElementById('profileBooksGrid');
    if (profileGrid) {
        [...userBooks, ...SAMPLE_BOOKS.slice(0, 4)].forEach(book => profileGrid.appendChild(createBookCard(book)));
    }

    // Continue reading
    renderContinueReading();

    // Drafts
    renderDrafts(userBooks);

    // Reading list
    const readingGrid = document.getElementById('readingListGrid');
    if (readingGrid) {
        const list = JSON.parse(localStorage.getItem('readingList') || '[]');
        if (list.length) list.forEach(b => readingGrid.appendChild(createBookCard(b)));
        else readingGrid.innerHTML = '<div class="empty-state"><div class="empty-icon">📚</div><h3>No books yet</h3><p>Browse the library and add books to your reading list.</p><a href="library.html" class="btn btn-primary mt-2">Browse Library</a></div>';
    }

    // Bookmarks
    renderBookmarks();

    // Analytics top books
    renderTopBooks();

    // Comments
    renderComments();
}

function renderMyBooks(books, filter = 'all') {
    const grid = document.getElementById('myBooksGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const filtered = filter === 'all' ? books : books.filter(b => filter === 'published' ? b.published : !b.published);
    if (!filtered.length) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">✍️</div><h3>No books yet</h3><p>Start writing your first book today.</p><a href="editor.html" class="btn btn-primary mt-2">Create Book</a></div>';
        return;
    }
    filtered.forEach(book => grid.appendChild(createBookCard(book)));
}

function filterMyBooks(filter, el) {
    document.querySelectorAll('#tab-mybooks .tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    const books = JSON.parse(localStorage.getItem('userBooks') || '[]');
    renderMyBooks(books, filter);
}

function renderContinueReading() {
    const el = document.getElementById('continueReading');
    if (!el) return;
    el.innerHTML = '';
    const progress = JSON.parse(localStorage.getItem('readingProgress') || '{}');
    const books = Object.keys(progress).map(id => {
        const book = SAMPLE_BOOKS.find(b => b.id == id);
        return book ? { ...book, progress: progress[id] } : null;
    }).filter(Boolean);

    if (!books.length) {
        el.innerHTML = '<p style="color:var(--text-muted);font-size:0.88rem">No books in progress. <a href="library.html" style="color:var(--accent)">Start reading →</a></p>';
        return;
    }
    books.slice(0, 3).forEach(book => {
        const item = document.createElement('div');
        item.style.cssText = 'display:flex;align-items:center;gap:16px;padding:12px 0;border-bottom:1px solid var(--border)';
        item.innerHTML = `
      <div class="${book.cover} flex-center" style="width:48px;height:64px;border-radius:8px;font-size:1.5rem;flex-shrink:0">${book.emoji}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:0.9rem">${book.title}</div>
        <div style="font-size:0.78rem;color:var(--text-muted);margin:4px 0">by ${book.author}</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${book.progress}%"></div></div>
        <div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px">${book.progress}% complete</div>
      </div>
      <a href="reader.html?id=${book.id}" class="btn btn-secondary btn-sm">Continue</a>`;
        el.appendChild(item);
    });
}

function clearContinueReading() {
    if (confirm('Are you sure you want to clear your reading progress?')) {
        localStorage.removeItem('readingProgress');
        renderContinueReading();
        showToast('Reading progress cleared', 'info');
    }
}

function renderDrafts(books) {
    const el = document.getElementById('draftsList');
    if (!el) return;
    const drafts = books.filter(b => !b.published);
    if (!drafts.length) {
        el.innerHTML = '<div class="empty-state"><div class="empty-icon">📝</div><h3>No drafts</h3><p>Your unfinished books will appear here.</p></div>';
        return;
    }
    drafts.forEach(book => {
        const item = document.createElement('div');
        item.className = 'card mb-2';
        item.style.cssText = 'display:flex;align-items:center;gap:16px;padding:16px';
        item.innerHTML = `
      <div class="${book.cover} flex-center" style="width:48px;height:64px;border-radius:8px;font-size:1.5rem;flex-shrink:0">${book.emoji}</div>
      <div style="flex:1"><div style="font-weight:600">${book.title}</div><div style="font-size:0.82rem;color:var(--text-muted)">${book.category} · Draft</div></div>
      <a href="editor.html?id=${book.id}" class="btn btn-secondary btn-sm">Edit</a>`;
        el.appendChild(item);
    });
}

function renderBookmarks() {
    const el = document.getElementById('bookmarksList');
    if (!el) return;
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    if (!bookmarks.length) {
        el.innerHTML = '<div class="empty-state"><div class="empty-icon">🔖</div><h3>No bookmarks</h3><p>Bookmark passages while reading to find them here.</p></div>';
        return;
    }
    bookmarks.forEach(bm => {
        const item = document.createElement('div');
        item.className = 'card mb-2';
        item.innerHTML = `<div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:6px">📖 ${bm.bookTitle} · Chapter ${bm.chapter}</div><p style="font-size:0.9rem;font-style:italic">"${bm.text}"</p>`;
        el.appendChild(item);
    });
}

function renderTopBooks() {
    const el = document.getElementById('topBooks');
    if (!el) return;
    SAMPLE_BOOKS.slice(0, 5).forEach((book, i) => {
        const item = document.createElement('div');
        item.style.cssText = 'display:flex;align-items:center;gap:16px;padding:12px 0;border-bottom:1px solid var(--border)';
        item.innerHTML = `
      <div style="font-size:1.2rem;font-weight:800;color:var(--text-muted);width:24px">${i + 1}</div>
      <div class="${book.cover} flex-center" style="width:40px;height:54px;border-radius:6px;font-size:1.2rem;flex-shrink:0">${book.emoji}</div>
      <div style="flex:1"><div style="font-weight:600;font-size:0.9rem">${book.title}</div><div style="font-size:0.78rem;color:var(--text-muted)">${book.reads} reads</div></div>
      <div style="font-size:0.85rem;color:var(--warning)">⭐ ${book.rating}</div>`;
        el.appendChild(item);
    });
}

function renderComments() {
    const el = document.getElementById('commentsList');
    if (!el) return;
    const comments = [
        { user: 'Alex M.', book: "Dragon's Oath", text: 'This story is absolutely incredible! The world-building is phenomenal.', time: '2 hours ago' },
        { user: 'Sarah K.', book: 'Stellar Drift', text: 'I stayed up all night reading this. Cannot wait for the next chapter!', time: '5 hours ago' },
        { user: 'Tom R.', book: 'Midnight Rose', text: 'The characters feel so real. Beautiful writing.', time: '1 day ago' },
        { user: 'Mia L.', book: 'The Oracle', text: 'The plot twist in chapter 7 blew my mind!', time: '2 days ago' },
        { user: 'Chris P.', book: "Dragon's Oath", text: 'Best fantasy I\'ve read this year. Highly recommend!', time: '3 days ago' },
    ];
    comments.forEach(c => {
        const item = document.createElement('div');
        item.className = 'card mb-2';
        item.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <div class="avatar" style="width:32px;height:32px;font-size:0.75rem">${c.user.slice(0, 2)}</div>
        <div><div style="font-weight:600;font-size:0.88rem">${c.user}</div><div style="font-size:0.75rem;color:var(--text-muted)">on "${c.book}"</div></div>
        <div style="margin-left:auto;font-size:0.75rem;color:var(--text-muted)">${c.time}</div>
      </div>
      <p style="font-size:0.88rem">${c.text}</p>`;
        el.appendChild(item);
    });
}

// ===== DASHBOARD TABS =====
function showTab(name) {
    document.querySelectorAll('[id^="tab-"]').forEach(el => el.classList.add('hidden'));
    const tab = document.getElementById(`tab-${name}`);
    if (tab) { tab.classList.remove('hidden'); tab.classList.add('fade-in'); }
    document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
    const items = document.querySelectorAll('.sidebar-item');
    items.forEach(item => { if (item.textContent.toLowerCase().includes(name.replace('-', ' '))) item.classList.add('active'); });
}

// ===== PROFILE =====
function saveProfile() {
    const name = document.getElementById('editName')?.value;
    const bio = document.getElementById('editBio')?.value;
    const avatar = document.getElementById('editAvatar')?.value;
    if (name) {
        const user = state.user || {};
        user.name = name;
        if (bio) user.bio = bio;
        if (avatar) user.avatar = avatar;
        localStorage.setItem('user', JSON.stringify(user));
        state.user = user;
        document.getElementById('profileName').textContent = name;
        if (bio) document.getElementById('profileBio').textContent = bio;
        if (avatar) document.getElementById('profileAvatar').textContent = avatar;
    }
    closeModal('editProfileModal');
    showToast('Profile updated! ✨', 'success');
}

// ===== CREATE BOOK =====
function createNewBook() {
    const title = document.getElementById('newBookTitle')?.value;
    const desc = document.getElementById('newBookDesc')?.value;
    const category = document.getElementById('newBookCategory')?.value;
    const emoji = document.getElementById('newBookEmoji')?.value || '📖';
    if (!title) { showToast('Please enter a book title', 'error'); return; }
    const covers = ['cover-1', 'cover-2', 'cover-3', 'cover-4', 'cover-5', 'cover-6', 'cover-7', 'cover-8'];
    const book = {
        id: Date.now(), title, desc, category, emoji,
        cover: covers[Math.floor(Math.random() * covers.length)],
        author: state.user?.name || 'Anonymous',
        rating: 0, reads: '0', likes: 0, published: false,
        chapters: [], createdAt: new Date().toISOString()
    };
    const books = JSON.parse(localStorage.getItem('userBooks') || '[]');
    books.push(book);
    localStorage.setItem('userBooks', JSON.stringify(books));
    closeModal('newBookModal');
    showToast('Book created! Opening editor...', 'success');
    setTimeout(() => location.href = `editor.html?id=${book.id}`, 800);
}

// ===== SPEECH ENGINE (TTS) =====
const SpeechEngine = {
    synth: window.speechSynthesis,
    utterance: null,
    isReading: false,
    keepAliveTimer: null,
    preferredVoiceURI: localStorage.getItem('inkwellVoiceURI'),
    
    getVoices() {
        return this.synth.getVoices().filter(v => v.lang.startsWith('en'));
    },

    speak(text, onEndCallback) {
        this.stop();
        if (!text || text.trim().length === 0) return;

        // Clean up text
        const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        
        this.utterance = new SpeechSynthesisUtterance(cleanText);
        
        let voices = this.synth.getVoices();
        let selectedVoice = null;

        if (this.preferredVoiceURI) {
            selectedVoice = voices.find(v => v.voiceURI === this.preferredVoiceURI);
        }

        if (!selectedVoice) {
            // Priority: Google English -> Premium English -> Any English
            selectedVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || 
                           voices.find(v => v.name.includes('Premium') && v.lang.startsWith('en')) ||
                           voices.find(v => v.lang.startsWith('en-US')) ||
                           voices.find(v => v.lang.startsWith('en'));
        }

        if (selectedVoice) {
            this.utterance.voice = selectedVoice;
        }
        
        this.utterance.rate = 1.0;
        this.utterance.pitch = 1.0;
        this.utterance.volume = 1.0;
        
        this.utterance.onstart = () => {
            this.isReading = true;
            // Chrome Bug Fix: Long speech stops after 15s. This pulse keeps it alive.
            this.keepAliveTimer = setInterval(() => {
                if (this.synth.speaking) {
                    this.synth.pause();
                    this.synth.resume();
                }
            }, 10000);
        };

        this.utterance.onend = () => {
            this.isReading = false;
            clearInterval(this.keepAliveTimer);
            if (onEndCallback) onEndCallback();
        };
        
        this.utterance.onerror = (event) => {
            console.error("Speech Error:", event);
            this.isReading = false;
            clearInterval(this.keepAliveTimer);
            if (onEndCallback) onEndCallback();
            
            if (event.error !== 'interrupted') {
                showToast("Voice narration error. Try selecting a different voice.", "error");
            }
        };

        // Standard sequence to ensure playback
        this.synth.cancel();
        setTimeout(() => {
            this.synth.speak(this.utterance);
        }, 50);
    },

    testVoice(voiceURI) {
        this.speak("This is a preview of the selected voice.");
    },

    setVoice(voiceURI) {
        this.preferredVoiceURI = voiceURI;
        localStorage.setItem('inkwellVoiceURI', voiceURI);
    },

    stop() {
        if (this.synth) {
            this.synth.cancel();
            // Also need to trigger this because cancel doesn't always fire onend
            this.isReading = false;
            clearInterval(this.keepAliveTimer);
        }
    },

    toggle(text, onEndCallback, onStartCallback) {
        if (this.isReading) {
            this.stop();
            if (onEndCallback) onEndCallback();
            return false;
        } else {
            if (onStartCallback) onStartCallback();
            this.speak(text, onEndCallback);
            return true;
        }
    }
};
