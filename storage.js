/**
 * dictionary Eng-Uzb - LocalStorage Boshqaruv Moduli
 * Brauzer xotirasida barcha ma'lumotlarni saqlash, yangilash va o'qish
 */

const STORAGE_KEYS = {
  WORDS: "eng_uzb_dictionary_words",
  STATUS: "eng_uzb_word_status_map",
  STATS: "eng_uzb_quiz_statistics",
  THEME: "eng_uzb_theme_preference"
};

const StorageManager = {
  /**
   * Barcha so'zlarni olish. Agar bo'sh bo'lsa, standart so'zlarni yuklaydi.
   * @returns {Array} So'zlar massivi
   */
  getWords() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORDS);
      if (!data) {
        this.saveWords(DEFAULT_WORDS);
        return [...DEFAULT_WORDS];
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_WORDS];
    } catch (e) {
      console.error("So'zlarni yuklashda xatolik:", e);
      return [...DEFAULT_WORDS];
    }
  },

  /**
   * So'zlar massivini LocalStorage ga saqlash
   * @param {Array} words
   */
  saveWords(words) {
    try {
      localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words));
      window.dispatchEvent(new CustomEvent("dictionary_updated", { detail: { words } }));
    } catch (e) {
      console.error("So'zlarni saqlashda xatolik:", e);
    }
  },

  /**
   * Yangi so'z qo'shish
   * @param {Object} wordData
   * @returns {Object} Qo'shilgan so'z
   */
  addWord(wordData) {
    const words = this.getWords();
    const newWord = {
      id: "custom-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      word: wordData.word.trim(),
      phonetic: wordData.phonetic ? wordData.phonetic.trim() : `/${wordData.word.toLowerCase().trim()}/`,
      translation: wordData.translation.trim(),
      exampleEng: wordData.exampleEng ? wordData.exampleEng.trim() : "",
      exampleUzb: wordData.exampleUzb ? wordData.exampleUzb.trim() : "",
      category: wordData.category ? wordData.category.trim() : "Umumiy",
      createdAt: Date.now()
    };

    words.unshift(newWord);
    this.saveWords(words);
    this.setStatus(newWord.id, "learning");
    return newWord;
  },

  /**
   * Mavjud so'zni yangilash
   * @param {string} id
   * @param {Object} updatedFields
   * @returns {boolean}
   */
  updateWord(id, updatedFields) {
    const words = this.getWords();
    const index = words.findIndex(w => w.id === id);
    if (index === -1) return false;

    words[index] = { ...words[index], ...updatedFields };
    this.saveWords(words);
    return true;
  },

  /**
   * So'zni o'chirish
   * @param {string} id
   * @returns {boolean}
   */
  deleteWord(id) {
    let words = this.getWords();
    const initialLen = words.length;
    words = words.filter(w => w.id !== id);
    if (words.length !== initialLen) {
      this.saveWords(words);
      // Statusni ham tozalash
      const statusMap = this.getStatusMap();
      delete statusMap[id];
      this.saveStatusMap(statusMap);
      return true;
    }
    return false;
  },

  /**
   * So'zlarning o'rganilganlik holatlari xaritasini olish
   * @returns {Object} { [wordId]: 'learned' | 'learning' }
   */
  getStatusMap() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATUS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error("Statuslarni yuklashda xatolik:", e);
      return {};
    }
  },

  /**
   * Status xaritasini saqlash
   * @param {Object} map
   */
  saveStatusMap(map) {
    try {
      localStorage.setItem(STORAGE_KEYS.STATUS, JSON.stringify(map));
      window.dispatchEvent(new CustomEvent("status_updated", { detail: { map } }));
    } catch (e) {
      console.error("Statuslarni saqlashda xatolik:", e);
    }
  },

  /**
   * Bitta so'zning holatini olish
   * @param {string} id
   * @returns {'learned' | 'learning'}
   */
  getStatus(id) {
    const map = this.getStatusMap();
    return map[id] || "learning";
  },

  /**
   * So'zning holatini yangilash ('learned' yoki 'learning')
   * @param {string} id
   * @param {'learned' | 'learning'} status
   */
  setStatus(id, status) {
    const map = this.getStatusMap();
    map[id] = status;
    this.saveStatusMap(map);
  },

  /**
   * So'zning holatini teskarisiga almashtirish (toggle)
   * @param {string} id
   * @returns {'learned' | 'learning'} yangi holat
   */
  toggleStatus(id) {
    const current = this.getStatus(id);
    const next = current === "learned" ? "learning" : "learned";
    this.setStatus(id, next);
    return next;
  },

  /**
   * Umumiy o'rganish progressi statistikasi
   * @returns {Object} { total, learnedCount, learningCount, percent }
   */
  getProgress() {
    const words = this.getWords();
    const statusMap = this.getStatusMap();
    const total = words.length;
    let learnedCount = 0;

    words.forEach(w => {
      if (statusMap[w.id] === "learned") {
        learnedCount++;
      }
    });

    const learningCount = total - learnedCount;
    const percent = total > 0 ? Math.round((learnedCount / total) * 100) : 0;

    return { total, learnedCount, learningCount, percent };
  },

  /**
   * Test (Quiz) statistikasini olish
   * @returns {Object}
   */
  getQuizStats() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      const defaultStats = {
        totalRounds: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        bestScore: 0,
        bestStreak: 0,
        lastScore: null,
        history: []
      };
      return data ? { ...defaultStats, ...JSON.parse(data) } : defaultStats;
    } catch (e) {
      console.error("Test statistikasini olishda xatolik:", e);
      return {
        totalRounds: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        bestScore: 0,
        bestStreak: 0,
        lastScore: null,
        history: []
      };
    }
  },

  /**
   * Test natijasini saqlash
   * @param {number} correct
   * @param {number} total
   * @param {number} maxStreakInRound
   */
  recordQuizResult(correct, total, maxStreakInRound = 0) {
    try {
      const stats = this.getQuizStats();
      const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 0;

      stats.totalRounds += 1;
      stats.totalQuestions += total;
      stats.totalCorrect += correct;
      stats.totalIncorrect += (total - correct);
      if (scorePercent > stats.bestScore) {
        stats.bestScore = scorePercent;
      }
      if (maxStreakInRound > stats.bestStreak) {
        stats.bestStreak = maxStreakInRound;
      }
      stats.lastScore = {
        correct,
        total,
        percent: scorePercent,
        date: new Date().toLocaleDateString("uz-UZ") + " " + new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })
      };

      // So'nggi 10 ta o'yin tarixini saqlash
      stats.history.unshift(stats.lastScore);
      if (stats.history.length > 10) stats.history.pop();

      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
      window.dispatchEvent(new CustomEvent("stats_updated", { detail: { stats } }));
      return stats;
    } catch (e) {
      console.error("Test natijasini saqlashda xatolik:", e);
    }
  },

  /**
   * Tanlangan mavzu (light / dark)
   * @returns {'light' | 'dark'}
   */
  getTheme() {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === "dark" || saved === "light") return saved;
    // Tizim holatini tekshirish
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  },

  /**
   * Mavzuni saqlash
   * @param {'light' | 'dark'} theme
   */
  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  },

  /**
   * Admin panel uchun so'zlar turlari va soni tahlili
   * @returns {Object} { total, userCount, defaultCount, learnedCount }
   */
  getWordsBreakdown() {
    const words = this.getWords();
    const statusMap = this.getStatusMap();
    let userCount = 0;
    let learnedCount = 0;

    words.forEach(w => {
      if (w.id && w.id.startsWith("custom-")) {
        userCount++;
      }
      if (statusMap[w.id] === "learned") {
        learnedCount++;
      }
    });

    const defaultCount = words.length - userCount;
    return {
      total: words.length,
      userCount,
      defaultCount,
      learnedCount
    };
  },

  /**
   * Test statistikasini tozalash
   */
  resetQuizStats() {
    localStorage.removeItem(STORAGE_KEYS.STATS);
    window.dispatchEvent(new CustomEvent("stats_updated", { detail: { stats: this.getQuizStats() } }));
  },

  /**
   * Dastlabki standart holatga qaytarish (Reset)
   */
  resetAll() {
    this.saveWords([...DEFAULT_WORDS]);
    this.saveStatusMap({});
    localStorage.removeItem(STORAGE_KEYS.STATS);
  },

  /**
   * Barcha ma'lumotlarni JSON ko'rinishida eksport qilish
   */
  exportData() {
    const data = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      words: this.getWords(),
      statusMap: this.getStatusMap(),
      quizStats: this.getQuizStats()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dictionary-eng-uzb-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * JSON ma'lumotlarini qayta import qilish
   * @param {string} jsonString
   * @returns {boolean} Muvaffaqiyatli yoki xatolik
   */
  importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.words)) {
        throw new Error("Noto'g'ri fayl formati! 'words' massivi topilmadi.");
      }
      this.saveWords(parsed.words);
      if (parsed.statusMap) {
        this.saveStatusMap(parsed.statusMap);
      }
      if (parsed.quizStats) {
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(parsed.quizStats));
      }
      return true;
    } catch (e) {
      console.error("Import xatosi:", e);
      return false;
    }
  }
};
