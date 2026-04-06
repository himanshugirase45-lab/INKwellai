/* ===== INKWELL READER ===== */

let readerState = {
    bookId: null,
    book: null,
    fontSize: 18,
    lineHeight: 1.9,
    currentChapter: 0,
    isBookmarked: false,
    isLiked: false,
    commentsOpen: false,
};

const SAMPLE_CONTENT = `
<h2>Chapter 1: The Beginning</h2>
<p>The ancient forest stretched endlessly before her, its towering oaks draped in silver mist that caught the early morning light. Lyra had walked these paths a thousand times, but today felt different — charged with a quiet electricity that made the hairs on her arms stand on end.</p>
<p>She paused at the old stone bridge, its mossy surface slick with dew, and looked down at the stream below. The water ran clear and cold, carrying with it the last remnants of winter's ice. In its depths, she could see the reflection of the sky — pale blue, streaked with the first blush of dawn.</p>
<blockquote>"The forest remembers everything," her grandmother had told her once. "Every footstep, every whispered secret, every tear that has fallen on its roots. It holds them all."</blockquote>
<p>Lyra had never quite believed that. Not until now.</p>
<p>The sound came first — a low, resonant hum that seemed to rise from the earth itself. Then the light: a soft, golden glow emanating from somewhere deep within the trees, pulsing gently like a heartbeat. She took a step forward, then another, drawn by something she couldn't name.</p>
<p>The trees grew closer together as she moved deeper into the forest, their branches intertwining overhead to form a cathedral of leaves. The morning light filtered through in shafts of gold, illuminating motes of dust and pollen that drifted lazily in the still air.</p>
<p>She had been searching for three years. Three years of dead ends, false leads, and whispered rumors that dissolved like smoke when she reached for them. But this — this felt real. This felt like the beginning of something.</p>
<p>Or perhaps the end.</p>
<h2>Chapter 2: The Discovery</h2>
<p>The clearing appeared without warning, as clearings in old forests often do — a sudden opening in the canopy, a circle of sky where there had been only shadow. And in its center, half-buried in moss and wildflowers, stood a door.</p>
<p>Not a doorway. Not a frame. Just a door, standing alone in the middle of the forest, as if it had always been there and the world had simply grown up around it.</p>
<p>Lyra circled it slowly, her heart hammering against her ribs. The wood was ancient, dark with age, carved with symbols she half-recognized from her grandmother's journals. Iron hinges, green with verdigris. A handle worn smooth by countless hands.</p>
<p>She reached out and touched it.</p>
<p>The hum intensified, vibrating through her fingertips, up her arm, into her chest. The golden light pulsed brighter. And somewhere, very far away, she heard a voice — or perhaps it was many voices, speaking in perfect unison.</p>
<blockquote>"We have been waiting for you, Lyra. We have been waiting for a very long time."</blockquote>
<p>Her hand closed around the handle.</p>
<p>She turned it.</p>
<p>The door swung open.</p>
`;

const SAMPLE_COMMENTS = [
    { user: 'Alex M.', avatar: 'AM', text: 'The imagery in this chapter is absolutely breathtaking. I could picture every detail!', time: '2 hours ago', likes: 12 },
    { user: 'Sarah K.', avatar: 'SK', text: 'I stayed up until 3am reading this. The pacing is perfect and the mystery keeps building beautifully.', time: '5 hours ago', likes: 8 },
    { user: 'Tom R.', avatar: 'TR', text: 'The grandmother\'s quote gave me chills. Such a powerful piece of foreshadowing.', time: '1 day ago', likes: 15 },
    { user: 'Mia L.', avatar: 'ML', text: 'Can\'t wait for the next chapter! The door at the end — what a cliffhanger!', time: '2 days ago', likes: 6 },
];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    readerState.bookId = params.get('id');

    loadBook();
    setupScrollTracking();
    loadSavedPreferences();
    renderComments();
});

