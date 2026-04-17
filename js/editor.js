/* ===== INKWELL EDITOR ===== */

let editorState = {
    bookId: null,
    book: null,
    chapters: [],
    currentChapter: 0,
    autoSaveTimer: null,
    isRecording: false,
    recognition: null,
    bible: [],
    // Sprint State
    sprintActive: false,
    sprintTimeLeft: 0,
    sprintTimer: null,
    sprintStartWords: 0
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    editorState.bookId = params.get('id');

    if (editorState.bookId) {
        loadBook(editorState.bookId);
    } else {
        // New book
        editorState.book = { title: 'Untitled Book', chapters: [], category: 'Fantasy', emoji: '📖' };
        editorState.chapters = [{ id: 1, title: 'Chapter 1', content: '' }];
        renderChapterList();
        loadChapter(0);
    }

    // Auto-save on input and trigger Zen Mode
    const content = document.getElementById('editorContent');
    const chapterTitle = document.getElementById('chapterTitle');

    // Handle text selection for floating AI menu
    document.addEventListener('selectionchange', handleInlineSelection);

    if (content) {
        content.addEventListener('input', () => {
            updateWordCount();
            scheduleAutoSave();
        });
    }
    if (chapterTitle) {
        chapterTitle.addEventListener('input', () => {
            if (editorState.chapters[editorState.currentChapter]) {
                editorState.chapters[editorState.currentChapter].title = chapterTitle.value;
                renderChapterList();
                scheduleAutoSave();
            }
        });
    }
});

function loadBook(id) {
    const books = JSON.parse(localStorage.getItem('userBooks') || '[]');
    const book = books.find(b => b.id == id);
    if (book) {
        editorState.book = book;
        editorState.chapters = book.chapters?.length ? book.chapters : [{ id: 1, title: 'Chapter 1', content: '' }];
        editorState.bible = book.bible || [];
        document.getElementById('bookTitleDisplay').textContent = book.title;
        renderChapterList();
        renderBibleList();
        loadChapter(0);
    } else {
        editorState.book = { title: 'Untitled Book', chapters: [], bible: [] };
        editorState.chapters = [{ id: 1, title: 'Chapter 1', content: '' }];
        editorState.bible = [];
        renderChapterList();
        renderBibleList();
        loadChapter(0);
    }
}

// ===== CHAPTERS =====
function renderChapterList() {
    const list = document.getElementById('chapterList');
    if (!list) return;
    list.innerHTML = '';
    editorState.chapters.forEach((ch, i) => {
        const item = document.createElement('div');
        item.className = `chapter-item${i === editorState.currentChapter ? ' active' : ''}`;
        item.draggable = true;
        item.innerHTML = `
      <span class="drag-handle">⠿</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:0.88rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ch.title || `Chapter ${i + 1}`}</div>
        <div class="chapter-num">${countWords(ch.content)} words</div>
      </div>
      <button onclick="event.stopPropagation();deleteChapter(${i})" style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:2px 4px;border-radius:4px;font-size:0.8rem" title="Delete">✕</button>`;
        item.addEventListener('click', () => loadChapter(i));
        list.appendChild(item);
    });

    // Update stats
    const totalWords = editorState.chapters.reduce((sum, ch) => sum + countWords(ch.content), 0);
    const statsEl = document.getElementById('chapterStats');
    if (statsEl) statsEl.textContent = `${editorState.chapters.length} chapters · ${totalWords.toLocaleString()} words`;
}

function loadChapter(index) {
    // Save current chapter first
    saveCurrentChapter();
    editorState.currentChapter = index;
    const ch = editorState.chapters[index];
    if (!ch) return;
    const titleEl = document.getElementById('chapterTitle');
    const contentEl = document.getElementById('editorContent');
    if (titleEl) titleEl.value = ch.title || '';
    if (contentEl) contentEl.innerHTML = ch.content || '';
    updateWordCount();
    renderChapterList();
}

