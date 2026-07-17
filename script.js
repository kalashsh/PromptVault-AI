/**
 * script.js
 * PromptVault AI — all application logic.
 * Organized into small modules (State, Storage, Render, Events) inside one
 * IIFE to avoid polluting the global scope while staying plain ES6.
 */

(function () {
  'use strict';

  /* ============================================================
     STORAGE KEYS
     ============================================================ */
  const LS_KEYS = {
    PROMPTS: 'pv_prompts',
    THEME: 'pv_theme',
    RECENT: 'pv_recent'
  };

  /* ============================================================
     STATE
     ============================================================ */
  const state = {
    prompts: [],
    recent: [],          // array of { id, copiedAt }
    activeCategory: 'All',
    activeTag: null,
    searchTerm: '',
    sortBy: 'newest',
    currentView: 'home',
    editingId: null,      // id currently being edited in modal, or null = add mode
    pendingDeleteId: null,
    randomPromptId: null
  };

  /* ============================================================
     DOM REFERENCES
     ============================================================ */
  const dom = {
    // nav / theme
    navToggle: document.getElementById('navToggle'),
    mainNavList: document.getElementById('mainNavList'),
    navLinks: document.querySelectorAll('.main-nav__link'),
    themeToggle: document.getElementById('themeToggle'),

    // hero / search / categories
    searchInput: document.getElementById('searchInput'),
    categoryBar: document.getElementById('categoryBar'),
    openAddPromptTop: document.getElementById('openAddPromptTop'),
    openAddPromptHero: document.getElementById('openAddPromptHero'),

    // stats
    statTotal: document.querySelector('[data-stat="total"]'),
    statFavorites: document.querySelector('[data-stat="favorites"]'),
    statCategories: document.querySelector('[data-stat="categories"]'),
    statTopPrompt: document.querySelector('[data-stat="topPrompt"]'),

    // toolbar
    tagCloud: document.getElementById('tagCloud'),
    randomPromptBtn: document.getElementById('randomPromptBtn'),
    importFile: document.getElementById('importFile'),
    exportBtn: document.getElementById('exportBtn'),
    sortSelect: document.getElementById('sortSelect'),

    // recent strip
    recentStrip: document.getElementById('recentStrip'),
    recentStripList: document.getElementById('recentStripList'),

    // grid
    promptGrid: document.getElementById('promptGrid'),
    resultsCount: document.getElementById('resultsCount'),
    emptyState: document.getElementById('emptyState'),
    clearFiltersBtn: document.getElementById('clearFiltersBtn'),

    // views
    viewPanels: document.querySelectorAll('[data-view-panel]'),
    favoritesGrid: document.getElementById('favoritesGrid'),
    favoritesEmptyState: document.getElementById('favoritesEmptyState'),

    // add/edit modal
    promptModalOverlay: document.getElementById('promptModalOverlay'),
    promptModal: document.getElementById('promptModal'),
    promptModalTitle: document.getElementById('promptModalTitle'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    cancelModalBtn: document.getElementById('cancelModalBtn'),
    promptForm: document.getElementById('promptForm'),
    promptIdInput: document.getElementById('promptId'),
    promptTitleInput: document.getElementById('promptTitle'),
    promptCategoryInput: document.getElementById('promptCategory'),
    promptTagsInput: document.getElementById('promptTags'),
    promptTextInput: document.getElementById('promptText'),
    promptCharCount: document.getElementById('promptCharCount'),

    // delete confirm modal
    confirmModalOverlay: document.getElementById('confirmModalOverlay'),
    cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),

    // detail / random modal
    detailModalOverlay: document.getElementById('detailModalOverlay'),
    detailModalBody: document.getElementById('detailModalBody'),
    closeDetailModalBtn: document.getElementById('closeDetailModalBtn'),
    detailRerollBtn: document.getElementById('detailRerollBtn'),
    detailCopyBtn: document.getElementById('detailCopyBtn'),

    // toast
    toastContainer: document.getElementById('toastContainer'),

    body: document.body
  };

  /* ============================================================
     STORAGE HELPERS
     ============================================================ */
  const Storage = {
    loadPrompts() {
      try {
        const raw = localStorage.getItem(LS_KEYS.PROMPTS);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : null;
      } catch (e) {
        console.error('Failed to parse stored prompts', e);
        return null;
      }
    },
    savePrompts(prompts) {
      try {
        localStorage.setItem(LS_KEYS.PROMPTS, JSON.stringify(prompts));
      } catch (e) {
        console.error('Failed to save prompts', e);
        Toast.show('Storage error: could not save your changes.', 'error');
      }
    },
    loadTheme() {
      return localStorage.getItem(LS_KEYS.THEME);
    },
    saveTheme(theme) {
      localStorage.setItem(LS_KEYS.THEME, theme);
    },
    loadRecent() {
      try {
        const raw = localStorage.getItem(LS_KEYS.RECENT);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    },
    saveRecent(recent) {
      localStorage.setItem(LS_KEYS.RECENT, JSON.stringify(recent));
    }
  };

  /* ============================================================
     TOAST NOTIFICATIONS
     ============================================================ */
  const Toast = {
    show(message, type = 'success', duration = 2200) {
      const toast = document.createElement('div');
      toast.className = `toast toast--${type}`;
      toast.setAttribute('role', 'status');

      const iconMap = { success: '✔', error: '✕', info: 'ℹ' };
      toast.innerHTML = `<span class="toast__icon">${iconMap[type] || iconMap.info}</span><span class="toast__msg"></span>`;
      toast.querySelector('.toast__msg').textContent = message;

      dom.toastContainer.appendChild(toast);

      // Force reflow then animate in
      requestAnimationFrame(() => toast.classList.add('toast--visible'));

      setTimeout(() => {
        toast.classList.remove('toast--visible');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        // Fallback removal in case transitionend doesn't fire
        setTimeout(() => toast.remove(), 500);
      }, duration);
    }
  };

  /* ============================================================
     UTILITIES
     ============================================================ */
  const Utils = {
    uid() {
      return 'p-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    },
    escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str == null ? '' : String(str);
      return div.innerHTML;
    },
    truncate(str, max) {
      if (!str) return '';
      return str.length > max ? str.slice(0, max).trim() + '…' : str;
    },
    parseTags(rawTagString) {
      return rawTagString
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => t.toLowerCase());
    },
    categoryColor(categoryName) {
      const found = CATEGORIES.find((c) => c.name === categoryName);
      return found ? found.color : '#9096A8';
    },
    debounce(fn, delay) {
      let timer = null;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(null, args), delay);
      };
    },
    formatDate(iso) {
      try {
        const d = new Date(iso);
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      } catch (e) {
        return '';
      }
    }
  };

  /* ============================================================
     DATA ACCESS / DERIVED DATA
     ============================================================ */
  const Data = {
    init() {
      const stored = Storage.loadPrompts();
      state.prompts = stored && stored.length ? stored : JSON.parse(JSON.stringify(SAMPLE_PROMPTS));
      if (!stored) Storage.savePrompts(state.prompts); // persist the seed on first visit
      state.recent = Storage.loadRecent();
    },
    persist() {
      Storage.savePrompts(state.prompts);
    },
    getById(id) {
      return state.prompts.find((p) => p.id === id);
    },
    add(promptData) {
      const newPrompt = {
        id: Utils.uid(),
        title: promptData.title,
        category: promptData.category,
        tags: promptData.tags,
        prompt: promptData.prompt,
        favorite: false,
        copyCount: 0,
        createdAt: new Date().toISOString()
      };
      state.prompts.unshift(newPrompt);
      this.persist();
      return newPrompt;
    },
    update(id, promptData) {
      const p = this.getById(id);
      if (!p) return;
      p.title = promptData.title;
      p.category = promptData.category;
      p.tags = promptData.tags;
      p.prompt = promptData.prompt;
      this.persist();
    },
    remove(id) {
      state.prompts = state.prompts.filter((p) => p.id !== id);
      state.recent = state.recent.filter((r) => r.id !== id);
      Storage.saveRecent(state.recent);
      this.persist();
    },
    toggleFavorite(id) {
      const p = this.getById(id);
      if (!p) return;
      p.favorite = !p.favorite;
      this.persist();
    },
    registerCopy(id) {
      const p = this.getById(id);
      if (!p) return;
      p.copyCount = (p.copyCount || 0) + 1;
      this.persist();

      state.recent = state.recent.filter((r) => r.id !== id);
      state.recent.unshift({ id, copiedAt: new Date().toISOString() });
      state.recent = state.recent.slice(0, 8);
      Storage.saveRecent(state.recent);
    },
    allCategories() {
      const set = new Set(state.prompts.map((p) => p.category));
      return Array.from(set);
    },
    allTags() {
      const set = new Set();
      state.prompts.forEach((p) => (p.tags || []).forEach((t) => set.add(t)));
      return Array.from(set).sort();
    },
    topPrompt() {
      if (!state.prompts.length) return null;
      return state.prompts.reduce((top, p) => ((p.copyCount || 0) > (top.copyCount || 0) ? p : top), state.prompts[0]);
    },
    /** Returns prompts after search + category + tag filters + sort applied */
    filteredAndSorted() {
      const term = state.searchTerm.trim().toLowerCase();

      let result = state.prompts.filter((p) => {
        const matchesCategory = state.activeCategory === 'All' || p.category === state.activeCategory;
        const matchesTag = !state.activeTag || (p.tags || []).includes(state.activeTag);
        const matchesSearch =
          !term ||
          p.title.toLowerCase().includes(term) ||
          p.prompt.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(term));
        return matchesCategory && matchesTag && matchesSearch;
      });

      switch (state.sortBy) {
        case 'oldest':
          result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'az':
          result.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'za':
          result.sort((a, b) => b.title.localeCompare(a.title));
          break;
        case 'mostCopied':
          result.sort((a, b) => (b.copyCount || 0) - (a.copyCount || 0));
          break;
        case 'newest':
        default:
          result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      return result;
    }
  };

  /* ============================================================
     RENDER
     ============================================================ */
  const Render = {
    all() {
      this.categoryBar();
      this.tagCloud();
      this.stats();
      this.promptGrid();
      this.recentStrip();
    },

    categoryBar() {
      const cats = ['All', ...CATEGORIES.map((c) => c.name)];
      dom.categoryBar.innerHTML = cats
        .map((cat) => {
          const isActive = cat === state.activeCategory;
          const color = cat === 'All' ? 'var(--accent-primary)' : Utils.categoryColor(cat);
          return `
            <button type="button" class="pill ${isActive ? 'pill--active' : ''}" data-category="${Utils.escapeHtml(cat)}" style="--pill-color:${color}">
              ${Utils.escapeHtml(cat)}
            </button>`;
        })
        .join('');
    },

    tagCloud() {
      const tags = Data.allTags();
      if (!tags.length) {
        dom.tagCloud.innerHTML = '';
        return;
      }
      dom.tagCloud.innerHTML = tags
        .map((tag) => {
          const isActive = tag === state.activeTag;
          return `<button type="button" class="tag-chip ${isActive ? 'tag-chip--active' : ''}" data-tag="${Utils.escapeHtml(tag)}">#${Utils.escapeHtml(tag)}</button>`;
        })
        .join('');
    },

    stats() {
      const total = state.prompts.length;
      const favorites = state.prompts.filter((p) => p.favorite).length;
      const categories = Data.allCategories().length;
      const top = Data.topPrompt();

      dom.statTotal.textContent = total;
      dom.statFavorites.textContent = favorites;
      dom.statCategories.textContent = categories;
      dom.statTopPrompt.textContent = top && top.copyCount > 0 ? `${top.title} (${top.copyCount}×)` : '—';
    },

    cardHTML(p) {
      const color = Utils.categoryColor(p.category);
      const tagsHTML = (p.tags || [])
        .slice(0, 4)
        .map((t) => `<span class="prompt-card__tag" data-tag="${Utils.escapeHtml(t)}">#${Utils.escapeHtml(t)}</span>`)
        .join('');

      return `
        <article class="prompt-card" role="listitem" data-id="${p.id}" style="--card-color:${color}">
          <header class="prompt-card__topbar">
            <span class="prompt-card__dot" aria-hidden="true"></span>
            <span class="prompt-card__badge">${Utils.escapeHtml(p.category)}</span>
            <button type="button" class="prompt-card__fav ${p.favorite ? 'is-favorite' : ''}" data-action="favorite" aria-label="${p.favorite ? 'Remove from favorites' : 'Add to favorites'}" aria-pressed="${p.favorite}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="${p.favorite ? 'currentColor' : 'none'}" aria-hidden="true"><path d="M12 20.5S3.5 15.6 3.5 9.6C3.5 6.5 5.9 4.3 8.6 4.3C10.3 4.3 11.6 5.1 12 6.2C12.4 5.1 13.7 4.3 15.4 4.3C18.1 4.3 20.5 6.5 20.5 9.6C20.5 15.6 12 20.5 12 20.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
            </button>
          </header>

          <h3 class="prompt-card__title">${Utils.escapeHtml(p.title)}</h3>
          <pre class="prompt-card__preview">${Utils.escapeHtml(Utils.truncate(p.prompt, 160))}</pre>

          ${tagsHTML ? `<div class="prompt-card__tags">${tagsHTML}</div>` : ''}

          <footer class="prompt-card__footer">
            <span class="prompt-card__meta">${p.copyCount || 0} copies</span>
            <div class="prompt-card__actions">
              <button type="button" class="icon-btn icon-btn--sm" data-action="copy" aria-label="Copy prompt" title="Copy">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M16 8V6C16 4.9 15.1 4 14 4H6C4.9 4 4 4.9 4 6V14C4 15.1 4.9 16 6 16H8" stroke="currentColor" stroke-width="1.5"/></svg>
              </button>
              <button type="button" class="icon-btn icon-btn--sm" data-action="edit" aria-label="Edit prompt" title="Edit">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 20L4.6 16.7L16.2 5.1C16.9 4.4 18 4.4 18.7 5.1L19.9 6.3C20.6 7 20.6 8.1 19.9 8.8L8.3 20.4L4 20Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
              </button>
              <button type="button" class="icon-btn icon-btn--sm icon-btn--danger" data-action="delete" aria-label="Delete prompt" title="Delete">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 7H19M9 7V5C9 4.4 9.4 4 10 4H14C14.6 4 15 4.4 15 5V7M17 7L16.3 19C16.2 19.6 15.7 20 15.1 20H8.9C8.3 20 7.8 19.6 7.7 19L7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
          </footer>
        </article>`;
    },

    promptGrid() {
      const list = Data.filteredAndSorted();
      dom.resultsCount.textContent = list.length ? `${list.length} prompt${list.length === 1 ? '' : 's'}` : '';

      if (!list.length) {
        dom.promptGrid.innerHTML = '';
        dom.emptyState.hidden = false;
        return;
      }
      dom.emptyState.hidden = true;
      dom.promptGrid.innerHTML = list.map((p) => this.cardHTML(p)).join('');
    },

    favoritesGrid() {
      const favs = state.prompts.filter((p) => p.favorite).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (!favs.length) {
        dom.favoritesGrid.innerHTML = '';
        dom.favoritesEmptyState.hidden = false;
        return;
      }
      dom.favoritesEmptyState.hidden = true;
      dom.favoritesGrid.innerHTML = favs.map((p) => this.cardHTML(p)).join('');
    },

    recentStrip() {
      const items = state.recent
        .map((r) => ({ ...r, prompt: Data.getById(r.id) }))
        .filter((r) => r.prompt);

      if (!items.length) {
        dom.recentStrip.hidden = true;
        return;
      }
      dom.recentStrip.hidden = false;
      dom.recentStripList.innerHTML = items
        .map(
          (r) => `
          <button type="button" class="recent-chip" data-id="${r.prompt.id}" data-action="open-detail">
            <span class="recent-chip__dot" style="--dot-color:${Utils.categoryColor(r.prompt.category)}"></span>
            ${Utils.escapeHtml(Utils.truncate(r.prompt.title, 28))}
          </button>`
        )
        .join('');
    }
  };

  /* ============================================================
     MODALS
     ============================================================ */
  const Modal = {
    openPromptModal(editId = null) {
      state.editingId = editId;
      dom.promptForm.reset();
      this.clearFormErrors();

      if (editId) {
        const p = Data.getById(editId);
        dom.promptModalTitle.textContent = 'Edit Prompt';
        dom.promptIdInput.value = p.id;
        dom.promptTitleInput.value = p.title;
        dom.promptCategoryInput.value = p.category;
        dom.promptTagsInput.value = (p.tags || []).join(', ');
        dom.promptTextInput.value = p.prompt;
        dom.promptCharCount.textContent = `${p.prompt.length} / 4000`;
      } else {
        dom.promptModalTitle.textContent = 'Add Prompt';
        dom.promptIdInput.value = '';
        dom.promptCharCount.textContent = '0 / 4000';
      }

      this.show(dom.promptModalOverlay);
      setTimeout(() => dom.promptTitleInput.focus(), 50);
    },

    clearFormErrors() {
      document.querySelectorAll('.form-error').forEach((el) => (el.textContent = ''));
      document.querySelectorAll('.form-field').forEach((el) => el.classList.remove('form-field--error'));
    },

    openDeleteModal(id) {
      state.pendingDeleteId = id;
      this.show(dom.confirmModalOverlay);
      dom.confirmDeleteBtn.focus();
    },

    openDetailModal(id) {
      const p = Data.getById(id);
      if (!p) return;
      state.randomPromptId = id;
      this.renderDetail(p);
      this.show(dom.detailModalOverlay);
    },

    renderDetail(p) {
      document.getElementById('detailModalTitle').textContent = p.title;
      dom.detailModalBody.innerHTML = `
        <div class="detail-meta">
          <span class="prompt-card__badge" style="--card-color:${Utils.categoryColor(p.category)}">${Utils.escapeHtml(p.category)}</span>
          <span class="prompt-card__meta">${p.copyCount || 0} copies · ${Utils.formatDate(p.createdAt)}</span>
        </div>
        <pre class="detail-prompt-text">${Utils.escapeHtml(p.prompt)}</pre>
        ${(p.tags || []).length ? `<div class="prompt-card__tags">${p.tags.map((t) => `<span class="prompt-card__tag">#${Utils.escapeHtml(t)}</span>`).join('')}</div>` : ''}
      `;
    },

    show(overlay) {
      overlay.hidden = false;
      requestAnimationFrame(() => overlay.classList.add('modal-overlay--visible'));
      dom.body.classList.add('no-scroll');
    },

    hide(overlay) {
      overlay.classList.remove('modal-overlay--visible');
      dom.body.classList.remove('no-scroll');
      setTimeout(() => {
        overlay.hidden = true;
      }, 200);
    },

    hideAll() {
      [dom.promptModalOverlay, dom.confirmModalOverlay, dom.detailModalOverlay].forEach((o) => this.hide(o));
    }
  };

  /* ============================================================
     FORM VALIDATION
     ============================================================ */
  const FormValidation = {
    validate() {
      Modal.clearFormErrors();
      let valid = true;

      const title = dom.promptTitleInput.value.trim();
      const category = dom.promptCategoryInput.value;
      const text = dom.promptTextInput.value.trim();

      if (!title) {
        this.setError('promptTitleError', 'Title is required.');
        valid = false;
      }
      if (!category) {
        this.setError('promptCategoryError', 'Please choose a category.');
        valid = false;
      }
      if (!text) {
        this.setError('promptTextError', 'Prompt text is required.');
        valid = false;
      } else if (text.length > 4000) {
        this.setError('promptTextError', 'Prompt is too long (max 4000 characters).');
        valid = false;
      }

      return valid;
    },
    setError(elId, message) {
      const el = document.getElementById(elId);
      el.textContent = message;
      el.closest('.form-field').classList.add('form-field--error');
    }
  };

  /* ============================================================
     CLIPBOARD
     ============================================================ */
  const ClipboardHelper = {
    async copy(text, id, triggerEl) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for non-secure contexts
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        Data.registerCopy(id);
        Toast.show('Copied!', 'success');
        Render.stats();
        Render.recentStrip();

        if (triggerEl) {
          const original = triggerEl.innerHTML;
          triggerEl.classList.add('is-copied');
          setTimeout(() => triggerEl.classList.remove('is-copied'), 2000);
        }
      } catch (err) {
        console.error('Copy failed', err);
        Toast.show('Could not copy to clipboard.', 'error');
      }
    }
  };

  /* ============================================================
     IMPORT / EXPORT
     ============================================================ */
  const ImportExport = {
    exportJSON() {
      const dataStr = JSON.stringify(state.prompts, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'prompts.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      Toast.show('Exported prompts.json', 'success');
    },

    importJSON(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!Array.isArray(parsed)) throw new Error('Invalid format');

          const sanitized = parsed
            .filter((p) => p && p.title && p.prompt)
            .map((p) => ({
              id: p.id || Utils.uid(),
              title: String(p.title),
              category: CATEGORIES.some((c) => c.name === p.category) ? p.category : 'ChatGPT',
              tags: Array.isArray(p.tags) ? p.tags : [],
              prompt: String(p.prompt),
              favorite: Boolean(p.favorite),
              copyCount: Number(p.copyCount) || 0,
              createdAt: p.createdAt || new Date().toISOString()
            }));

          // Merge: replace existing ids, append new ones
          const existingIds = new Set(state.prompts.map((p) => p.id));
          sanitized.forEach((p) => {
            if (existingIds.has(p.id)) {
              const idx = state.prompts.findIndex((x) => x.id === p.id);
              state.prompts[idx] = p;
            } else {
              state.prompts.unshift(p);
            }
          });

          Data.persist();
          Render.all();
          Toast.show(`Imported ${sanitized.length} prompt${sanitized.length === 1 ? '' : 's'}.`, 'success');
        } catch (err) {
          console.error('Import failed', err);
          Toast.show('Import failed: invalid JSON file.', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  /* ============================================================
     THEME
     ============================================================ */
  const Theme = {
    init() {
      const saved = Storage.loadTheme();
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = saved || (prefersDark ? 'dark' : 'dark'); // default to dark regardless of OS pref to match brand
      this.apply(theme);
    },
    apply(theme) {
      dom.body.setAttribute('data-theme', theme);
      dom.themeToggle.setAttribute('aria-pressed', theme === 'dark');
      Storage.saveTheme(theme);
    },
    toggle() {
      const current = dom.body.getAttribute('data-theme');
      this.apply(current === 'dark' ? 'light' : 'dark');
    }
  };

  /* ============================================================
     VIEW SWITCHING
     ============================================================ */
  const ViewRouter = {
    switchTo(viewName) {
      state.currentView = viewName;
      dom.viewPanels.forEach((panel) => {
        panel.hidden = panel.dataset.viewPanel !== viewName;
      });
      dom.navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.dataset.view === viewName);
      });
      if (viewName === 'favorites') Render.favoritesGrid();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // close mobile nav if open
      dom.mainNavList.classList.remove('is-open');
      dom.navToggle.setAttribute('aria-expanded', 'false');
    }
  };

  /* ============================================================
     EVENT HANDLERS
     ============================================================ */
  function handleGridClick(e) {
    const actionBtn = e.target.closest('[data-action]');
    const card = e.target.closest('.prompt-card');
    if (!card) return;
    const id = card.dataset.id;

    if (!actionBtn) return;
    const action = actionBtn.dataset.action;

    switch (action) {
      case 'favorite':
        Data.toggleFavorite(id);
        Render.stats();
        if (state.currentView === 'favorites') Render.favoritesGrid();
        else Render.promptGrid();
        break;
      case 'copy': {
        const p = Data.getById(id);
        if (p) ClipboardHelper.copy(p.prompt, id, actionBtn);
        break;
      }
      case 'edit':
        Modal.openPromptModal(id);
        break;
      case 'delete':
        Modal.openDeleteModal(id);
        break;
      default:
        break;
    }
  }

  function handlePromptFormSubmit(e) {
    e.preventDefault();
    if (!FormValidation.validate()) return;

    const payload = {
      title: dom.promptTitleInput.value.trim(),
      category: dom.promptCategoryInput.value,
      tags: Utils.parseTags(dom.promptTagsInput.value),
      prompt: dom.promptTextInput.value.trim()
    };

    if (state.editingId) {
      Data.update(state.editingId, payload);
      Toast.show('Prompt updated.', 'success');
    } else {
      Data.add(payload);
      Toast.show('Prompt added.', 'success');
    }

    Modal.hide(dom.promptModalOverlay);
    Render.all();
    if (state.currentView === 'favorites') Render.favoritesGrid();
  }

  function handleConfirmDelete() {
    if (state.pendingDeleteId) {
      Data.remove(state.pendingDeleteId);
      Toast.show('Prompt deleted.', 'info');
      state.pendingDeleteId = null;
      Render.all();
      if (state.currentView === 'favorites') Render.favoritesGrid();
    }
    Modal.hide(dom.confirmModalOverlay);
  }

  function showRandomPrompt() {
    if (!state.prompts.length) {
      Toast.show('Add some prompts first!', 'info');
      return;
    }
    const pool = state.prompts;
    const random = pool[Math.floor(Math.random() * pool.length)];
    Modal.openDetailModal(random.id);
  }

  function bindEvents() {
    // Mobile nav toggle
    dom.navToggle.addEventListener('click', () => {
      const isOpen = dom.mainNavList.classList.toggle('is-open');
      dom.navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Nav links -> view switch
    dom.navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        ViewRouter.switchTo(link.dataset.view);
      });
    });

    // Theme
    dom.themeToggle.addEventListener('click', () => Theme.toggle());

    // Search (debounced)
    dom.searchInput.addEventListener(
      'input',
      Utils.debounce((e) => {
        state.searchTerm = e.target.value;
        Render.promptGrid();
      }, 200)
    );

    // Category pills (event delegation)
    dom.categoryBar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-category]');
      if (!btn) return;
      state.activeCategory = btn.dataset.category;
      Render.categoryBar();
      Render.promptGrid();
    });

    // Tag cloud (event delegation)
    dom.tagCloud.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-tag]');
      if (!btn) return;
      const tag = btn.dataset.tag;
      state.activeTag = state.activeTag === tag ? null : tag;
      Render.tagCloud();
      Render.promptGrid();
    });

    // Clicking a tag chip inside a card also filters
    dom.promptGrid.addEventListener('click', (e) => {
      const tagEl = e.target.closest('.prompt-card__tag');
      if (tagEl && tagEl.dataset.tag) {
        state.activeTag = tagEl.dataset.tag;
        Render.tagCloud();
        Render.promptGrid();
        return;
      }
      handleGridClick(e);
    });
    dom.favoritesGrid.addEventListener('click', handleGridClick);

    // Sort
    dom.sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      Render.promptGrid();
    });

    // Add prompt buttons
    dom.openAddPromptTop.addEventListener('click', () => Modal.openPromptModal());
    dom.openAddPromptHero.addEventListener('click', () => Modal.openPromptModal());

    // Modal close/cancel
    dom.closeModalBtn.addEventListener('click', () => Modal.hide(dom.promptModalOverlay));
    dom.cancelModalBtn.addEventListener('click', () => Modal.hide(dom.promptModalOverlay));
    dom.promptModalOverlay.addEventListener('click', (e) => {
      if (e.target === dom.promptModalOverlay) Modal.hide(dom.promptModalOverlay);
    });

    // Form submit + char counter
    dom.promptForm.addEventListener('submit', handlePromptFormSubmit);
    dom.promptTextInput.addEventListener('input', () => {
      dom.promptCharCount.textContent = `${dom.promptTextInput.value.length} / 4000`;
    });

    // Delete modal
    dom.cancelDeleteBtn.addEventListener('click', () => Modal.hide(dom.confirmModalOverlay));
    dom.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
    dom.confirmModalOverlay.addEventListener('click', (e) => {
      if (e.target === dom.confirmModalOverlay) Modal.hide(dom.confirmModalOverlay);
    });

    // Detail modal
    dom.closeDetailModalBtn.addEventListener('click', () => Modal.hide(dom.detailModalOverlay));
    dom.detailModalOverlay.addEventListener('click', (e) => {
      if (e.target === dom.detailModalOverlay) Modal.hide(dom.detailModalOverlay);
    });
    dom.detailRerollBtn.addEventListener('click', showRandomPrompt);
    dom.detailCopyBtn.addEventListener('click', () => {
      const p = Data.getById(state.randomPromptId);
      if (p) ClipboardHelper.copy(p.prompt, p.id, dom.detailCopyBtn);
    });

    // Recent strip -> open detail
    dom.recentStripList.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="open-detail"]');
      if (btn) Modal.openDetailModal(btn.dataset.id);
    });

    // Random prompt button
    dom.randomPromptBtn.addEventListener('click', showRandomPrompt);

    // Import / export
    dom.exportBtn.addEventListener('click', () => ImportExport.exportJSON());
    dom.importFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) ImportExport.importJSON(file);
      e.target.value = ''; // allow re-importing the same filename later
    });

    // Clear filters
    dom.clearFiltersBtn.addEventListener('click', () => {
      state.searchTerm = '';
      state.activeCategory = 'All';
      state.activeTag = null;
      dom.searchInput.value = '';
      Render.categoryBar();
      Render.tagCloud();
      Render.promptGrid();
    });

    // Escape key closes any open modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        Modal.hideAll();
      }
      // Ctrl/Cmd + K -> focus search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        ViewRouter.switchTo('home');
        dom.searchInput.focus();
        dom.searchInput.select();
      }
      // Ctrl/Cmd + N -> open add prompt modal
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        Modal.openPromptModal();
      }
    });
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    Theme.init();
    Data.init();
    bindEvents();
    Render.all();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