function loadBook() {
    let book = null;

    if (readerState.bookId) {
        // Try user books first
        const userBooks = JSON.parse(localStorage.getItem('userBooks') || '[]');
        book = userBooks.find(b => b.id == readerState.bookId);
        // Then sample books
        if (!book) book = (typeof SAMPLE_BOOKS !== 'undefined') ? SAMPLE_BOOKS.find(b => b.id == readerState.bookId) : null;
    }

    if (!book) {
        book = { id: 1, title: "Dragon's Oath", author: 'Elena Voss', emoji: '🐉', cover: 'cover-1', category: 'Fantasy', chapters: [] };
    }

    readerState.book = book;

    // Update UI
    document.getElementById('readerBookTitle').textContent = book.title;
    document.getElementById('readerBookAuthor').textContent = `by ${book.author}`;
    document.title = `${book.title} — Inkwell`;

    const bookEmoji = document.getElementById('bookEmojiDisplay');
    if (bookEmoji) bookEmoji.textContent = book.emoji || '📖';

    const bookFinished = document.getElementById('bookFinishedTitle');
    if (bookFinished) bookFinished.textContent = `You've finished "${book.title}"!`;

    // Render content
    const contentEl = document.getElementById('readerContent');
    if (contentEl) {
        if (book.chapters && book.chapters.length > 0) {
            contentEl.innerHTML = book.chapters.map(ch =>
                `<h2>${ch.title}</h2>${ch.content}`
            ).join('<hr style="border:none;border-top:1px solid var(--border);margin:40px 0">');
        } else {
            contentEl.innerHTML = SAMPLE_CONTENT;
        }
    }

    // Render chapter nav
    renderChapterNav(book);

    // Check liked/bookmarked state
    const liked = JSON.parse(localStorage.getItem('likedBooks') || '[]');
    readerState.isLiked = liked.includes(book.id);
    updateLikeBtn();

    // Restore reading position
    const progress = JSON.parse(localStorage.getItem('readingProgress') || '{}');
    if (progress[book.id]) {
        setTimeout(() => {
            const scrollPos = (progress[book.id] / 100) * (document.body.scrollHeight - window.innerHeight);
            window.scrollTo(0, scrollPos);
        }, 100);
    }
}

function renderChapterNav(book) {
    const nav = document.getElementById('chapterNavList');
    if (!nav) return;
    const chapters = book.chapters?.length ? book.chapters : [{ title: 'Chapter 1' }, { title: 'Chapter 2' }];
    chapters.forEach((ch, i) => {
        const item = document.createElement('div');
        item.style.cssText = 'padding:8px 12px;border-radius:8px;cursor:pointer;font-size:0.85rem;color:var(--text-secondary);transition:var(--transition);margin-bottom:4px';
        item.textContent = ch.title || `Chapter ${i + 1}`;
        item.addEventListener('mouseenter', () => item.style.background = 'var(--bg-hover)');
        item.addEventListener('mouseleave', () => item.style.background = '');
        item.addEventListener('click', () => scrollToChapter(i));
        nav.appendChild(item);
    });
}

function scrollToChapter(index) {
    const headings = document.querySelectorAll('#readerContent h2');
    if (headings[index]) headings[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== SCROLL TRACKING =====
function setupScrollTracking() {
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateProgress();
                ticking = false;
            });
            ticking = true;
        }
    });
}

function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;

    const bar = document.getElementById('readingProgress');
    if (bar) bar.style.width = `${progress}%`;

    // Update reading time left
    const wordsLeft = Math.round((1 - progress / 100) * 2000);
    const minsLeft = Math.max(0, Math.ceil(wordsLeft / 200));
    const timeEl = document.getElementById('readingTimeLeft');
    if (timeEl) timeEl.textContent = minsLeft > 0 ? `~${minsLeft} min left` : 'Almost done!';

    // Save progress
    if (readerState.book) {
        const saved = JSON.parse(localStorage.getItem('readingProgress') || '{}');
        saved[readerState.book.id] = Math.round(progress);
        localStorage.setItem('readingProgress', JSON.stringify(saved));
    }
}

// ===== FONT SIZE =====
function changeFontSize(delta) {
    readerState.fontSize = Math.max(14, Math.min(28, readerState.fontSize + delta));
    applyReaderStyles();
    document.getElementById('fontSizeDisplay').textContent = readerState.fontSize;
    localStorage.setItem('readerFontSize', readerState.fontSize);
}

function changeSpacing(delta) {
    readerState.lineHeight = Math.max(1.4, Math.min(2.5, +(readerState.lineHeight + delta).toFixed(1)));
    applyReaderStyles();
    localStorage.setItem('readerLineHeight', readerState.lineHeight);
}

function applyReaderStyles() {
    const content = document.getElementById('readerContent');
    if (content) {
        content.style.fontSize = `${readerState.fontSize}px`;
        content.style.lineHeight = readerState.lineHeight;
    }
}

function loadSavedPreferences() {
    const savedSize = localStorage.getItem('readerFontSize');
    const savedSpacing = localStorage.getItem('readerLineHeight');
    if (savedSize) { readerState.fontSize = parseInt(savedSize); document.getElementById('fontSizeDisplay').textContent = readerState.fontSize; }
    if (savedSpacing) readerState.lineHeight = parseFloat(savedSpacing);
    applyReaderStyles();
}

