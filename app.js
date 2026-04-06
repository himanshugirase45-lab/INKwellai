/* ── DATA ── */
        const COVERS = { g1: 'linear-gradient(135deg,#667eea,#764ba2)', g2: 'linear-gradient(135deg,#f093fb,#f5576c)', g3: 'linear-gradient(135deg,#4facfe,#00f2fe)', g4: 'linear-gradient(135deg,#43e97b,#38f9d7)', g5: 'linear-gradient(135deg,#fa709a,#fee140)', g6: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', g7: 'linear-gradient(135deg,#ffecd2,#fcb69f)', g8: 'linear-gradient(135deg,#ff9a9e,#fecfef)' };
        const BOOKS = [
            { id: 1, title: "Dragon's Oath", author: "Elena Voss", cat: "Fantasy", emoji: "🐉", cover: "g1", rating: 4.8, reads: "24.5K", likes: 1240, desc: "A young dragon rider must forge an unbreakable oath to save her kingdom from an ancient darkness.", big: true },
            { id: 2, title: "Stellar Drift", author: "Marcus Chen", cat: "Sci-Fi", emoji: "🚀", cover: "g3", rating: 4.7, reads: "18.2K", likes: 980, desc: "When humanity's last colony ship drifts off course, one engineer must make an impossible choice." },
            { id: 3, title: "Midnight Rose", author: "Sofia Laurent", cat: "Romance", emoji: "💕", cover: "g2", rating: 4.9, reads: "31.1K", likes: 2100, desc: "Two rival florists discover that love blooms in the most unexpected places." },
            { id: 4, title: "The Oracle", author: "James Blackwood", cat: "Mystery", emoji: "🔮", cover: "g4", rating: 4.6, reads: "15.8K", likes: 760, desc: "A detective with the gift of foresight hunts a killer who always seems one step ahead." },
            { id: 5, title: "Neon Shadows", author: "Yuki Tanaka", cat: "Thriller", emoji: "⚡", cover: "g5", rating: 4.5, reads: "12.3K", likes: 640, desc: "In a cyberpunk city, a hacker uncovers a conspiracy that reaches the highest levels of power." },
            { id: 6, title: "The Haunting", author: "Clara Nightingale", cat: "Horror", emoji: "👻", cover: "g6", rating: 4.4, reads: "9.7K", likes: 520, desc: "A family moves into their dream home, unaware that the previous owners never truly left." },
            { id: 7, title: "Echoes of Time", author: "David Park", cat: "Sci-Fi", emoji: "⏳", cover: "g7", rating: 4.7, reads: "20.4K", likes: 1050, desc: "A physicist discovers a way to send messages to the past, but every change has consequences." },
            { id: 8, title: "Crimson Tide", author: "Ana Reyes", cat: "Fantasy", emoji: "🌊", cover: "g8", rating: 4.6, reads: "16.9K", likes: 890, desc: "The ocean holds ancient magic, and one girl is the only one who can hear its call." },
            { id: 9, title: "The Last Café", author: "Pierre Dubois", cat: "Romance", emoji: "☕", cover: "g1", rating: 4.8, reads: "28.7K", likes: 1680, desc: "A Parisian café becomes the backdrop for a love story that spans three generations." },
        ];

        /* ── RENDER BOOKS ── */
        function renderBooks() {
            const g = document.getElementById('booksGrid');
            if (!g) return;
            BOOKS.forEach((b, i) => {
                const d = document.createElement('div');
                d.className = 'bk' + (b.big ? ' big' : '');
                d.onclick = () => openDetail(b);
                d.innerHTML = `
      ${i === 0 ? '<div class="bk-hot">🔥 #1</div>' : ''}
      <div class="bk-cover" style="background:${COVERS[b.cover]}">
        <span>${b.emoji}</span>
        <div class="bk-shade"></div>
      </div>
      <div class="bk-body">
        <div class="bk-cat">${b.cat}</div>
        <div class="bk-title">${b.title}</div>
        <div class="bk-author">by ${b.author}</div>
        <div class="bk-meta">
          <span class="bk-star">⭐ ${b.rating}</span>
          <span>👁 ${b.reads}</span>
          <span>❤️ ${b.likes.toLocaleString()}</span>
        </div>
      </div>`;
                g.appendChild(d);
            });
        }

        /* ── DETAIL MODAL ── */
        function openDetail(b) {
            document.getElementById('dTitle').textContent = b.title;
            document.getElementById('dAuthor').textContent = 'by ' + b.author;
            document.getElementById('dCat').textContent = b.cat;
            document.getElementById('dRating').textContent = '⭐ ' + b.rating;
            document.getElementById('dReads').textContent = '👁 ' + b.reads;
            document.getElementById('dLikes').textContent = '❤️ ' + b.likes.toLocaleString();
            document.getElementById('dDesc').textContent = b.desc;
            const c = document.getElementById('dCover');
            c.style.background = COVERS[b.cover]; c.textContent = b.emoji;
            document.getElementById('dReadBtn').onclick = () => location.href = 'reader.html?id=' + b.id;
            openM('detailM');
        }

        /* ── MODAL ── */
        function openM(id) { const e = document.getElementById(id); if (e) { e.classList.add('on'); document.body.style.overflow = 'hidden' } }
        function closeM(id) { const e = document.getElementById(id); if (e) { e.classList.remove('on'); document.body.style.overflow = '' } }
        function swapM(a, b) { closeM(a); setTimeout(() => openM(b), 220) }
        document.addEventListener('click', e => { if (e.target.classList.contains('overlay')) { e.target.classList.remove('on'); document.body.style.overflow = '' } });

        /* ── TOAST ── */
        function toast(msg, type = 'info') {
            const c = document.getElementById('toasts'); if (!c) return;
            const icons = { success: '✅', error: '❌', info: 'ℹ️' };
            const t = document.createElement('div');
            t.className = 'toast ' + type;
            t.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
            c.appendChild(t);
            setTimeout(() => { t.style.animation = 'tin .3s ease reverse'; setTimeout(() => t.remove(), 300) }, 3000);
        }

        /* ── AUTH ── */
        function doLogin() {
            const e = document.getElementById('lEmail')?.value;
            const p = document.getElementById('lPass')?.value;
            if (!e || !p) { toast('Please fill in all fields', 'error'); return }
            const u = { name: e.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase()), email: e, avatar: e.slice(0, 2).toUpperCase() };
            localStorage.setItem('user', JSON.stringify(u));
            closeM('loginM'); toast('Welcome back, ' + u.name + '! 👋', 'success');
            setTimeout(() => location.href = 'dashboard.html', 900);
        }
        function doSignup() {
            const n = document.getElementById('sName')?.value;
            const e = document.getElementById('sEmail')?.value;
            const p = document.getElementById('sPass')?.value;
            if (!n || !e || !p) { toast('Please fill in all fields', 'error'); return }
            if (p.length < 8) { toast('Password must be at least 8 characters', 'error'); return }
            const u = { name: n, email: e, avatar: n.slice(0, 2).toUpperCase(), bio: 'New writer on Inkwell ✨' };
            localStorage.setItem('user', JSON.stringify(u));
            closeM('signupM'); toast('Welcome to Inkwell, ' + n + '! 🎉', 'success');
            setTimeout(() => location.href = 'dashboard.html', 900);
        }

        /* ── GOOGLE LOGIN ── */
        function doGoogleLogin() {
            // Using Firebase Auth via the globally initialized googleProvider
            if (typeof auth === 'undefined' || typeof googleProvider === 'undefined') {
                toast('Firebase Auth is still initializing. Please wait...', 'info');
                return;
            }
            
            auth.signInWithPopup(googleProvider)
                .then((result) => {
                    const user = result.user;
                    const u = {
                        name: user.displayName || user.email.split('@')[0],
                        email: user.email,
                        avatar: (user.displayName || user.email).slice(0, 2).toUpperCase(),
                        photo: user.photoURL,
                        bio: 'Writer on Inkwell ✨'
                    };
                    localStorage.setItem('user', JSON.stringify(u));
                    toast('Welcome back, ' + u.name + '! 👋', 'success');
                    setTimeout(() => location.href = 'dashboard.html', 900);
                })
                .catch((error) => {
                    console.error('Google Sign-In Error:', error);
                    toast('Google Sign-In failed: ' + error.message, 'error');
                });
        }

        /* ── NAVBAR SCROLL ── */
        window.addEventListener('scroll', () => {
            document.getElementById('nav')?.classList.toggle('stuck', window.scrollY > 50);
        });

        /* ── INIT ── */
        document.addEventListener('DOMContentLoaded', renderBooks);

        /* ══════════════════════════════
           SETTINGS
        ══════════════════════════════ */
        const SETTINGS_KEY = 'inkwellSettings';
        const defaults = { theme: 'light', accent: 'violet', accentPrimary: '#7c6af7', accentSecondary: '#a78bfa', font: 'medium', animations: true, compact: false, focus: false, language: 'en' };

        function loadSettings() {
            return Object.assign({}, defaults, JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'));
        }
        function saveSettings(s) {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
        }
        function applySettings(s) {
            // Theme
            const themes = {
                dark: { '--bg': '#0a0a0f', '--bg2': '#111118', '--bg3': '#18181f', '--bg4': '#222230', '--text': '#e8e4f0', '--text2': '#8888a8', '--text3': '#4a4a62', '--border': 'rgba(255,255,255,0.08)', '--border2': 'rgba(255,255,255,0.14)', '--heading': '#ffffff', '--card-bg': '#18181f', '--nav-bg': 'rgba(10,10,15,0.95)', '--promo-bg': '#0a0a0f', '--feat-bg': '#18181f', '--sp-bg': '#13131c' },
                light: { '--bg': '#f4f4f8', '--bg2': '#ffffff', '--bg3': '#ffffff', '--bg4': '#eaeaf2', '--text': '#1a1a2e', '--text2': '#4a4a6a', '--text3': '#8888a8', '--border': 'rgba(0,0,0,0.09)', '--border2': 'rgba(0,0,0,0.15)', '--heading': '#0f0f1e', '--card-bg': '#ffffff', '--nav-bg': 'rgba(244,244,248,0.95)', '--promo-bg': '#f4f4f8', '--feat-bg': '#ffffff', '--sp-bg': '#f0f0f8' },
                dim: { '--bg': '#1a1a2e', '--bg2': '#1e1e35', '--bg3': '#252540', '--bg4': '#2d2d50', '--text': '#d8d4f0', '--text2': '#7878a0', '--text3': '#4a4a6a', '--border': 'rgba(255,255,255,0.07)', '--border2': 'rgba(255,255,255,0.12)', '--heading': '#f0ecff', '--card-bg': '#252540', '--nav-bg': 'rgba(26,26,46,0.95)', '--promo-bg': '#1a1a2e', '--feat-bg': '#252540', '--sp-bg': '#1e1e35' },
            };
            const t = themes[s.theme] || themes.dark;
            Object.entries(t).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));

            // Set data-theme for CSS overrides
            document.documentElement.setAttribute('data-theme', s.theme);
            document.body.style.background = t['--bg'];
            document.body.style.color = t['--text'];

            // Accent
            document.documentElement.style.setProperty('--violet', s.accentPrimary);
            document.documentElement.style.setProperty('--violet2', s.accentSecondary);

            // Font size
            const sizes = { small: '15px', medium: '16px', large: '18px' };
            document.documentElement.style.fontSize = sizes[s.font] || '16px';

            // Animations
            document.documentElement.style.setProperty('--trans', s.animations ? 'all .3s cubic-bezier(.4,0,.2,1)' : 'none');

            // Compact
            document.documentElement.style.setProperty('--sec-pad', s.compact ? '60px' : '96px');
            document.querySelectorAll('.sec,.cta-wrap').forEach(el => {
                el.style.paddingTop = s.compact ? '60px' : '';
                el.style.paddingBottom = s.compact ? '60px' : '';
            });
        }

        function syncUI(s) {
            // Theme buttons
            ['Dark', 'Light', 'Dim'].forEach(t => {
                const el = document.getElementById('themeOpt' + t);
                if (el) el.classList.toggle('active', s.theme === t.toLowerCase());
            });
            // Accent buttons
            ['Violet', 'Gold', 'Rose', 'Cyan', 'Green', 'Orange'].forEach(a => {
                const el = document.getElementById('accent' + a);
                if (el) el.classList.toggle('active', s.accent === a.toLowerCase());
            });
            // Font buttons
            ['Small', 'Medium', 'Large'].forEach(f => {
                const el = document.getElementById('font' + f);
                if (el) el.classList.toggle('active', s.font === f.toLowerCase());
            });
            // Toggles
            const anim = document.getElementById('animToggle');
            const compact = document.getElementById('compactToggle');
            const focus = document.getElementById('focusToggle');
            if (anim) anim.checked = s.animations;
            if (compact) compact.checked = s.compact;
            if (focus) focus.checked = s.focus;
        }

        function toggleSettings() {
            const panel = document.getElementById('settingsPanel');
            const backdrop = document.getElementById('settingsBackdrop');
            const btn = document.getElementById('settingsBtn');
            const isOpen = panel.classList.contains('on');
            panel.classList.toggle('on', !isOpen);
            backdrop.classList.toggle('on', !isOpen);
            btn.classList.toggle('open', !isOpen);
            document.body.style.overflow = isOpen ? '' : 'hidden';
        }
        function closeSettings() {
            document.getElementById('settingsPanel')?.classList.remove('on');
            document.getElementById('settingsBackdrop')?.classList.remove('on');
            document.getElementById('settingsBtn')?.classList.remove('open');
            document.body.style.overflow = '';
        }

        function setTheme(t) {
            const s = loadSettings(); s.theme = t; saveSettings(s); applySettings(s); syncUI(s);
            localStorage.setItem('theme', t); localStorage.setItem('readerTheme', t);
            toast('Theme changed to ' + t, 'info');
        }
        function setAccent(name, primary, secondary) {
            const s = loadSettings(); s.accent = name; s.accentPrimary = primary; s.accentSecondary = secondary;
            saveSettings(s); applySettings(s); syncUI(s);
            toast('Accent color updated', 'info');
        }
        function setFont(size) {
            const s = loadSettings(); s.font = size; saveSettings(s); applySettings(s); syncUI(s);
        }
        function toggleAnimations(val) {
            const s = loadSettings(); s.animations = val; saveSettings(s); applySettings(s);
        }
        function toggleCompact(val) {
            const s = loadSettings(); s.compact = val; saveSettings(s); applySettings(s);
        }
        function toggleFocus(val) {
            const s = loadSettings(); s.focus = val; saveSettings(s);
            document.querySelectorAll('.marquee-wrap,.promo,.testi-grid,.events-layout,.cta-wrap').forEach(el => {
                el.style.display = val ? 'none' : '';
            });
        }
        function setLanguage(lang) {
            const s = loadSettings(); s.language = lang; saveSettings(s);
            toast('Language preference saved', 'info');
        }
        function resetSettings() {
            saveSettings(defaults);
            applySettings(defaults);
            syncUI(defaults);
            toast('Settings reset to defaults', 'success');
        }

        // Init settings on load
        document.addEventListener('DOMContentLoaded', () => {
            const s = loadSettings();
            applySettings(s);
            syncUI(s);
        });