function saveCurrentChapter() {
    const ch = editorState.chapters[editorState.currentChapter];
    if (!ch) return;
    const contentEl = document.getElementById('editorContent');
    const titleEl = document.getElementById('chapterTitle');
    if (contentEl) ch.content = contentEl.innerHTML;
    if (titleEl) ch.title = titleEl.value || `Chapter ${editorState.currentChapter + 1}`;
}

function addChapter() {
    openModal('addChapterModal');
    setTimeout(() => document.getElementById('newChapterTitle')?.focus(), 300);
}

function confirmAddChapter() {
    const title = document.getElementById('newChapterTitle')?.value || `Chapter ${editorState.chapters.length + 1}`;
    editorState.chapters.push({ id: Date.now(), title, content: '' });
    closeModal('addChapterModal');
    document.getElementById('newChapterTitle').value = '';
    renderChapterList();
    loadChapter(editorState.chapters.length - 1);
    showToast(`"${title}" added`, 'success');
}

function deleteChapter(index) {
    if (editorState.chapters.length === 1) { showToast('Cannot delete the only chapter', 'error'); return; }
    editorState.chapters.splice(index, 1);
    if (editorState.currentChapter >= editorState.chapters.length) editorState.currentChapter = editorState.chapters.length - 1;
    renderChapterList();
    loadChapter(editorState.currentChapter);
    showToast('Chapter deleted', 'info');
}

// ===== STORY BIBLE =====
function switchSidebarTab(tab) {
    const isChapters = tab === 'chapters';
    const chaptersEl = document.getElementById('sidebarChapters');
    const bibleEl = document.getElementById('sidebarBible');
    if(chaptersEl) chaptersEl.style.display = isChapters ? 'flex' : 'none';
    if(bibleEl) bibleEl.style.display = isChapters ? 'none' : 'flex';
    
    document.getElementById('tabBtnChapters').style.borderBottomColor = isChapters ? 'var(--accent)' : 'transparent';
    document.getElementById('tabBtnChapters').style.color = isChapters ? 'var(--text-primary)' : 'var(--text-muted)';
    
    document.getElementById('tabBtnBible').style.borderBottomColor = !isChapters ? 'var(--accent)' : 'transparent';
    document.getElementById('tabBtnBible').style.color = !isChapters ? 'var(--text-primary)' : 'var(--text-muted)';
}

function renderBibleList() {
    const list = document.getElementById('bibleList');
    if (!list) return;
    list.innerHTML = '';
    
    if (editorState.bible.length === 0) {
        list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:0.85rem">No entries yet.<br>Click + to add characters or lore.</div>';
        const statsEl = document.getElementById('bibleStats');
        if (statsEl) statsEl.textContent = '0 entries';
        return;
    }

    editorState.bible.forEach((entry, i) => {
        const item = document.createElement('div');
        item.className = 'chapter-item';
        let emoji = '👤';
        if(entry.type === 'Location') emoji = '🌍';
        else if (entry.type === 'Lore') emoji = '🔮';
        
        item.innerHTML = `
        <div style="font-size:1.2rem; margin-right:8px">${emoji}</div>
        <div style="flex:1;min-width:0">
            <div style="font-size:0.88rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${entry.name}</div>
            <div style="font-size:0.75rem;color:var(--text-muted)">${entry.type}</div>
        </div>
        <button onclick="event.stopPropagation();deleteBibleEntry(${i})" style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:2px 4px;border-radius:4px;font-size:0.8rem" title="Delete">✕</button>`;
        
        item.addEventListener('click', () => editBibleEntry(i));
        list.appendChild(item);
    });

    const statsEl = document.getElementById('bibleStats');
    if (statsEl) statsEl.textContent = `${editorState.bible.length} entries`;
}

function addBibleEntry() {
    document.getElementById('bibleModalTitle').textContent = 'Add Bible Entry';
    document.getElementById('bibleEntryIndex').value = '-1';
    document.getElementById('bibleEntryName').value = '';
    document.getElementById('bibleEntryType').value = 'Character';
    document.getElementById('bibleEntryDesc').value = '';
    openModal('addBibleModal');
}