// ===== READER THEME =====
function setReaderTheme(theme) {
    document.body.classList.remove('reader-sepia', 'reader-paper');
    if (theme === 'sepia') document.body.classList.add('reader-sepia');
    else if (theme === 'light') { document.documentElement.setAttribute('data-theme', 'light'); }
    else { document.documentElement.setAttribute('data-theme', 'dark'); }
    localStorage.setItem('readerTheme', theme);
    if (theme === 'light' || theme === 'dark') {
        localStorage.setItem('theme', theme);
        try {
            let s = JSON.parse(localStorage.getItem('inkwellSettings') || '{}');
            s.theme = theme;
            localStorage.setItem('inkwellSettings', JSON.stringify(s));
        } catch(e) {}
    }
}

// ===== BOOKMARK =====
function toggleBookmark() {
    const btn = document.getElementById('bookmarkBtn');
    readerState.isBookmarked = !readerState.isBookmarked;
    if (btn) btn.textContent = readerState.isBookmarked ? '🔖' : '🔖';

    if (readerState.isBookmarked && readerState.book) {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        const selection = window.getSelection()?.toString().trim();
        bookmarks.push({
            bookId: readerState.book.id,
            bookTitle: readerState.book.title,
            chapter: readerState.currentChapter + 1,
            text: selection || 'Bookmarked position',
            scrollY: window.scrollY,
            date: new Date().toISOString()
        });
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        showToast('Bookmarked! 🔖', 'success');
    } else {
        showToast('Bookmark removed', 'info');
    }
}

// ===== LIKE =====
function likeBook() {
    readerState.isLiked = !readerState.isLiked;
    const liked = JSON.parse(localStorage.getItem('likedBooks') || '[]');
    if (readerState.isLiked) {
        if (!liked.includes(readerState.book?.id)) liked.push(readerState.book?.id);
        showToast('Added to your likes ❤️', 'success');
    } else {
        const idx = liked.indexOf(readerState.book?.id);
        if (idx > -1) liked.splice(idx, 1);
        showToast('Removed from likes', 'info');
    }
    localStorage.setItem('likedBooks', JSON.stringify(liked));
    updateLikeBtn();
}

function updateLikeBtn() {
    const btn = document.getElementById('likeBtn');
    const bookBtn = document.getElementById('likeBookBtn');
    if (btn) btn.textContent = readerState.isLiked ? '❤️' : '🤍';
    if (bookBtn) bookBtn.textContent = readerState.isLiked ? '❤️ Liked' : '🤍 Like';
}

// ===== SHARE =====
function shareBook() {
    if (navigator.share && readerState.book) {
        navigator.share({ title: readerState.book.title, text: `Check out "${readerState.book.title}" on Inkwell!`, url: location.href });
    } else {
        navigator.clipboard?.writeText(location.href);
        showToast('Link copied to clipboard! 📋', 'success');
    }
}

// ===== COMMENTS =====
function toggleComments() {
    const panel = document.getElementById('commentsPanel');
    if (!panel) return;
    readerState.commentsOpen = !readerState.commentsOpen;
    panel.style.transform = readerState.commentsOpen ? 'translateX(0)' : 'translateX(100%)';
}

function renderComments() {
    const list = document.getElementById('commentsListEl');
    const countEl = document.getElementById('commentCount');
    if (!list) return;

    const saved = JSON.parse(localStorage.getItem(`comments_${readerState.bookId}`) || '[]');
    const allComments = [...SAMPLE_COMMENTS, ...saved];

    if (countEl) countEl.textContent = allComments.length;
    list.innerHTML = '';

    allComments.forEach(c => {
        const item = document.createElement('div');
        item.className = 'comment-item';
        item.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <div class="avatar" style="width:32px;height:32px;font-size:0.72rem;flex-shrink:0">${c.avatar || c.user.slice(0, 2)}</div>
        <div style="flex:1">
          <div class="comment-author">${c.user}</div>
          <div class="comment-time">${c.time}</div>
        </div>
        <div style="font-size:0.78rem;color:var(--text-muted)">❤️ ${c.likes || 0}</div>
      </div>
      <div class="comment-text">${c.text}</div>`;
        list.appendChild(item);
    });
}

function addComment() {
    const input = document.getElementById('commentInput');
    if (!input || !input.value.trim()) return;
    const comment = {
        user: (typeof state !== 'undefined' && state.user?.name) || 'Anonymous',
        avatar: (typeof state !== 'undefined' && state.user?.avatar) || 'AN',
        text: input.value.trim(),
        time: 'Just now',
        likes: 0
    };
    const saved = JSON.parse(localStorage.getItem(`comments_${readerState.bookId}`) || '[]');
    saved.unshift(comment);
    localStorage.setItem(`comments_${readerState.bookId}`, JSON.stringify(saved));
    input.value = '';
    renderComments();
    showToast('Comment posted! 💬', 'success');
}
