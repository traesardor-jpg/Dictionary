/**
 * dictionary Eng-Uzb - Dastlabki Standart So'zlar Bazasi
 * Har bir so'zda: id, word, phonetic, translation, exampleEng, exampleUzb, category
 */

const DEFAULT_WORDS = [
  {
    id: "word-1",
    word: "Resilient",
    phonetic: "/rɪˈzɪl.jənt/",
    translation: "Matonatli, chidamli, tez tiklanuvchan",
    exampleEng: "She showed a resilient spirit in the face of immense challenges.",
    exampleUzb: "U katta qiyinchiliklar oldida matonatli va chidamli ruh namoyon qildi.",
    category: "Shaxsiyat"
  },
  {
    id: "word-2",
    word: "Accomplish",
    phonetic: "/əˈkʌm.plɪʃ/",
    translation: "Muvaffaqiyatli bajarmoq, erishmoq",
    exampleEng: "With consistent effort, you can accomplish your ambitious goals.",
    exampleUzb: "Doimiy harakat bilan siz o'z ulkan maqsadlaringizga erisha olasiz.",
    category: "Harakat"
  },
  {
    id: "word-3",
    word: "Breathtaking",
    phonetic: "/ˈbreθˌteɪ.kɪŋ/",
    translation: "Aql bovar qilmas, hayratlanarli darajada go'zal",
    exampleEng: "The view from the top of the mountain was absolutely breathtaking.",
    exampleUzb: "Tog' cho'qqisidan ko'ringan manzara aql bovar qilmas darajada go'zal edi.",
    category: "Tabiat & Sayohat"
  },
  {
    id: "word-4",
    word: "Curiosity",
    phonetic: "/ˌkjʊə.riˈɒs.ə.ti/",
    translation: "Qiziquvchanlik, bilishga bo'lgan ishtiyoq",
    exampleEng: "Scientific discoveries are driven by human curiosity and imagination.",
    exampleUzb: "Ilmiy kashfiyotlar inson qiziquvchanligi va tasavvuri tufayli yuzaga keladi.",
    category: "Ta'lim & Fan"
  },
  {
    id: "word-5",
    word: "Determine",
    phonetic: "/dɪˈtɜː.mɪn/",
    translation: "Aniqlamoq, qat'iy qaror qilmoq",
    exampleEng: "We must determine the root cause of the system error immediately.",
    exampleUzb: "Biz zudlik bilan tizim xatosining asosiy sababini aniqlashimiz kerak.",
    category: "Harakat"
  },
  {
    id: "word-6",
    word: "Empathy",
    phonetic: "/ˈem.pə.θi/",
    translation: "Hamdardlik, boshqalarning his-tuyg'ularini tushunish",
    exampleEng: "Empathy is essential for building strong and healthy relationships.",
    exampleUzb: "Hamdardlik mustahkam va samimiy munosabatlar o'rnatish uchun juda muhimdir.",
    category: "Psixologiya"
  },
  {
    id: "word-7",
    word: "Flourish",
    phonetic: "/ˈflʌr.ɪʃ/",
    translation: "Gullab-yashnamoq, ravnaq topmoq",
    exampleEng: "Small businesses flourish when local communities support them.",
    exampleUzb: "Mahalliy jamoalar qo'llab-quvvatlaganda kichik bizneslar ravnaq topadi.",
    category: "Iqtisodiyot"
  },
  {
    id: "word-8",
    word: "Gratitude",
    phonetic: "/ˈɡræt.ɪ.tʃuːd/",
    translation: "Minnatdorlik, shukronalik",
    exampleEng: "Expressing daily gratitude improves mental health and happiness.",
    exampleUzb: "Har kuni minnatdorlik bildirish ruhiy salomatlik va baxtni oshiradi.",
    category: "Psixologiya"
  },
  {
    id: "word-9",
    word: "Harmony",
    phonetic: "/ˈhɑː.mə.ni/",
    translation: "Uyg'unlik, totuvlik, hamjihatlik",
    exampleEng: "Living in harmony with nature creates sustainable living conditions.",
    exampleUzb: "Tabiat bilan uyg'unlikda yashash barqaror hayot sharoitlarini yaratadi.",
    category: "Falsafa"
  },
  {
    id: "word-10",
    word: "Inspire",
    phonetic: "/ɪnˈspaɪər/",
    translation: "Ilhomlantirmoq, ruhlantirmoq",
    exampleEng: "Her remarkable dedication inspired everyone in the team to do better.",
    exampleUzb: "Uning ajoyib fidoyiligi jamoadagi har bir kishini yaxshiroq ishlashga ruhlantirdi.",
    category: "Harakat"
  },
  {
    id: "word-11",
    word: "Journey",
    phonetic: "/ˈdʒɜː.ni/",
    translation: "Sayohat, bosib o'tilgan uzoq yo'l",
    exampleEng: "Learning a foreign language is a lifelong, rewarding journey.",
    exampleUzb: "Chet tilini o'rganish — umr bo'yi davom etadigan maroqli sayohatdir.",
    category: "Tabiat & Sayohat"
  },
  {
    id: "word-12",
    word: "Knowledge",
    phonetic: "/ˈnɒl.ɪdʒ/",
    translation: "Bilim, ma'lumot, tushuncha",
    exampleEng: "Knowledge empowers individuals to make informed decisions in life.",
    exampleUzb: "Bilim insonga hayotda o'ylab to'g'ri qarorlar qabul qilish kuchini beradi.",
    category: "Ta'lim & Fan"
  },
  {
    id: "word-13",
    word: "Luminous",
    phonetic: "/ˈluː.mɪ.nəs/",
    translation: "Yorqin, nur sochuvchi, jilvakor",
    exampleEng: "The night sky was filled with luminous stars shining brightly.",
    exampleUzb: "Tungi osmon yorqin porlab turgan nurli yulduzlarga to'la edi.",
    category: "Tabiat & Sayohat"
  },
  {
    id: "word-14",
    word: "Mindset",
    phonetic: "/ˈmaɪnd.set/",
    translation: "Fikrlash tarzi, dunyoqarash",
    exampleEng: "A growth mindset helps you see failures as opportunities to learn.",
    exampleUzb: "Rivojlanishga yo'naltirilgan dunyoqarash xatolarni o'rganish imkoniyati sifatida ko'rishga yordam beradi.",
    category: "Psixologiya"
  },
  {
    id: "word-15",
    word: "Nurture",
    phonetic: "/ˈnɜː.tʃər/",
    translation: "Parvarishlamoq, tarbiyalamoq, rivojlantirmoq",
    exampleEng: "Parents work hard to nurture creativity and kindness in their children.",
    exampleUzb: "Ota-onalar farzandlarida ijodkorlik va mehribonlikni tarbiyalash uchun astoydil harakat qiladilar.",
    category: "Ta'lim & Fan"
  },
  {
    id: "word-16",
    word: "Opportunity",
    phonetic: "/ˌɒp.əˈtʃuː.nə.ti/",
    translation: "Imkoniyat, qulay vaziyat",
    exampleEng: "Every new day brings an opportunity to learn something valuable.",
    exampleUzb: "Har bir yangi kun qimmatli narsalarni o'rganish uchun yangi imkoniyat keltiradi.",
    category: "Kundalik hayot"
  },
  {
    id: "word-17",
    word: "Perseverance",
    phonetic: "/ˌpɜː.sɪˈvɪə.rəns/",
    translation: "Tirishqoqlik, sabot, sabr-bardosh",
    exampleEng: "Through hard work and perseverance, she successfully completed the marathon.",
    exampleUzb: "Mehnat va sabot orqali u marafoni muvaffaqiyatli yakunladi.",
    category: "Shaxsiyat"
  },
  {
    id: "word-18",
    word: "Quest",
    phonetic: "/kwest/",
    translation: "Izlanish, intilish, qidiruv",
    exampleEng: "Humanity is on an eternal quest to understand the mysteries of the universe.",
    exampleUzb: "Insoniyat koinot sirlarini anglash bo'yicha mangu izlanishda davom etmoqda.",
    category: "Ta'lim & Fan"
  },
  {
    id: "word-19",
    word: "Remarkable",
    phonetic: "/rɪˈmɑː.kə.bəl/",
    translation: "Ajoyib, e'tiborga loyiq, favqulodda",
    exampleEng: "The young programmer made remarkable progress in just a few months.",
    exampleUzb: "Yosh dasturchi bir necha oy ichida hayratlanarli darajada katta o'sishga erishdi.",
    category: "Shaxsiyat"
  },
  {
    id: "word-20",
    word: "Serenity",
    phonetic: "/səˈren.ə.ti/",
    translation: "Osoyishtalik, xotirjamlik, sukunat",
    exampleEng: "Walking along the quiet seashore brought a deep sense of serenity.",
    exampleUzb: "Sokin dengiz qirg'og'ida sayr qilish qalbga chuqur osoyishtalik baxsh etdi.",
    category: "Psixologiya"
  },
  {
    id: "word-21",
    word: "Tenacious",
    phonetic: "/təˈneɪ.ʃəs/",
    translation: "Qat'iyatli, mahkam yopishgan, chekinmaydigan",
    exampleEng: "His tenacious personality never allowed him to surrender to defeat.",
    exampleUzb: "Uning qat'iyatli xarakteri unga hech qachon mag'lubiyatga bo'yin egishga yo'l qo'ymadi.",
    category: "Shaxsiyat"
  },
  {
    id: "word-22",
    word: "Ubiquitous",
    phonetic: "/juːˈbɪk.wɪ.təs/",
    translation: "Hamma joyda mavjud, keng tarqalgan",
    exampleEng: "Smartphones have become ubiquitous in modern urban society.",
    exampleUzb: "Smartfonlar zamonaviy shahar jamiyatida hamma joyda uchraydigan buyumga aylandi.",
    category: "Texnologiya"
  },
  {
    id: "word-23",
    word: "Vibrant",
    phonetic: "/ˈvaɪ.brənt/",
    translation: "Jo'shqin, yorqin, hayotga to'la",
    exampleEng: "Samarkand is known for its vibrant history and breathtaking architecture.",
    exampleUzb: "Samarqand o'zining jo'shqin tarixi va ajoyib me'morchiligi bilan mashhurdir.",
    category: "Tabiat & Sayohat"
  },
  {
    id: "word-24",
    word: "Wisdom",
    phonetic: "/ˈwɪz.dəm/",
    translation: "Donolik, aql-zakovat, hikmat",
    exampleEng: "True wisdom comes from learning thoughtfully from our past experiences.",
    exampleUzb: "Haqiqiy donolik o'tmishdagi tajribalarimizdan chuqur xulosa chiqarishdan keladi.",
    category: "Falsafa"
  },
  {
    id: "word-25",
    word: "Youthful",
    phonetic: "/ˈjuːθ.fəl/",
    translation: "Yoshlarga xos, navqiron, tetik",
    exampleEng: "He maintained a youthful curiosity and enthusiasm throughout his entire life.",
    exampleUzb: "U butun umri davomida yoshlarga xos qiziquvchanlik va jo'shqinlikni saqlab qoldi.",
    category: "Kundalik hayot"
  },
  {
    id: "word-26",
    word: "Zeal",
    phonetic: "/ziːl/",
    translation: "Ishtiyoq, g'ayrat, shijoat",
    exampleEng: "The young students studied the English language with tremendous zeal.",
    exampleUzb: "Yosh talabalar ingliz tilini cheksiz g'ayrat va ishtiyoq bilan o'rgandilar.",
    category: "Harakat"
  },
  {
    id: "word-27",
    word: "Benevolent",
    phonetic: "/bəˈnev.əl.ənt/",
    translation: "Saxiy, xayrixoh, ezgu niyatli",
    exampleEng: "A benevolent sponsor provided financial support for children's education.",
    exampleUzb: "Saxiy homiy bolalarning ta'lim olishi uchun moliyaviy yordam ko'rsatdi.",
    category: "Shaxsiyat"
  },
  {
    id: "word-28",
    word: "Compassion",
    phonetic: "/kəmˈpæʃ.ən/",
    translation: "Rahmdillik, mehr-oqibat",
    exampleEng: "Treating others with compassion makes our world a much better place.",
    exampleUzb: "Boshqalarga mehr-oqibat bilan muomala qilish dunyomizni yanada go'zalroq qiladi.",
    category: "Psixologiya"
  },
  {
    id: "word-29",
    word: "Diligent",
    phonetic: "/ˈdɪl.ɪ.dʒənt/",
    translation: "Tirishqoq, vijdonli, mehnatsevar",
    exampleEng: "The diligent student was awarded first place in the national contest.",
    exampleUzb: "Mehnatsevar o'quvchi milliy tanlovda birinchi o'rin bilan taqdirlandi.",
    category: "Shaxsiyat"
  },
  {
    id: "word-30",
    word: "Innovation",
    phonetic: "/ˌɪn.əˈveɪ.ʃən/",
    translation: "Yangilik kiritish, innovatsiya, ixtiro",
    exampleEng: "Technological innovation has revolutionized modern global communication.",
    exampleUzb: "Texnologik innovatsiyalar zamonaviy xalqaro aloqa tizimini butunlay o'zgartirdi.",
    category: "Texnologiya"
  },
  {
    id: "word-31",
    word: "Eloquent",
    phonetic: "/ˈel.ə.kwənt/",
    translation: "Fasohotli, notiq, chiroyli so'zlaydigan",
    exampleEng: "His eloquent speech moved the entire audience to tears.",
    exampleUzb: "Uning chiroyli va fasohatli nutqi butun tinglovchilarni ta'sirlantirdi.",
    category: "Ta'lim & Fan"
  },
  {
    id: "word-32",
    word: "Adaptable",
    phonetic: "/əˈdæp.tə.bəl/",
    translation: "Moslashuvchan, yangi sharoitlarga tez o'rganuvchi",
    exampleEng: "Successful programmers must be adaptable to rapid technological shifts.",
    exampleUzb: "Muvaffaqiyatli dasturchilar shiddatli texnologik o'zgarishlarga moslashuvchan bo'lishlari kerak.",
    category: "Shaxsiyat"
  }
];

// O'zgarmas kategoriyalar ro'yxati
const DEFAULT_CATEGORIES = [
  "Barchasi",
  "Shaxsiyat",
  "Harakat",
  "Tabiat & Sayohat",
  "Ta'lim & Fan",
  "Psixologiya",
  "Iqtisodiyot",
  "Falsafa",
  "Texnologiya",
  "Kundalik hayot"
];