function editBibleEntry(index) {
    const entry = editorState.bible[index];
    document.getElementById('bibleModalTitle').textContent = 'Edit Bible Entry';
    document.getElementById('bibleEntryIndex').value = index;
    document.getElementById('bibleEntryName').value = entry.name;
    document.getElementById('bibleEntryType').value = entry.type;
    document.getElementById('bibleEntryDesc').value = entry.desc;
    openModal('addBibleModal');
}

function saveBibleEntry() {
    const name = document.getElementById('bibleEntryName').value.trim();
    if (!name) { showToast('Name is required', 'error'); return; }
    const type = document.getElementById('bibleEntryType').value;
    const desc = document.getElementById('bibleEntryDesc').value.trim();
    const index = parseInt(document.getElementById('bibleEntryIndex').value);

    const entry = { name, type, desc };

    if (index >= 0) {
        editorState.bible[index] = entry;
        showToast('Entry updated', 'success');
    } else {
        editorState.bible.push(entry);
        showToast('Entry added', 'success');
    }

    renderBibleList();
    scheduleAutoSave(); // Save full book with new bible
    closeModal('addBibleModal');
}

function deleteBibleEntry(index) {
    const entry = editorState.bible[index];
    if (confirm('Delete ' + entry.name + ' from Story Bible?')) {
        editorState.bible.splice(index, 1);
        renderBibleList();
        scheduleAutoSave();
        showToast('Entry deleted', 'info');
    }
}

// ===== SPRINT TIMER LOGIC =====
function toggleSprintPanel() {
    const panel = document.getElementById('sprintPanel');
    if (!panel) return;
    if (panel.style.opacity === '1') {
        panel.style.opacity = '0';
        panel.style.pointerEvents = 'none';
        panel.style.transform = 'translateY(-10px)';
    } else {
        panel.style.opacity = '1';
        panel.style.pointerEvents = 'all';
        panel.style.transform = 'translateY(0)';
    }
}

function setSprintTime(mins) {
    document.getElementById('sprintCustomTime').value = mins;
}

function startSprint() {
    const minInput = document.getElementById('sprintCustomTime').value;
    const mins = parseInt(minInput);
    if (!mins || mins <= 0) {
        showToast('Please enter a valid time in minutes', 'error');
        return;
    }

    // Set initial state
    editorState.sprintTimeLeft = mins * 60;
    
    // Count current words in all chapters
    let totalWords = 0;
    const contentText = editorState.chapters.reduce((acc, c) => acc + ' ' + (c.content.replace(/<[^>]*>?/gm, ' ')), '').trim();
    if (contentText && contentText.length > 0) {
        totalWords = contentText.split(/\s+/).length;
    }
    editorState.sprintStartWords = totalWords;
    editorState.sprintActive = true;

    // UI Updates
    document.getElementById('sprintSetup').style.display = 'none';
    document.getElementById('sprintActive').style.display = 'block';
    document.getElementById('sprintWordDelta').textContent = '0';
    document.getElementById('sprintToggleBtn').classList.add('active'); // glowing indicator
    
    updateSprintDisplay();

    clearInterval(editorState.sprintTimer);
    editorState.sprintTimer = setInterval(() => {
        editorState.sprintTimeLeft--;
        updateSprintDisplay();
        
        if (editorState.sprintTimeLeft <= 0) {
            stopSprint(true); // completed
        }
    }, 1000);
    
    showToast(`Sprint started for ${mins} minutes. Go write!`, 'success');
    document.getElementById('editorContent')?.focus();
}

