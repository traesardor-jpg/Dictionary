/**
 * dictionary Eng-Uzb - Asosiy Controller (App Moduli)
 * Barcha bo'limlar, hodisalar va UI interaktivligi integratsiyasi
 */

const App = {
  activeTab: "flashcards", // 'flashcards' | 'dictionary' | 'quiz'
  currentCardIndex: 0,
  flashcardsList: [],
  isCardFlipped: false,
  viewMode: "grid", // 'grid' | 'table'
  searchQuery: "",
  selectedCategoryFilter: "Barchasi",
  selectedStatusFilter: "all", // 'all' | 'learned' | 'learning'
  selectedSort: "az", // 'az' | 'za' | 'newest'

  /**
   * Ilovani ishga tushirish
   */
  init() {
    // 1. Mavzuni o'rnatish
    this.initTheme();

    // 2. Flesh-karta ro'yxatini shakllantirish
    this.refreshFlashcardsList();

    // 3. Kategoriyalar dropdownlarini to'ldirish
    this.populateCategories();

    // 4. Header va umumiy progressni yangilash
    this.updateHeaderProgress();

    // 5. Fleshkartani chizish
    this.renderFlashcard();

    // 6. Lug'at ro'yxatini chizish
    this.renderDictionaryList();

    // 7. Quiz statistikasini yangilash
    this.updateQuizPanelStats();

    // 8. Klaviatura hodisalarini tinglash
    this.initKeyboardListeners();

    // 9. LocalStorage yangilanish hodisalarini tinglash
    window.addEventListener("dictionary_updated", () => {
      this.populateCategories();
      this.refreshFlashcardsList();
      this.renderFlashcard();
      this.renderDictionaryList();
      this.updateHeaderProgress();
      this.updateQuizPanelStats();
    });

    window.addEventListener("status_updated", () => {
      this.renderFlashcardStatus();
      this.renderDictionaryList();
      this.updateHeaderProgress();
    });

    window.addEventListener("stats_updated", () => {
      this.updateQuizPanelStats();
    });
  },

  /* ==================== MAVZU (THEME) BOSHQARUVI ==================== */
  initTheme() {
    const theme = StorageManager.getTheme();
    StorageManager.setTheme(theme);
    this.updateThemeIcons(theme);
  },

  toggleTheme() {
    const current = StorageManager.getTheme();
    const next = current === "dark" ? "light" : "dark";
    StorageManager.setTheme(next);
    this.updateThemeIcons(next);
    this.showToast(next === "dark" ? "Tungi rejim yoqildi 🌙" : "Kunduzgi rejim yoqildi ☀️", "info");
  },

  updateThemeIcons(theme) {
    const sunIcon = document.getElementById("theme-sun-icon");
    const moonIcon = document.getElementById("theme-moon-icon");
    if (!sunIcon || !moonIcon) return;

    if (theme === "dark") {
      sunIcon.classList.remove("hidden");
      moonIcon.classList.add("hidden");
    } else {
      sunIcon.classList.add("hidden");
      moonIcon.classList.remove("hidden");
    }
  },

  /* ==================== TABLAR (NAVIGATSIYA) ==================== */
  switchTab(tabName) {
    this.activeTab = tabName;

    // Tugmalar holati
    const tabs = ["flashcards", "dictionary", "quiz", "admin"];
    tabs.forEach(t => {
      const btn = document.getElementById(`tab-${t}`);
      const sec = document.getElementById(`section-${t}`);
      const mobBtn = document.getElementById(`mob-tab-${t}`);
      if (!btn || !sec) return;

      if (t === tabName) {
        btn.className = "tab-btn flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300";
        sec.classList.remove("hidden");
        if (mobBtn) {
          mobBtn.className = "mob-tab-btn flex-1 flex flex-col items-center py-1.5 px-2 rounded-xl text-brand-600 dark:text-brand-400 transition-colors";
        }
      } else {
        btn.className = "tab-btn flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60";
        sec.classList.add("hidden");
        if (mobBtn) {
          mobBtn.className = "mob-tab-btn flex-1 flex flex-col items-center py-1.5 px-2 rounded-xl text-slate-500 dark:text-slate-400 transition-colors";
        }
      }
    });

    if (tabName === "dictionary") {
      this.renderDictionaryList();
    } else if (tabName === "admin") {
      this.updateAdminStats();
      this.renderAdminWordsTable();
      // Admin kategoriya selectini to'ldirish
      const adminCatSelect = document.getElementById("admin-new-category-select");
      if (adminCatSelect) {
        const categories = this.getAllCategories().filter(c => c !== "Barchasi");
        adminCatSelect.innerHTML = categories.map(c => 
          `<option value="${c}">${c}</option>`
        ).join("");
        adminCatSelect.innerHTML += `<option value="__custom__">+ Boshqa kategoriya</option>`;
      }
    }
  },

  /* ==================== KATEGORIYALAR ==================== */
  getAllCategories() {
    const words = StorageManager.getWords();
    const categoriesSet = new Set(DEFAULT_CATEGORIES);
    words.forEach(w => {
      if (w.category) categoriesSet.add(w.category);
    });
    return Array.from(categoriesSet);
  },

  populateCategories() {
    const categories = this.getAllCategories();

    // 1. Flashcard select
    const flashSelect = document.getElementById("flashcard-category-select");
    if (flashSelect) {
      const curVal = flashSelect.value;
      flashSelect.innerHTML = categories.map(c => 
        `<option value="${c}" ${c === curVal ? 'selected' : ''}>${c === 'Barchasi' ? 'Barcha kategoriyalar' : c}</option>`
      ).join("");
    }

    // 2. Dictionary filter select
    const dictSelect = document.getElementById("dict-category-filter");
    if (dictSelect) {
      const curVal = dictSelect.value;
      dictSelect.innerHTML = categories.map(c => 
        `<option value="${c}" ${c === curVal ? 'selected' : ''}>${c === 'Barchasi' ? 'Barcha kategoriyalar' : c}</option>`
      ).join("");
    }

    // 3. Add Word modal category select
    const addSelect = document.getElementById("new-category-select");
    if (addSelect) {
      const addCategories = categories.filter(c => c !== "Barchasi");
      addSelect.innerHTML = `
        <option value="">Kategoriya tanlang...</option>
        ${addCategories.map(c => `<option value="${c}">${c}</option>`).join("")}
        <option value="__custom__">+ Boshqa kategoriya</option>
      `;
    }
  },

  /* ==================== PROGRESS ==================== */
  updateHeaderProgress() {
    const { total, learnedCount, percent } = StorageManager.getProgress();

    const textEl = document.getElementById("header-progress-text");
    const fillEl = document.getElementById("header-progress-fill");
    const wordsCountBadge = document.getElementById("tab-words-count-badge");

    if (textEl) textEl.textContent = `${learnedCount} / ${total} yodlandi (${percent}%)`;
    if (fillEl) fillEl.style.width = `${percent}%`;
    if (wordsCountBadge) wordsCountBadge.textContent = total;
  },

  /* ==================== FLESH-KARTALAR (FLASHCARDS) ==================== */
  refreshFlashcardsList() {
    const allWords = StorageManager.getWords();
    const flashSelect = document.getElementById("flashcard-category-select");
    const category = flashSelect ? flashSelect.value : "Barchasi";

    if (category === "Barchasi") {
      this.flashcardsList = [...allWords];
    } else {
      this.flashcardsList = allWords.filter(w => w.category === category);
    }

    if (this.currentCardIndex >= this.flashcardsList.length) {
      this.currentCardIndex = 0;
    }
  },

  onFlashcardCategoryChange(category) {
    this.refreshFlashcardsList();
    this.currentCardIndex = 0;
    this.isCardFlipped = false;
    this.renderFlashcard();
  },

  shuffleFlashcards() {
    for (let i = this.flashcardsList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.flashcardsList[i], this.flashcardsList[j]] = [this.flashcardsList[j], this.flashcardsList[i]];
    }
    this.currentCardIndex = 0;
    this.isCardFlipped = false;
    this.renderFlashcard();
    AudioManager.playFlipSound();
    this.showToast("Kartalar tasodifiy aralashtirildi 🔀", "info");
  },

  toggleCardFlip() {
    const cardEl = document.getElementById("active-flashcard");
    if (!cardEl) return;

    this.isCardFlipped = !this.isCardFlipped;
    cardEl.classList.toggle("is-flipped", this.isCardFlipped);
    AudioManager.playFlipSound();
  },

  resetCardFlip() {
    const cardEl = document.getElementById("active-flashcard");
    if (cardEl && this.isCardFlipped) {
      this.isCardFlipped = false;
      cardEl.classList.remove("is-flipped");
    }
  },

  prevCard() {
    if (this.flashcardsList.length === 0) return;
    this.resetCardFlip();
    this.currentCardIndex = (this.currentCardIndex - 1 + this.flashcardsList.length) % this.flashcardsList.length;
    this.renderFlashcard();
  },

  nextCard() {
    if (this.flashcardsList.length === 0) return;
    this.resetCardFlip();
    this.currentCardIndex = (this.currentCardIndex + 1) % this.flashcardsList.length;
    this.renderFlashcard();
  },

  getCurrentCard() {
    if (!this.flashcardsList || this.flashcardsList.length === 0) return null;
    return this.flashcardsList[this.currentCardIndex];
  },

  renderFlashcard() {
    const card = this.getCurrentCard();
    const cardEl = document.getElementById("active-flashcard");
    if (!card || !cardEl) return;

    // Reset flip agar ochiq bo'lsa
    if (this.isCardFlipped) {
      cardEl.classList.add("is-flipped");
    } else {
      cardEl.classList.remove("is-flipped");
    }

    // Counter va Progress
    const counterEl = document.getElementById("flashcard-counter");
    const progressBar = document.getElementById("flashcard-progress-bar");
    if (counterEl) counterEl.textContent = `${this.currentCardIndex + 1} / ${this.flashcardsList.length}`;
    if (progressBar) {
      const pct = Math.round(((this.currentCardIndex + 1) / this.flashcardsList.length) * 100);
      progressBar.style.width = `${pct}%`;
    }

    // Old tomoni (Front)
    const frontCategory = document.getElementById("card-front-category");
    const frontWord = document.getElementById("card-front-word");
    const frontPhonetic = document.getElementById("card-front-phonetic");

    if (frontCategory) frontCategory.textContent = card.category;
    if (frontWord) frontWord.textContent = card.word;
    if (frontPhonetic) frontPhonetic.textContent = card.phonetic || "";

    // Orqa tomoni (Back)
    const backWord = document.getElementById("card-back-word-title");
    const backPhonetic = document.getElementById("card-back-phonetic-badge");
    const backTrans = document.getElementById("card-back-translation");
    const backExBox = document.getElementById("card-back-examples-box");
    const backExEng = document.getElementById("card-back-example-eng");
    const backExUzb = document.getElementById("card-back-example-uzb");

    if (backWord) backWord.textContent = card.word;
    if (backPhonetic) backPhonetic.textContent = card.phonetic || "";
    if (backTrans) backTrans.textContent = card.translation;

    if (card.exampleEng) {
      if (backExBox) backExBox.classList.remove("hidden");
      if (backExEng) backExEng.textContent = `"${card.exampleEng}"`;
      if (backExUzb) backExUzb.textContent = `"${card.exampleUzb || ''}"`;
    } else {
      if (backExBox) backExBox.classList.add("hidden");
    }

    this.renderFlashcardStatus();
  },

  renderFlashcardStatus() {
    const card = this.getCurrentCard();
    if (!card) return;

    const status = StorageManager.getStatus(card.id);
    const badge = document.getElementById("card-front-status-badge");
    const btnLearning = document.getElementById("card-btn-learning");
    const btnLearned = document.getElementById("card-btn-learned");

    if (badge) {
      if (status === "learned") {
        badge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800";
        badge.textContent = "✓ Yodlangan";
      } else {
        badge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800";
        badge.textContent = "○ O'rganilmoqda";
      }
    }

    if (btnLearning && btnLearned) {
      if (status === "learned") {
        btnLearned.classList.add("ring-2", "ring-emerald-500", "shadow-sm");
        btnLearning.classList.remove("ring-2", "ring-rose-500");
      } else {
        btnLearning.classList.add("ring-2", "ring-rose-500", "shadow-sm");
        btnLearned.classList.remove("ring-2", "ring-emerald-500");
      }
    }
  },

  markCurrentCardStatus(status) {
    const card = this.getCurrentCard();
    if (!card) return;

    StorageManager.setStatus(card.id, status);
    if (status === "learned") {
      AudioManager.playCorrectSound();
      this.showToast(`"${card.word}" yodlanganlar safiga qo'shildi! 🎉`, "success");
    } else {
      AudioManager.playFlipSound();
      this.showToast(`"${card.word}" o'rganilayotganlar ro'yxatida saqlandi.`, "info");
    }

    // Kichik kechikish bilan keyingi kartaga o'tish
    setTimeout(() => {
      this.nextCard();
    }, 350);
  },

  speakCurrentCard() {
    const card = this.getCurrentCard();
    if (!card) return;

    const btn = document.getElementById("card-front-audio-btn");
    AudioManager.speak(card.word, () => {
      if (btn) btn.classList.add("speaking-pulse");
    }, () => {
      if (btn) btn.classList.remove("speaking-pulse");
    });
  },

  /* ==================== SO'ZLAR RO'YXATI & QIDIRUV ==================== */
  onSearchInput(query) {
    this.searchQuery = query.trim().toLowerCase();
    const clearBtn = document.getElementById("dict-search-clear");
    if (clearBtn) {
      clearBtn.classList.toggle("hidden", this.searchQuery === "");
    }
    this.renderDictionaryList();
  },

  clearSearch() {
    const input = document.getElementById("dict-search-input");
    if (input) input.value = "";
    this.onSearchInput("");
  },

  onFilterCategoryChange(cat) {
    this.selectedCategoryFilter = cat;
    this.renderDictionaryList();
  },

  onSortChange(sort) {
    this.selectedSort = sort;
    this.renderDictionaryList();
  },

  setStatusFilter(status) {
    this.selectedStatusFilter = status;

    // Tugmalar holati
    const btns = ["all", "learned", "learning"];
    btns.forEach(s => {
      const btn = document.getElementById(`filter-status-${s}`);
      if (!btn) return;
      if (s === status) {
        btn.className = "status-filter-btn px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold";
      } else {
        btn.className = "status-filter-btn px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900";
      }
    });

    this.renderDictionaryList();
  },

  setViewMode(mode) {
    this.viewMode = mode;
    const gridBtn = document.getElementById("btn-view-grid");
    const tableBtn = document.getElementById("btn-view-table");

    if (mode === "grid") {
      gridBtn.className = "p-1.5 rounded-lg bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm";
      tableBtn.className = "p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200";
    } else {
      tableBtn.className = "p-1.5 rounded-lg bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm";
      gridBtn.className = "p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200";
    }

    this.renderDictionaryList();
  },

  getFilteredWords() {
    let list = StorageManager.getWords();
    const statusMap = StorageManager.getStatusMap();

    // 1. Qidiruv filtri (Inglizcha so'z, tarjima, misol gaplar)
    if (this.searchQuery) {
      const q = this.searchQuery;
      list = list.filter(w => 
        w.word.toLowerCase().includes(q) ||
        w.translation.toLowerCase().includes(q) ||
        (w.exampleEng && w.exampleEng.toLowerCase().includes(q)) ||
        (w.exampleUzb && w.exampleUzb.toLowerCase().includes(q))
      );
    }

    // 2. Kategoriya filtri
    if (this.selectedCategoryFilter !== "Barchasi") {
      list = list.filter(w => w.category === this.selectedCategoryFilter);
    }

    // 3. Status filtri
    if (this.selectedStatusFilter !== "all") {
      list = list.filter(w => {
        const s = statusMap[w.id] || "learning";
        return s === this.selectedStatusFilter;
      });
    }

    // 4. Saralash (Sort)
    if (this.selectedSort === "az") {
      list.sort((a, b) => a.word.localeCompare(b.word));
    } else if (this.selectedSort === "za") {
      list.sort((a, b) => b.word.localeCompare(a.word));
    } else if (this.selectedSort === "newest") {
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    return list;
  },

  renderDictionaryList() {
    const container = document.getElementById("dict-words-container");
    const emptyState = document.getElementById("dict-empty-state");
    if (!container) return;

    // Status hisoblagichlarini yangilash
    const allWords = StorageManager.getWords();
    const statusMap = StorageManager.getStatusMap();
    let learnedCount = 0;
    allWords.forEach(w => {
      if (statusMap[w.id] === "learned") learnedCount++;
    });

    const countAllEl = document.getElementById("count-status-all");
    const countLearnedEl = document.getElementById("count-status-learned");
    const countLearningEl = document.getElementById("count-status-learning");

    if (countAllEl) countAllEl.textContent = allWords.length;
    if (countLearnedEl) countLearnedEl.textContent = learnedCount;
    if (countLearningEl) countLearningEl.textContent = allWords.length - learnedCount;

    const filtered = this.getFilteredWords();

    if (filtered.length === 0) {
      container.innerHTML = "";
      if (emptyState) emptyState.classList.remove("hidden");
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");

    if (this.viewMode === "grid") {
      this.renderGridView(filtered, container);
    } else {
      this.renderTableView(filtered, container);
    }
  },

  renderGridView(words, container) {
    container.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";
    container.innerHTML = words.map(word => {
      const isLearned = StorageManager.getStatus(word.id) === "learned";
      return `
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <!-- Yuqori qator: Kategoriya va Status -->
            <div class="flex items-center justify-between mb-3">
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-50 text-brand-600 dark:bg-brand-950/70 dark:text-brand-300">
                ${this.escapeHtml(word.category)}
              </span>
              <button onclick="App.toggleWordStatus('${word.id}')" title="Holatini almashtirish" class="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all ${
                isLearned 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200' 
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-200'
              }">
                <span>${isLearned ? '✓ Yodlangan' : '○ O\'rganilmoqda'}</span>
              </button>
            </div>

            <!-- So'z va Transkripsiya -->
            <div class="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 class="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                  ${this.escapeHtml(word.word)}
                </h3>
                <span class="text-xs text-slate-400 dark:text-slate-500 font-mono">${this.escapeHtml(word.phonetic || "")}</span>
              </div>
              <button onclick="AudioManager.speak('${this.escapeHtml(word.word)}')" title="Talaffuz qilish" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
              </button>
            </div>

            <!-- O'zbekcha Tarjima -->
            <p class="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-3 bg-indigo-50/50 dark:bg-indigo-950/30 p-2.5 rounded-xl">
              ${this.escapeHtml(word.translation)}
            </p>

            <!-- Misol gaplar -->
            ${word.exampleEng ? `
              <div class="text-xs text-slate-600 dark:text-slate-400 space-y-1 mb-4 border-l-2 border-brand-300 pl-2.5">
                <p class="italic">"${this.escapeHtml(word.exampleEng)}"</p>
                <p class="text-slate-500 dark:text-slate-500">"${this.escapeHtml(word.exampleUzb || '')}"</p>
              </div>
            ` : ""}
          </div>

          <!-- Pastki harakatlar: O'chirish -->
          <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span class="text-slate-400">ID: ${word.id.slice(-6)}</span>
            <button onclick="App.deleteWordConfirm('${word.id}', '${this.escapeHtml(word.word)}')" class="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      `;
    }).join("");
  },

  renderTableView(words, container) {
    container.className = "overflow-x-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm";
    container.innerHTML = `
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th class="py-3.5 px-4 font-bold">So'z & Transkripsiya</th>
            <th class="py-3.5 px-4 font-bold">O'zbekcha Tarjimasi</th>
            <th class="py-3.5 px-4 font-bold hidden md:table-cell">Misol gap</th>
            <th class="py-3.5 px-4 font-bold">Kategoriya</th>
            <th class="py-3.5 px-4 font-bold">Holat</th>
            <th class="py-3.5 px-4 font-bold text-right">Amallar</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          ${words.map(word => {
            const isLearned = StorageManager.getStatus(word.id) === "learned";
            return `
              <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <button onclick="AudioManager.speak('${this.escapeHtml(word.word)}')" class="p-1.5 text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800 rounded-lg">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
                    </button>
                    <div>
                      <span class="font-bold text-slate-900 dark:text-white block">${this.escapeHtml(word.word)}</span>
                      <span class="text-xs text-slate-400 font-mono">${this.escapeHtml(word.phonetic || "")}</span>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4 font-medium text-indigo-900 dark:text-indigo-200">
                  ${this.escapeHtml(word.translation)}
                </td>
                <td class="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 hidden md:table-cell max-w-xs truncate">
                  ${word.exampleEng ? `"${this.escapeHtml(word.exampleEng)}"` : "—"}
                </td>
                <td class="py-3 px-4">
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    ${this.escapeHtml(word.category)}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <button onclick="App.toggleWordStatus('${word.id}')" class="px-2.5 py-1 rounded-full text-xs font-semibold ${
                    isLearned 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  }">
                    ${isLearned ? '✓ Yodlangan' : '○ O\'rganilmoqda'}
                  </button>
                </td>
                <td class="py-3 px-4 text-right">
                  <button onclick="App.deleteWordConfirm('${word.id}', '${this.escapeHtml(word.word)}')" class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;
  },

  toggleWordStatus(id) {
    const next = StorageManager.toggleStatus(id);
    if (next === "learned") {
      AudioManager.playCorrectSound();
    }
  },

  deleteWordConfirm(id, wordName) {
    if (confirm(`Rostdan ham "${wordName}" so'zini lug'atdan o'chirmoqchimisiz?`)) {
      StorageManager.deleteWord(id);
      this.showToast(`"${wordName}" o'chirildi`, "info");
    }
  },

  /* ==================== YANGI SO'Z QO'SHISH ==================== */
  openAddWordModal() {
    const modal = document.getElementById("add-word-modal");
    if (modal) {
      modal.classList.remove("hidden");
      const wordInput = document.getElementById("new-word-input");
      if (wordInput) wordInput.focus();
    }
  },

  closeAddWordModal() {
    const modal = document.getElementById("add-word-modal");
    const form = document.getElementById("add-word-form");
    if (modal) modal.classList.add("hidden");
    if (form) form.reset();
  },

  onNewCategorySelectChange(val) {
    const customInput = document.getElementById("new-category-custom-input");
    if (!customInput) return;

    if (val === "__custom__") {
      customInput.focus();
      customInput.required = true;
    } else {
      customInput.value = "";
      customInput.required = false;
    }
  },

  handleAddWordSubmit(e) {
    e.preventDefault();

    const wordInput = document.getElementById("new-word-input");
    const phoneticInput = document.getElementById("new-phonetic-input");
    const transInput = document.getElementById("new-translation-input");
    const catSelect = document.getElementById("new-category-select");
    const catCustom = document.getElementById("new-category-custom-input");
    const exEngInput = document.getElementById("new-example-eng-input");
    const exUzbInput = document.getElementById("new-example-uzb-input");

    const word = wordInput.value.trim();
    const translation = transInput.value.trim();

    if (!word || !translation) {
      alert("Iltimos, inglizcha so'z va uning tarjimasini kiriting!");
      return;
    }

    let category = catCustom.value.trim() || catSelect.value;
    if (!category || category === "__custom__") {
      category = "Umumiy";
    }

    const newWord = StorageManager.addWord({
      word,
      phonetic: phoneticInput.value.trim() || `/${word.toLowerCase()}/`,
      translation,
      category,
      exampleEng: exEngInput.value.trim(),
      exampleUzb: exUzbInput.value.trim()
    });

    this.closeAddWordModal();
    this.showToast(`"${newWord.word}" muvaffaqiyatli qo'shildi! 🚀`, "success");

    // Yangi qo'shilgan so'zni ko'rsatish uchun Flesh-kartani unga sozlash
    this.refreshFlashcardsList();
    this.currentCardIndex = 0;
    this.renderFlashcard();
  },

  /* ==================== TEST & MASHQ (QUIZ) ==================== */
  startNewQuiz() {
    const countSelect = document.getElementById("quiz-count-select");
    const modeSelect = document.getElementById("quiz-mode-select");
    const filterSelect = document.getElementById("quiz-filter-select");

    const count = parseInt(countSelect.value, 10);
    const mode = modeSelect.value;
    const filter = filterSelect.value;

    const started = QuizManager.startQuiz({ count, mode, filter });
    if (started) {
      document.getElementById("quiz-setup-panel").classList.add("hidden");
      document.getElementById("quiz-active-container").classList.remove("hidden");
    }
  },

  cancelQuiz() {
    if (confirm("Testni to'xtatmoqchimisiz?")) {
      document.getElementById("quiz-setup-panel").classList.remove("hidden");
      document.getElementById("quiz-active-container").classList.add("hidden");
      this.updateQuizPanelStats();
    }
  },

  updateQuizPanelStats() {
    const stats = StorageManager.getQuizStats();
    const roundsEl = document.getElementById("quiz-stat-rounds");
    const bestEl = document.getElementById("quiz-stat-best");
    const streakEl = document.getElementById("quiz-stat-streak");

    if (roundsEl) roundsEl.textContent = stats.totalRounds;
    if (bestEl) bestEl.textContent = `${stats.bestScore}%`;
    if (streakEl) streakEl.textContent = `${stats.bestStreak} 🔥`;
  },

  restartQuizFromModal() {
    this.closeQuizResultModal();
    this.startNewQuiz();
  },

  closeQuizResultModal() {
    const modal = document.getElementById("quiz-result-modal");
    if (modal) modal.classList.add("hidden");
    document.getElementById("quiz-setup-panel").classList.remove("hidden");
    document.getElementById("quiz-active-container").classList.add("hidden");
    this.updateQuizPanelStats();
  },

  /* ==================== SOZLAMALAR VA ZAXIRA ==================== */
  openSettingsModal() {
    const modal = document.getElementById("settings-modal");
    if (modal) modal.classList.remove("hidden");
  },

  closeSettingsModal() {
    const modal = document.getElementById("settings-modal");
    if (modal) modal.classList.add("hidden");
  },

  toggleSoundEffects(enabled) {
    AudioManager.soundEffectsEnabled = enabled;
    this.showToast(enabled ? "Tovush effektlari yoqildi 🔔" : "Tovush effektlari o'chirildi 🔕", "info");
  },

  handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const success = StorageManager.importData(content);
      if (success) {
        this.closeSettingsModal();
        this.showToast("Zaxira ma'lumotlari muvaffaqiyatli tiklandi! 📥", "success");
      } else {
        alert("Faylni o'qishda xatolik yuz berdi! Fayl formati noto'g'ri.");
      }
    };
    reader.readAsText(file);
  },

  confirmResetAll() {
    if (confirm("DIQQAT: Barcha qo'shilgan so'zlar va test natijalari o'chirilib, dastlabki 32 ta so'z tiklanadi. Davom etasizmi?")) {
      StorageManager.resetAll();
      this.closeSettingsModal();
      this.showToast("Standart lug'at to'liq tiklandi! 🔄", "info");
    }
  },

  /* ==================== TOAST XABARNOMALAR ==================== */
  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    const bgClass = type === "success" 
      ? "bg-emerald-600 text-white shadow-emerald-500/20" 
      : type === "error" 
      ? "bg-rose-600 text-white shadow-rose-500/20" 
      : "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-slate-900/20";

    toast.className = `pointer-events-auto px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold shadow-xl flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 ${bgClass}`;
    toast.innerHTML = `<span>${this.escapeHtml(message)}</span>`;

    container.appendChild(toast);

    // Kirish animatsiyasi
    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-2", "opacity-0");
    });

    // 3 soniyadan so'ng yo'qolish
    setTimeout(() => {
      toast.classList.add("translate-y-2", "opacity-0");
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 300);
    }, 3000);
  },

  /* ==================== ADMIN PANEL ==================== */
  adminSearchQuery: "",
  adminTypeFilter: "all",

  scrollToAdminAddForm() {
    const form = document.getElementById("admin-add-form-container");
    if (form) {
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      const wordInput = document.getElementById("admin-new-word");
      if (wordInput) wordInput.focus();
    }
  },

  onAdminCategorySelectChange(val) {
    const customInput = document.getElementById("admin-new-category-custom");
    if (!customInput) return;

    if (val === "__custom__") {
      customInput.focus();
      customInput.required = true;
    } else {
      customInput.value = "";
      customInput.required = false;
    }
  },

  handleAdminAddWordSubmit(e) {
    e.preventDefault();

    const wordInput = document.getElementById("admin-new-word");
    const phoneticInput = document.getElementById("admin-new-phonetic");
    const transInput = document.getElementById("admin-new-translation");
    const catSelect = document.getElementById("admin-new-category-select");
    const catCustom = document.getElementById("admin-new-category-custom");
    const exEngInput = document.getElementById("admin-new-example-eng");
    const exUzbInput = document.getElementById("admin-new-example-uzb");

    const word = wordInput.value.trim();
    const translation = transInput.value.trim();

    if (!word || !translation) {
      alert("Iltimos, inglizcha so'z va uning tarjimasini kiriting!");
      return;
    }

    let category = catCustom.value.trim() || catSelect.value;
    if (!category || category === "__custom__") {
      category = "Umumiy";
    }

    const newWord = StorageManager.addWord({
      word,
      phonetic: phoneticInput.value.trim() || `/${word.toLowerCase()}/`,
      translation,
      category,
      exampleEng: exEngInput.value.trim(),
      exampleUzb: exUzbInput.value.trim()
    });

    // Formani tozalash
    document.getElementById("admin-add-word-form").reset();
    
    this.showToast(`"${newWord.word}" muvaffaqiyatli qo'shildi! 🚀`, "success");
    this.updateAdminStats();
    this.renderAdminWordsTable();
  },

  onAdminSearchInput(query) {
    this.adminSearchQuery = query.trim().toLowerCase();
    this.renderAdminWordsTable();
  },

  onAdminTypeFilterChange(type) {
    this.adminTypeFilter = type;
    this.renderAdminWordsTable();
  },

  getAdminFilteredWords() {
    let list = StorageManager.getWords();

    // Qidiruv filtri
    if (this.adminSearchQuery) {
      const q = this.adminSearchQuery;
      list = list.filter(w => 
        w.word.toLowerCase().includes(q) ||
        w.translation.toLowerCase().includes(q) ||
        (w.category && w.category.toLowerCase().includes(q))
      );
    }

    // Turi bo'yicha filter
    if (this.adminTypeFilter === "user") {
      list = list.filter(w => !w.id.startsWith("word-"));
    } else if (this.adminTypeFilter === "default") {
      list = list.filter(w => w.id.startsWith("word-"));
    }

    return list;
  },

  renderAdminWordsTable() {
    const container = document.getElementById("admin-words-table-container");
    const countBadge = document.getElementById("admin-table-count-badge");
    if (!container) return;

    const filtered = this.getAdminFilteredWords();

    if (countBadge) countBadge.textContent = `${filtered.length} ta`;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-slate-500 dark:text-slate-400">
          <p class="text-sm">Hech qanday so'z topilmadi</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <table class="w-full text-left text-xs sm:text-sm">
        <thead class="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th class="py-3 px-3 sm:px-4 font-bold">So'z</th>
            <th class="py-3 px-3 sm:px-4 font-bold hidden sm:table-cell">Tarjima</th>
            <th class="py-3 px-3 sm:px-4 font-bold">Kategoriya</th>
            <th class="py-3 px-3 sm:px-4 font-bold">Turi</th>
            <th class="py-3 px-3 sm:px-4 font-bold text-right">Amallar</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          ${filtered.map(word => {
            const isDefault = word.id.startsWith("word-");
            return `
              <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                <td class="py-3 px-3 sm:px-4">
                  <div class="flex items-center gap-2">
                    <button onclick="AudioManager.speak('${this.escapeHtml(word.word)}')" class="p-1 text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800 rounded-lg">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
                    </button>
                    <span class="font-bold text-slate-900 dark:text-white">${this.escapeHtml(word.word)}</span>
                  </div>
                </td>
                <td class="py-3 px-3 sm:px-4 text-xs text-slate-600 dark:text-slate-400 hidden sm:table-cell max-w-xs truncate">
                  ${this.escapeHtml(word.translation)}
                </td>
                <td class="py-3 px-3 sm:px-4">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    ${this.escapeHtml(word.category)}
                  </span>
                </td>
                <td class="py-3 px-3 sm:px-4">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isDefault ? 'bg-slate-100 text-slate-600' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'}">
                    ${isDefault ? 'Standart' : 'Custom'}
                  </span>
                </td>
                <td class="py-3 px-3 sm:px-4 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button onclick="App.openEditWordModal('${word.id}')" title="Tahrirlash" class="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    ${!isDefault ? `
                      <button onclick="App.deleteWordConfirm('${word.id}', '${this.escapeHtml(word.word)}')" title="O'chirish" class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;
  },

  updateAdminStats() {
    const allWords = StorageManager.getWords();
    const userWords = allWords.filter(w => !w.id.startsWith("word-"));
    const defaultWords = allWords.filter(w => w.id.startsWith("word-"));
    const statusMap = StorageManager.getStatusMap();
    const learnedCount = allWords.filter(w => statusMap[w.id] === "learned").length;
    const learnedPct = allWords.length > 0 ? Math.round((learnedCount / allWords.length) * 100) : 0;

    const totalEl = document.getElementById("admin-stat-total");
    const userEl = document.getElementById("admin-stat-user");
    const defaultEl = document.getElementById("admin-stat-default");
    const learnedEl = document.getElementById("admin-stat-learned");
    const learnedPctEl = document.getElementById("admin-stat-learned-pct");

    if (totalEl) totalEl.textContent = allWords.length;
    if (userEl) userEl.textContent = userWords.length;
    if (defaultEl) defaultEl.textContent = defaultWords.length;
    if (learnedEl) learnedEl.textContent = learnedCount;
    if (learnedPctEl) learnedPctEl.textContent = `${learnedPct}%`;
  },

  /* ==================== SO'ZNI TAHRIRLASH ==================== */
  openEditWordModal(id) {
    const word = StorageManager.getWords().find(w => w.id === id);
    if (!word) return;

    const modal = document.getElementById("edit-word-modal");
    if (!modal) return;

    // Formani to'ldirish
    document.getElementById("edit-word-id").value = word.id;
    document.getElementById("edit-word-input").value = word.word;
    document.getElementById("edit-phonetic-input").value = word.phonetic || "";
    document.getElementById("edit-translation-input").value = word.translation;
    document.getElementById("edit-example-eng-input").value = word.exampleEng || "";
    document.getElementById("edit-example-uzb-input").value = word.exampleUzb || "";

    // Kategoriya selectni to'ldirish
    const catSelect = document.getElementById("edit-category-select");
    const categories = this.getAllCategories().filter(c => c !== "Barchasi");
    catSelect.innerHTML = categories.map(c => 
      `<option value="${c}" ${c === word.category ? 'selected' : ''}>${c}</option>`
    ).join("");
    catSelect.innerHTML += `<option value="__custom__">+ Boshqa kategoriya</option>`;

    document.getElementById("edit-category-custom-input").value = "";

    modal.classList.remove("hidden");
  },

  closeEditWordModal() {
    const modal = document.getElementById("edit-word-modal");
    if (modal) modal.classList.add("hidden");
    document.getElementById("edit-word-form").reset();
  },

  onEditCategorySelectChange(val) {
    const customInput = document.getElementById("edit-category-custom-input");
    if (!customInput) return;

    if (val === "__custom__") {
      customInput.focus();
      customInput.required = true;
    } else {
      customInput.value = "";
      customInput.required = false;
    }
  },

  handleEditWordSubmit(e) {
    e.preventDefault();

    const id = document.getElementById("edit-word-id").value;
    const word = document.getElementById("edit-word-input").value.trim();
    const phonetic = document.getElementById("edit-phonetic-input").value.trim();
    const translation = document.getElementById("edit-translation-input").value.trim();
    const catSelect = document.getElementById("edit-category-select");
    const catCustom = document.getElementById("edit-category-custom-input");
    const exampleEng = document.getElementById("edit-example-eng-input").value.trim();
    const exampleUzb = document.getElementById("edit-example-uzb-input").value.trim();

    if (!word || !translation) {
      alert("Iltimos, inglizcha so'z va tarjimasini kiriting!");
      return;
    }

    let category = catCustom.value.trim() || catSelect.value;
    if (!category || category === "__custom__") {
      category = "Umumiy";
    }

    StorageManager.updateWord(id, {
      word,
      phonetic,
      translation,
      category,
      exampleEng,
      exampleUzb
    });

    this.closeEditWordModal();
    this.showToast(`"${word}" yangilandi! ✏️`, "success");
    this.updateAdminStats();
    this.renderAdminWordsTable();
  },

  /* ==================== KLAVIATURA HODISALARI ==================== */
  initKeyboardListeners() {
    window.addEventListener("keydown", (e) => {
      // Agar foydalanuvchi input yoki textarea da yozayotgan bo'lsa, tugmalarni e'tiborsiz qoldirish
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
        return;
      }

      // Flesh-karta bo'limida bo'lsa
      if (this.activeTab === "flashcards") {
        if (e.code === "Space") {
          e.preventDefault();
          this.toggleCardFlip();
        } else if (e.code === "ArrowLeft") {
          e.preventDefault();
          this.prevCard();
        } else if (e.code === "ArrowRight") {
          e.preventDefault();
          this.nextCard();
        } else if (e.key === "1") {
          this.markCurrentCardStatus("learning");
        } else if (e.key === "2") {
          this.markCurrentCardStatus("learned");
        }
      }

      // Test bo'limida bo'lsa (A, B, C, D yoki 1, 2, 3, 4 variantlarini tanlash)
      if (this.activeTab === "quiz" && !QuizManager.isAnswered) {
        const keyMap = { "1": 0, "2": 1, "3": 2, "4": 3, "a": 0, "b": 1, "c": 2, "d": 3 };
        const key = e.key.toLowerCase();
        if (key in keyMap) {
          const index = keyMap[key];
          const optionsGrid = document.getElementById("quiz-options-grid");
          if (optionsGrid) {
            const buttons = optionsGrid.querySelectorAll("button");
            if (buttons[index]) {
              buttons[index].click();
            }
          }
        }
      }
    });
  },

  escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};

// DOM tayyor bo'lganda ishga tushirish
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
