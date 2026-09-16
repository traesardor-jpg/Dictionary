/**
 * dictionary Eng-Uzb - Ko'p Tanlovli Test (Quiz) Moduli
 * 4 ta variantli mashq, jonli statistika, tovush effektlari va xatolar ustida ishlash
 */

const QuizManager = {
  questions: [],
  currentIndex: 0,
  score: 0,
  currentStreak: 0,
  maxStreak: 0,
  totalQuestionsCount: 10,
  selectedCategory: "Barchasi",
  filterMode: "all", // 'all' | 'learning'
  quizMode: "eng_to_uzb", // 'eng_to_uzb' | 'uzb_to_eng' | 'mixed'
  isAnswered: false,
  roundHistory: [], // { question, isCorrect, selectedOption, correctOption }

  /**
   * Yangi test raundini boshlash
   */
  startQuiz(options = {}) {
    this.totalQuestionsCount = options.count || 10;
    this.selectedCategory = options.category || "Barchasi";
    this.filterMode = options.filter || "all";
    this.quizMode = options.mode || "eng_to_uzb";

    let wordsPool = StorageManager.getWords();
    const statusMap = StorageManager.getStatusMap();

    // Kategoriya filtri
    if (this.selectedCategory !== "Barchasi") {
      wordsPool = wordsPool.filter(w => w.category === this.selectedCategory);
    }

    // Status filtri
    if (this.filterMode === "learning") {
      wordsPool = wordsPool.filter(w => statusMap[w.id] !== "learned");
    }

    // Kamida 4 ta so'z bo'lishi kerak
    if (wordsPool.length < 4) {
      // Agar tanlangan bo'yicha kam bo'lsa, umumiy so'zlar bazasidan foydalanamiz
      wordsPool = StorageManager.getWords();
    }

    if (wordsPool.length < 4) {
      alert("Test o'tkazish uchun lug'atda kamida 4 ta so'z bo'lishi kerak!");
      return false;
    }

    // Savollarni shakllantirish
    const shuffledPool = this.shuffleArray([...wordsPool]);
    const questionsCount = Math.min(this.totalQuestionsCount, shuffledPool.length);
    const chosenWords = shuffledPool.slice(0, questionsCount);

    this.questions = chosenWords.map(word => {
      // Savol turi: eng_to_uzb yoki uzb_to_eng
      let type = this.quizMode;
      if (type === "mixed") {
        type = Math.random() > 0.5 ? "eng_to_uzb" : "uzb_to_eng";
      }

      // Variantlar tayyorlash: 1 ta to'g'ri, 3 ta noto'g'ri distractor
      const allWordsExceptCurrent = StorageManager.getWords().filter(w => w.id !== word.id);
      const randomDistractors = this.shuffleArray(allWordsExceptCurrent).slice(0, 3);
      const candidateList = this.shuffleArray([word, ...randomDistractors]);

      const options = candidateList.map(cand => {
        return {
          id: cand.id,
          text: type === "eng_to_uzb" ? cand.translation : cand.word,
          isCorrect: cand.id === word.id,
          wordObj: cand
        };
      });

      return {
        word,
        type,
        questionText: type === "eng_to_uzb" ? word.word : word.translation,
        questionHint: type === "eng_to_uzb" ? word.phonetic : "Inglizcha tarjimasini toping",
        correctText: type === "eng_to_uzb" ? word.translation : word.word,
        options
      };
    });

    this.currentIndex = 0;
    this.score = 0;
    this.currentStreak = 0;
    this.maxStreak = 0;
    this.isAnswered = false;
    this.roundHistory = [];

    this.renderCurrentQuestion();
    return true;
  },

  /**
   * Massivni Fisher-Yates usulida tasodifiy aralashtirish
   */
  shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  },

  /**
   * Hozirgi savolni UI da chizish
   */
  renderCurrentQuestion() {
    const container = document.getElementById("quiz-card-container");
    const emptyNotice = document.getElementById("quiz-empty-notice");
    if (!container) return;

    if (!this.questions || this.questions.length === 0 || this.currentIndex >= this.questions.length) {
      if (emptyNotice) emptyNotice.classList.remove("hidden");
      container.classList.add("hidden");
      return;
    }

    if (emptyNotice) emptyNotice.classList.add("hidden");
    container.classList.remove("hidden");

    this.isAnswered = false;
    const currentQ = this.questions[this.currentIndex];

    // Savol raqami va progress
    const currentNumEl = document.getElementById("quiz-current-num");
    const totalNumEl = document.getElementById("quiz-total-num");
    const progressBar = document.getElementById("quiz-progress-bar");
    const scoreEl = document.getElementById("quiz-live-score");
    const streakEl = document.getElementById("quiz-live-streak");

    if (currentNumEl) currentNumEl.textContent = this.currentIndex + 1;
    if (totalNumEl) totalNumEl.textContent = this.questions.length;
    if (progressBar) {
      const pct = ((this.currentIndex) / this.questions.length) * 100;
      progressBar.style.width = `${pct}%`;
    }
    if (scoreEl) scoreEl.textContent = this.score;
    if (streakEl) streakEl.textContent = this.currentStreak;

    // Savol matni
    const questionWordEl = document.getElementById("quiz-question-word");
    const questionPhoneticEl = document.getElementById("quiz-question-phonetic");
    const questionCategoryEl = document.getElementById("quiz-question-category");
    const questionAudioBtn = document.getElementById("quiz-audio-btn");

    if (questionWordEl) questionWordEl.textContent = currentQ.questionText;
    if (questionPhoneticEl) questionPhoneticEl.textContent = currentQ.questionHint;
    if (questionCategoryEl) questionCategoryEl.textContent = currentQ.word.category;

    if (questionAudioBtn) {
      questionAudioBtn.onclick = (e) => {
        e.stopPropagation();
        AudioManager.speak(currentQ.word.word);
      };
    }

    // Izoh / misol paneli (dastlab yashiriladi)
    const feedbackBox = document.getElementById("quiz-feedback-box");
    if (feedbackBox) {
      feedbackBox.classList.add("hidden");
      feedbackBox.innerHTML = "";
    }

    // "Keyingi savol" tugmasini yashirish
    const nextBtn = document.getElementById("quiz-next-btn");
    if (nextBtn) {
      nextBtn.classList.add("hidden");
    }

    // 4 ta variant tugmalarini chizish
    const optionsGrid = document.getElementById("quiz-options-grid");
    if (!optionsGrid) return;
    optionsGrid.innerHTML = "";

    const keyLabels = ["A", "B", "C", "D"];

    currentQ.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = `group relative flex items-center p-4 text-left rounded-2xl border-2 transition-all duration-200 
        bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 
        hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md active:scale-[0.99]
        text-slate-800 dark:text-slate-100 font-medium`;
      btn.dataset.index = idx;
      btn.dataset.isCorrect = opt.isCorrect;

      btn.innerHTML = `
        <span class="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700/70 
          text-slate-600 dark:text-slate-300 font-bold text-sm mr-3.5 transition-colors group-hover:bg-indigo-100 
          group-hover:text-indigo-600 dark:group-hover:bg-indigo-900/60 dark:group-hover:text-indigo-300">
          ${keyLabels[idx]}
        </span>
        <span class="flex-1 text-base sm:text-lg leading-snug">${this.escapeHtml(opt.text)}</span>
        <span class="status-icon ml-2 hidden"></span>
      `;

      btn.onclick = () => this.handleAnswer(opt, btn);
      optionsGrid.appendChild(btn);
    });

    // Avtomatik inglizcha so'z bo'lsa audio yangrashi (agar so'z inglizcha bo'lsa)
    if (currentQ.type === "eng_to_uzb") {
      setTimeout(() => {
        AudioManager.speak(currentQ.word.word);
      }, 200);
    }
  },

  /**
   * Javob variantini tanlaganda
   */
  handleAnswer(selectedOption, clickedBtn) {
    if (this.isAnswered) return;
    this.isAnswered = true;

    const currentQ = this.questions[this.currentIndex];
    const isCorrect = selectedOption.isCorrect;
    const optionsGrid = document.getElementById("quiz-options-grid");
    const allButtons = optionsGrid.querySelectorAll("button");

    if (isCorrect) {
      this.score += 1;
      this.currentStreak += 1;
      if (this.currentStreak > this.maxStreak) {
        this.maxStreak = this.currentStreak;
      }
      AudioManager.playCorrectSound();

      clickedBtn.classList.remove("border-slate-200", "dark:border-slate-700", "hover:border-indigo-400");
      clickedBtn.classList.add("bg-emerald-50", "dark:bg-emerald-950/40", "border-emerald-500", "text-emerald-900", "dark:text-emerald-200");
      
      const badge = clickedBtn.querySelector("span:first-child");
      badge.classList.remove("bg-slate-100", "dark:bg-slate-700/70", "text-slate-600");
      badge.classList.add("bg-emerald-500", "text-white");

      const icon = clickedBtn.querySelector(".status-icon");
      icon.innerHTML = `<svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>`;
      icon.classList.remove("hidden");

      // So'z holatini o'rganilgan deb qayd etish taklifi
      StorageManager.setStatus(currentQ.word.id, "learned");
    } else {
      this.currentStreak = 0;
      AudioManager.playWrongSound();

      clickedBtn.classList.remove("border-slate-200", "dark:border-slate-700");
      clickedBtn.classList.add("bg-rose-50", "dark:bg-rose-950/40", "border-rose-500", "text-rose-900", "dark:text-rose-200");

      const badge = clickedBtn.querySelector("span:first-child");
      badge.classList.remove("bg-slate-100", "dark:bg-slate-700/70", "text-slate-600");
      badge.classList.add("bg-rose-500", "text-white");

      const icon = clickedBtn.querySelector(".status-icon");
      icon.innerHTML = `<svg class="w-6 h-6 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>`;
      icon.classList.remove("hidden");

      // To'g'ri javobni yashil bilan ochib ko'rsatish
      allButtons.forEach(btn => {
        if (btn.dataset.isCorrect === "true") {
          btn.classList.add("bg-emerald-50/70", "dark:bg-emerald-950/30", "border-emerald-500/80", "text-emerald-900", "dark:text-emerald-200");
          const correctBadge = btn.querySelector("span:first-child");
          correctBadge.classList.add("bg-emerald-500", "text-white");
        }
      });
    }

    // Barcha tugmalarni nofaol qilish
    allButtons.forEach(btn => {
      btn.disabled = true;
      btn.classList.add("cursor-default");
    });

    // Raund tarixiga qo'shish
    this.roundHistory.push({
      question: currentQ,
      isCorrect,
      selectedOption,
      correctOption: currentQ.options.find(o => o.isCorrect)
    });

    // Score va streak ni yangilash
    const scoreEl = document.getElementById("quiz-live-score");
    const streakEl = document.getElementById("quiz-live-streak");
    if (scoreEl) scoreEl.textContent = this.score;
    if (streakEl) streakEl.textContent = this.currentStreak;

    // So'z haqida to'liq tushuntirish va misol gapni ko'rsatish
    const feedbackBox = document.getElementById("quiz-feedback-box");
    if (feedbackBox) {
      feedbackBox.classList.remove("hidden");
      feedbackBox.innerHTML = `
        <div class="p-4 rounded-xl ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700'}">
          <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-slate-900 dark:text-white text-base">
              ${currentQ.word.word} <span class="text-xs font-normal text-slate-500 font-mono">${currentQ.word.phonetic}</span>
            </span>
            <button onclick="AudioManager.speak('${currentQ.word.word}')" class="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
            </button>
          </div>
          <p class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Tarjimasi: <span class="text-indigo-600 dark:text-indigo-400">${currentQ.word.translation}</span>
          </p>
          ${currentQ.word.exampleEng ? `
            <div class="text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700/60 pt-2 mt-2">
              <p class="italic text-slate-800 dark:text-slate-200">"${currentQ.word.exampleEng}"</p>
              <p class="text-slate-500 dark:text-slate-400 mt-0.5">"${currentQ.word.exampleUzb}"</p>
            </div>
          ` : ""}
        </div>
      `;
    }

    // "Keyingi" tugmasini ko'rsatish
    const nextBtn = document.getElementById("quiz-next-btn");
    if (nextBtn) {
      nextBtn.classList.remove("hidden");
      const isLast = this.currentIndex === this.questions.length - 1;
      nextBtn.innerHTML = isLast 
        ? `Natijalarni ko'rish <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
        : `Keyingi savol <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>`;
    }
  },

  /**
   * Keyingi savolga o'tish yoki yakunlash
   */
  nextQuestion() {
    this.currentIndex += 1;
    if (this.currentIndex < this.questions.length) {
      this.renderCurrentQuestion();
    } else {
      this.finishQuiz();
    }
  },

  /**
   * Testni yakunlash va natija oynasini ko'rsatish
   */
  finishQuiz() {
    const total = this.questions.length;
    const correct = this.score;
    const percent = Math.round((correct / total) * 100);

    // Statistikani saqlash
    StorageManager.recordQuizResult(correct, total, this.maxStreak);

    // G'alaba yoki tugash ovozi
    if (percent >= 70) {
      AudioManager.playCelebrationSound();
      if (typeof confetti === "function") {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore
        }
      }
    }

    // Natijalar modalini ko'rsatish
    const modal = document.getElementById("quiz-result-modal");
    if (!modal) return;

    const percentEl = document.getElementById("result-percent");
    const scoreTextEl = document.getElementById("result-score-text");
    const titleEl = document.getElementById("result-title");
    const descEl = document.getElementById("result-desc");
    const maxStreakEl = document.getElementById("result-max-streak");
    const mistakesListEl = document.getElementById("result-mistakes-list");

    if (percentEl) percentEl.textContent = `${percent}%`;
    if (scoreTextEl) scoreTextEl.textContent = `${correct} / ${total} ta to'g'ri javob`;
    if (maxStreakEl) maxStreakEl.textContent = this.maxStreak;

    if (titleEl && descEl) {
      if (percent === 100) {
        titleEl.textContent = "A'lo natija! 🏆";
        descEl.textContent = "Siz barcha savollarga xatosiz to'g'ri javob berdingiz!";
      } else if (percent >= 80) {
        titleEl.textContent = "Juda yaxshi! 🌟";
        descEl.textContent = "Lug'at boyligingiz ajoyib darajada o'smoqda!";
      } else if (percent >= 50) {
        titleEl.textContent = "Yaxshi urinish! 👍";
        descEl.textContent = "Biroz mashq qilsangiz, natijangiz yanada yaxshilanadi.";
      } else {
        titleEl.textContent = "Harakatdan to'xtamang! 💪";
        descEl.textContent = "So'zlarni yana bir bor flesh-kartalar orqali takrorlab ko'ring.";
      }
    }

    // Noto'g'ri javob berilgan so'zlar ro'yxati
    const mistakes = this.roundHistory.filter(h => !h.isCorrect);
    if (mistakesListEl) {
      if (mistakes.length > 0) {
        mistakesListEl.innerHTML = `
          <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Qayta takrorlash tavsiya etiladigan so'zlar:</h4>
          <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            ${mistakes.map(m => `
              <div class="flex items-center justify-between p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-xs">
                <div>
                  <span class="font-bold text-rose-900 dark:text-rose-200">${m.question.word.word}</span>
                  <span class="text-slate-500 dark:text-slate-400 ml-1.5">— ${m.question.word.translation}</span>
                </div>
                <button onclick="AudioManager.speak('${m.question.word.word}')" class="text-rose-600 hover:text-rose-800 dark:text-rose-400 p-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
                </button>
              </div>
            `).join("")}
          </div>
        `;
        mistakesListEl.classList.remove("hidden");
      } else {
        mistakesListEl.innerHTML = "";
        mistakesListEl.classList.add("hidden");
      }
    }

    modal.classList.remove("hidden");
  },

  /**
   * HTML maxsus belgilarini xavfsiz qilish
   */
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