function updateSprintDisplay() {
    if (!editorState.sprintActive) return;
    const mins = Math.floor(editorState.sprintTimeLeft / 60);
    const secs = editorState.sprintTimeLeft % 60;
    const displayStr = `${mins}:${secs.toString().padStart(2, '0')}`;
    
    document.getElementById('sprintTimerDisplay').textContent = displayStr;
    const btn = document.getElementById('sprintToggleBtn');
    if (btn) btn.innerHTML = `⏱️ <span style="color:var(--accent-light)">${displayStr}</span>`;

    // Calculate current delta
    let totalWords = 0;
    const contentText = editorState.chapters.reduce((acc, c) => acc + ' ' + (c.content.replace(/<[^>]*>?/gm, ' ')), '').trim();
    if (contentText && contentText.length > 0) {
        totalWords = contentText.split(/\s+/).length;
    }
    const delta = totalWords - editorState.sprintStartWords;
    document.getElementById('sprintWordDelta').textContent = delta >= 0 ? delta : 0;
}

function stopSprint(completed = false) {
    editorState.sprintActive = false;
    clearInterval(editorState.sprintTimer);
    
    document.getElementById('sprintSetup').style.display = 'block';
    document.getElementById('sprintActive').style.display = 'none';
    
    const btn = document.getElementById('sprintToggleBtn');
    if (btn) {
        btn.innerHTML = `⏱️ Sprint`;
        btn.classList.remove('active');
    }

    if (completed) {
        showToast('Sprint complete! Awesome work!', 'success');
        // keep panel open so they can see their final word count briefly.
        // Or celebrate with confetti if we had it!
    } else {
        showToast('Sprint stopped.', 'info');
    }
}

// ===== TOOLBAR COMMANDS =====
function execCmd(cmd, value = null) {
    document.getElementById('editorContent')?.focus();
    document.execCommand(cmd, false, value);
    updateWordCount();
}

function insertHR() {
    execCmd('insertHTML', '<hr style="border:none;border-top:1px solid var(--border);margin:24px 0">');
}

function insertImage() {
    openModal('imageModal');
}

function confirmInsertImage() {
    const url = document.getElementById('imageUrl')?.value;
    const alt = document.getElementById('imageAlt')?.value || 'Image';
    if (!url) { showToast('Please enter an image URL', 'error'); return; }
    execCmd('insertHTML', `<img src="${url}" alt="${alt}" style="max-width:100%;border-radius:12px;margin:16px 0" />`);
    closeModal('imageModal');
    document.getElementById('imageUrl').value = '';
    document.getElementById('imageAlt').value = '';
}

// ===== WORD COUNT =====
function countWords(html) {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text ? text.split(' ').filter(w => w.length > 0).length : 0;
}

function updateWordCount() {
    const content = document.getElementById('editorContent');
    if (!content) return;
    const text = content.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
    const chars = text.length;
    const readTime = Math.max(1, Math.ceil(words / 200));
    const wordEl = document.getElementById('wordCount');
    const timeEl = document.getElementById('readingTime');
    const charEl = document.getElementById('charCount');
    if (wordEl) wordEl.textContent = `${words.toLocaleString()} words`;
    if (timeEl) timeEl.textContent = `${readTime} min read`;
    if (charEl) charEl.textContent = `${chars.toLocaleString()} chars`;

    if (editorState.sprintActive) {
        updateSprintDisplay();
    }
}

// ===== AUTO SAVE =====
function scheduleAutoSave() {
    clearTimeout(editorState.autoSaveTimer);
    const dot = document.getElementById('autosaveDot');
    const text = document.getElementById('autosaveText');
    if (dot) dot.style.background = 'var(--warning)';
    if (text) text.textContent = 'Saving...';
    editorState.autoSaveTimer = setTimeout(() => {
        saveBook();
        if (dot) dot.style.background = 'var(--success)';
        if (text) text.textContent = 'Auto-saved';
        document.getElementById('saveStatusBadge').textContent = 'Saved';
    }, 1500);
}

function saveBook() {
    saveCurrentChapter();
    if (!editorState.bookId) return;
    const books = JSON.parse(localStorage.getItem('userBooks') || '[]');
    const idx = books.findIndex(b => b.id == editorState.bookId);
    if (idx !== -1) {
        books[idx].chapters = editorState.chapters;
        books[idx].bible = editorState.bible;
        books[idx].updatedAt = new Date().toISOString();
        localStorage.setItem('userBooks', JSON.stringify(books));
    }
}

