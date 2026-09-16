/**
 * dictionary Eng-Uzb - Audio va Ovoz Boshqaruvi Moduli
 * 1. window.speechSynthesis orqali inglizcha so'z va gaplarni tabiiy talaffuz qilish
 * 2. Web Audio API orqali test va interaktiv tovush effektlari (hech qanday tashqi audio fayllarsiz)
 */

const AudioManager = {
  synth: window.speechSynthesis || null,
  audioCtx: null,
  englishVoice: null,
  soundEffectsEnabled: true,
  speechRate: 0.9, // Biroz sekinroq va aniqroq talaffuz uchun

  /**
   * Modulni initsializatsiya qilish
   */
  init() {
    if (this.synth) {
      // Ovozlar yuklanganda eng yaxshi ingliz ovozini topish
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
      this.loadVoices();
    }
  },

  /**
   * Ovozlar ro'yxatini yuklash va inglizcha ovozni tanlash
   */
  loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // 1. Google US English yoki Natural/Premium inglizcha ovozlar
    this.englishVoice = voices.find(v => (v.lang === "en-US" || v.lang.startsWith("en")) && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha"))) 
      || voices.find(v => v.lang === "en-US")
      || voices.find(v => v.lang.startsWith("en"))
      || voices[0];
  },

  /**
   * Berilgan matnni (so'z yoki gap) talaffuz qilish
   * @param {string} text - Talaffuz qilinadigan matn
   * @param {Function} [onStart] - Boshlanganda chaqiriladigan funksiya
   * @param {Function} [onEnd] - Tugaganda chaqiriladigan funksiya
   */
  speak(text, onStart, onEnd) {
    if (!this.synth) {
      console.warn("SpeechSynthesis brauzerda qo'llab-quvvatlanmaydi.");
      if (onEnd) onEnd();
      return;
    }

    // Oldingi aytilayotgan tovushni to'xtatish
    this.synth.cancel();

    if (!text || typeof text !== "string") return;

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = "en-US";
    utterance.rate = this.speechRate;
    utterance.pitch = 1.0;

    if (this.englishVoice) {
      utterance.voice = this.englishVoice;
    }

    if (onStart) utterance.onstart = onStart;
    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = (e) => {
      console.warn("Talaffuz qilishda xatolik yuz berdi:", e);
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  },

  /**
   * Web Audio Context ni boshlash
   */
  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  },

  /**
   * To'g'ri javob uchun yoqimli ohang (Positive Chime)
   */
  playCorrectSound() {
    if (!this.soundEffectsEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // 1-nota: E5 (659.25 Hz), 2-nota: B5 (987.77 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, now);
      osc1.frequency.exponentialRampToValueAtTime(987.77, now + 0.18);

      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.35);
    } catch (e) {
      console.warn("Audio effekti ijrosida xato:", e);
    }
  },

  /**
   * Noto'g'ri javob uchun ohang (Gentle Error Thud)
   */
  playWrongSound() {
    if (!this.soundEffectsEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn("Audio effekti ijrosida xato:", e);
    }
  },

  /**
   * Karta burilish effekti (Flip Swoosh)
   */
  playFlipSound() {
    if (!this.soundEffectsEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.08);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      // ignore
    }
  },

  /**
   * G'alaba yoki test tugashi ohangi (Victory Arpeggio)
   */
  playCelebrationSound() {
    if (!this.soundEffectsEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.1;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.15, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.35);
      });
    } catch (e) {
      // ignore
    }
  }
};

// Sahifa ochilishi bilan ovoz tizimini ishga tushirish
AudioManager.init();