// ===== PUBLISH =====
function publishBook() {
    saveBook();
    if (!editorState.bookId) { showToast('Save your book first', 'error'); return; }
    const books = JSON.parse(localStorage.getItem('userBooks') || '[]');
    const idx = books.findIndex(b => b.id == editorState.bookId);
    if (idx !== -1) {
        books[idx].published = !books[idx].published;
        localStorage.setItem('userBooks', JSON.stringify(books));
        const isPublished = books[idx].published;
        showToast(isPublished ? '🚀 Book published!' : 'Book unpublished', isPublished ? 'success' : 'info');
        document.querySelector('.btn-primary[onclick="publishBook()"]').textContent = isPublished ? '📤 Unpublish' : '🚀 Publish';
    }
}

// ===== EXPORT PDF =====
function exportPDF() {
    saveCurrentChapter();
    showToast('Preparing PDF export...', 'info');
    setTimeout(() => {
        window.print();
    }, 500);
}

// ===== AI PANEL =====
function toggleAIPanel() {
    const panel = document.getElementById('aiPanel');
    if (panel) panel.classList.toggle('show');
}

function toggleSidebar() {
    const sidebar = document.getElementById('editorSidebar');
    if (sidebar) sidebar.classList.toggle('hidden');
}

const SYSTEM_PROMPT = `You are an AI Writing Assistant integrated directly into a book writing platform. 

If the user asks you to WRITE, GENERATE, or CONTINUE a story, chapter, or text:
- Write exactly what they ask for, creatively and beautifully.
- Write ONLY the story/content itself. Do not include extra conversational filler. 
- DO NOT use the edit/formatting template below.

If the user provides text to REVIEW, EDIT, or IMPROVE:
Please use the following format:

--- Corrected Version ---
[corrected text]

--- Improved Version ---
[enhanced and rewritten text]

--- Alternative Suggestions ---
1. ...
2. ...

--- Title Suggestions ---
1. ...`;

async function callGemini(text) {
    let apiKey = localStorage.getItem('geminiApiKey') || 'AIzaSyBOZ0ckUrlYyEVXTzTzs49Nk5vXPbI00-Q';

    let dynamicPrompt = SYSTEM_PROMPT;
    if (editorState.bible && editorState.bible.length > 0) {
        dynamicPrompt += '\n\n--- STORY BIBLE CONTEXT ---\n(Use these details strictly if generating or checking story content):\n';
        editorState.bible.forEach(entry => {
            dynamicPrompt += `- ${entry.name} [${entry.type}]: ${entry.desc}\n`;
        });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: { text: dynamicPrompt } },
                contents: [{ role: "user", parts: [{ text: text }] }]
            })
        });

        const data = await response.json();
        if (data.error) {
             if(data.error.code === 403 || data.error.message.includes('API key')) {
                  // If explicit user key is invalid, maybe they should know.
             }
             throw new Error(data.error.message);
        }
        return data.candidates[0].content.parts[0].text;
    } catch (e) {
        return "⚠️ Error: " + e.message + "\n\n(If your API key is invalid, refresh the page and try again.)";
    }
}

async function sendAIMessage() {
    const input = document.getElementById('aiInput');
    const messages = document.getElementById('aiMessages');
    if (!input || !messages || !input.value.trim()) return;

    const userText = input.value;
    input.value = '';

    const userMsg = document.createElement('div');
    userMsg.className = 'ai-message user';
    userMsg.textContent = userText;
    messages.appendChild(userMsg);
    messages.scrollTop = messages.scrollHeight;

    const thinking = document.createElement('div');
    thinking.className = 'ai-message assistant';
    thinking.innerHTML = '<span style="display:flex;align-items:center;opacity:0.8;"><div class="ai-thinking-orb"></div> Thinking...</span>';
    messages.appendChild(thinking);
    messages.scrollTop = messages.scrollHeight;

    const aiResponseText = await callGemini(userText);
    
    // Format the response properly (Markdown to HTML basics)
    const formattedHTML = aiResponseText
        .replace(/---(.*?)---/g, '<strong><br>---$1---</strong><br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');

    thinking.innerHTML = formattedHTML;
    
    // Create an "Insert" button in the chat
    const insertBtn = document.createElement('button');
    insertBtn.className = 'btn btn-secondary btn-sm';
    insertBtn.style.marginTop = '12px';
    insertBtn.style.width = '100%';
    insertBtn.style.justifyContent = 'center';
    insertBtn.innerHTML = '📋 Insert into Editor';
    insertBtn.onclick = () => {
        const contentEl = document.getElementById('editorContent');
        if (contentEl) {
            contentEl.focus();
            document.execCommand('insertHTML', false, '<br><br>' + formattedHTML + '<br><br>');
            updateWordCount();
            scheduleAutoSave();
            showToast('Inserted into editor!', 'success');
        }
    };
    thinking.appendChild(insertBtn);
    messages.scrollTop = messages.scrollHeight;
}

// ===== VOICE TO TEXT =====
function toggleVoice() {
    const btn = document.getElementById('voiceBtn');
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showToast('Voice recognition not supported in this browser', 'error');
        return;
    }

    if (editorState.isRecording) {
        editorState.recognition?.stop();
        editorState.isRecording = false;
        btn.classList.remove('recording');
        btn.textContent = '🎙️';
        showToast('Voice recording stopped', 'info');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    editorState.recognition = new SpeechRecognition();
    editorState.recognition.continuous = true;
    editorState.recognition.interimResults = true;
    editorState.recognition.lang = 'en-US';

    editorState.recognition.onresult = (event) => {
        const content = document.getElementById('editorContent');
        if (!content) return;
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) transcript += event.results[i][0].transcript + ' ';
        }
        if (transcript) {
            content.focus();
            document.execCommand('insertText', false, transcript);
            updateWordCount();
            scheduleAutoSave();
        }
    };

    editorState.recognition.onerror = () => {
        editorState.isRecording = false;
        btn.classList.remove('recording');
        btn.textContent = '🎙️';
        showToast('Voice recognition error', 'error');
    };

    editorState.recognition.start();
    editorState.isRecording = true;
    btn.classList.add('recording');
    btn.textContent = '⏹️';
    showToast('🎙️ Listening... Speak now', 'info');
}

// ===== TEXT TO SPEECH =====
function toggleReading() {
    const content = document.getElementById('editorContent');
    const text = content ? content.innerText : "";
    
    if (!text || text.trim().length === 0) {
        showToast("No content to read. Start writing first!", "warning");
        return;
    }

    const btnNav = document.getElementById('editorListenBtnNavbar');
    const btnTools = document.getElementById('editorListenBtnTools');

    SpeechEngine.toggle(
        text,
        () => {
            // On End
            if (btnNav) btnNav.innerHTML = '🎧 Listen';
            if (btnTools) btnTools.querySelector('.label').textContent = 'Read Aloud';
        },
        () => {
            // On Start
            if (btnNav) btnNav.innerHTML = '⏹️ Stop';
            if (btnTools) btnTools.querySelector('.label').textContent = 'Stop Reading';
            showToast('Reading your story...', 'info');
        }
    );
}

// ===== INLINE AI REWRITER =====
let currentInlineSelection = null;
let currentInlineRange = null;

function handleInlineSelection() {
    const sel = window.getSelection();
    const floatingMenu = document.getElementById('aiFloatingMenu');
    const editor = document.getElementById('editorContent');
    if (!floatingMenu || !editor) return;

    if (sel.rangeCount > 0 && !sel.isCollapsed && editor.contains(sel.anchorNode)) {
        const text = sel.toString().trim();
        if (text.length > 0) {
            const range = sel.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const editorRect = editor.parentNode.getBoundingClientRect();
            
            currentInlineSelection = text;
            currentInlineRange = range.cloneRange();

            floatingMenu.style.display = 'flex';
            floatingMenu.style.top = (rect.top - 60) + 'px';
            floatingMenu.style.left = (rect.left + rect.width/2 - floatingMenu.offsetWidth/2) + 'px';
            return;
        }
    }
    
    // Hide if no selection
    setTimeout(() => {
        const verifySel = window.getSelection();
        if (verifySel.isCollapsed) {
            floatingMenu.style.display = 'none';
        }
    }, 200);
}

async function applyInlineAI(action) {
    if (!currentInlineSelection || !currentInlineRange) return;
    
    const floatingMenu = document.getElementById('aiFloatingMenu');
    floatingMenu.innerHTML = '<span style="color:var(--text-primary);font-size:0.8rem;padding:4px;display:flex;align-items:center"><div class="ai-thinking-orb" style="width:10px;height:10px;margin-right:6px"></div> Generating...</span>';

    const promptMap = {
        '✨ Improve': 'Rewrite the following text to make it sound professional, fluent, and highly polished for a book. Keep exactly the same meaning. Output purely the rewritten text, nothing else.',
        '🎭 Change Tone': 'Rewrite the following text to make it sound far more emotional, cinematic, and descriptive. Output purely the rewritten text, nothing else.',
        '✂️ Shorten': 'Condense and shorten the following text to only the most impactful core points, making it punchy and removing filler. Output purely the rewritten text, nothing else.',
        '📝 Expand': 'Dramatically expand on the following text, adding vivid sensory details, context, and making it longer and more fleshed out. Output purely the rewritten text, nothing else.'
    };

    const apiKey = localStorage.getItem('geminiApiKey') || 'AIzaSyBOZ0ckUrlYyEVXTzTzs49Nk5vXPbI00-Q';
    const systemPrompt = promptMap[action] || promptMap['✨ Improve'];
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: { text: systemPrompt } },
                contents: [{ role: "user", parts: [{ text: currentInlineSelection }] }]
            })
        });

        const data = await response.json();
        
        // Restore menu html structure
        floatingMenu.innerHTML = `
            <button class="btn btn-secondary btn-sm" onclick="applyInlineAI('✨ Improve')" style="padding:4px 8px;font-size:0.75rem;border:none;background:transparent;">✨ Improve</button>
            <button class="btn btn-secondary btn-sm" onclick="applyInlineAI('🎭 Change Tone')" style="padding:4px 8px;font-size:0.75rem;border:none;background:transparent;">🎭 Change Tone</button>
            <button class="btn btn-secondary btn-sm" onclick="applyInlineAI('✂️ Shorten')" style="padding:4px 8px;font-size:0.75rem;border:none;background:transparent;">✂️ Shorten</button>
            <button class="btn btn-secondary btn-sm" onclick="applyInlineAI('📝 Expand')" style="padding:4px 8px;font-size:0.75rem;border:none;background:transparent;">📝 Expand</button>
        `;
        floatingMenu.style.display = 'none';

        if (data.error) throw new Error(data.error.message);
        
        let newText = data.candidates[0].content.parts[0].text.trim().replace(/^"|"$/g, '');
        if (newText.startsWith('---')) {
            // In case it still hallucinates formatting
            newText = newText.replace(/---(.*?)---/g, '').trim(); 
        }
        
        // Replace in DOM using Range
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(currentInlineRange);
        document.execCommand('insertText', false, newText);
        
        showToast('Text updated by AI', 'success');
        updateWordCount();
        scheduleAutoSave();

    } catch (err) {
        showToast('AI Error: ' + err.message, 'error');
        floatingMenu.style.display = 'none';
        floatingMenu.innerHTML = `
            <button class="btn btn-secondary btn-sm" onclick="applyInlineAI('✨ Improve')" style="padding:4px 8px;font-size:0.75rem;border:none;background:transparent;">✨ Improve</button>
            <button class="btn btn-secondary btn-sm" onclick="applyInlineAI('🎭 Change Tone')" style="padding:4px 8px;font-size:0.75rem;border:none;background:transparent;">🎭 Change Tone</button>
            <button class="btn btn-secondary btn-sm" onclick="applyInlineAI('✂️ Shorten')" style="padding:4px 8px;font-size:0.75rem;border:none;background:transparent;">✂️ Shorten</button>
            <button class="btn btn-secondary btn-sm" onclick="applyInlineAI('📝 Expand')" style="padding:4px 8px;font-size:0.75rem;border:none;background:transparent;">📝 Expand</button>
        `;
    }
}

// ===== FIND & REPLACE =====
function openFindReplace() {
    openModal('findReplaceModal');
    setTimeout(() => document.getElementById('findInput').focus(), 100);
}

function findNextText() {
    const term = document.getElementById('findInput').value;
    if (!term) return;
    const content = document.getElementById('editorContent');
    content.focus();
    
    // Natively supported across most browsers
    const found = window.find(term, false, false, true, false, false, false);
    if (!found) {
        showToast('No more instances found.', 'info');
    }
}

function replaceText() {
    const findTerm = document.getElementById('findInput').value;
    const replaceTerm = document.getElementById('replaceInput').value;
    if (!findTerm) return;
    
    const sel = window.getSelection();
    if(sel.rangeCount > 0 && sel.toString().toLowerCase() === findTerm.toLowerCase()){
        document.execCommand('insertText', false, replaceTerm);
        scheduleAutoSave();
    }
    findNextText();
}

function replaceAllText() {
    const findTerm = document.getElementById('findInput').value;
    const replaceTerm = document.getElementById('replaceInput').value;
    if (!findTerm) return;
    
    let count = 0;
    const content = document.getElementById('editorContent');
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null, false);
    
    let node;
    const regex = new RegExp(findTerm.replace(/[.*+?^$\{()|[\]\\\\]/g, '\\\\$&'), 'gi');
    const nodesToReplace = [];
    
    while (node = walker.nextNode()) {
        if (node.nodeValue.match(regex)) nodesToReplace.push(node);
    }
    
    nodesToReplace.forEach(n => {
        const matches = n.nodeValue.match(regex);
        if (matches) {
            count += matches.length;
            n.nodeValue = n.nodeValue.replace(regex, replaceTerm);
        }
    });
    
    if (count > 0) {
        showToast(`Replaced ${count} occurrences`, 'success');
        scheduleAutoSave();
        closeModal('findReplaceModal');
    } else {
        showToast('No occurrences found', 'info');
    }
}

/* ── NARRATOR VOICE SETTINGS ── */
function initVoiceSettings() {
    const select = document.getElementById('editorVoiceSelect');
    if (!select) return;

    const populateVoices = () => {
        const voices = SpeechEngine.getVoices();
        if (voices.length === 0) return;

        select.innerHTML = '<option value="">Default System Voice</option>';
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.voiceURI;
            // Theme-safe colors for dropdown options
            option.style.background = 'var(--bg-secondary)';
            option.style.color = 'var(--text-primary)';
            
            // Identify gender hints in name if possible
            let genderHint = '';
            if (voice.name.toLowerCase().includes('male')) genderHint = ' 👨';
            else if (voice.name.toLowerCase().includes('female')) genderHint = ' 👩';
            
            option.textContent = `${voice.name}${genderHint}`;
            if (voice.voiceURI === SpeechEngine.preferredVoiceURI) option.selected = true;
            select.appendChild(option);
        });
    };

    populateVoices();
    if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = populateVoices;
    }
}

function setNarratorVoice(uri) {
    SpeechEngine.setVoice(uri);
    showToast('Voice updated!', 'success');
}

function previewSelectedVoice() {
    const select = document.getElementById('editorVoiceSelect');
    if (select && select.value) {
        SpeechEngine.testVoice(select.value);
    } else {
        SpeechEngine.speak("This is the default system narrator.");
    }
}

// Call init on load
document.addEventListener('DOMContentLoaded', initVoiceSettings);
