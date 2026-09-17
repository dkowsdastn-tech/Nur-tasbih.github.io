export const LANGUAGES = [
  { code: "ru", name: "Русский", native: "Русский" },
  { code: "en", name: "English", native: "English" },
  { code: "ar", name: "Arabic", native: "العربية" },
  { code: "kk", name: "Kazakh", native: "Қазақша" },
  { code: "tr", name: "Turkish", native: "Türkçe" },
  { code: "id", name: "Indonesian", native: "Bahasa Indonesia" },
  { code: "ms", name: "Malay", native: "Bahasa Melayu" },
  { code: "ur", name: "Urdu", native: "اردو" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "fa", name: "Persian", native: "فارسی" },
  { code: "uz", name: "Uzbek", native: "Oʻzbekcha" },
  { code: "sw", name: "Swahili", native: "Kiswahili" }
];

const named = (ru, en, ar, kk, tr, id, extra = {}) => ({ ru, en, ar, kk, tr, id, ...extra });
const pad = number => String(number).padStart(3, "0");

export const QURAN_SURAHS = [
  { number: 1, arabic: "الفاتحة", names: named("Аль-Фатиха · Открывающая", "Al-Fatihah · The Opening", "الفاتحة", "Фатиха · Ашушы", "Fâtiha · Açılış", "Al-Fatihah · Pembukaan", { ms: "Al-Fatihah · Pembukaan", ur: "الفاتحہ", bn: "আল-ফাতিহা", fa: "فاتحه", uz: "Fotiha", sw: "Al-Fātiḥah · Ufunguzi" }) },
  { number: 36, arabic: "يس", names: named("Йа Син", "Ya-Sin", "يس", "Ясин", "Yâsîn", "Yasin", { ms: "Yasin", ur: "یٰس", bn: "ইয়াসীন", fa: "یس", uz: "Yosin", sw: "Yā-Sīn" }) },
  { number: 55, arabic: "الرحمن", names: named("Ар-Рахман · Милостивый", "Ar-Rahman · The Most Merciful", "الرحمن", "Рахман · Аса Мейірімді", "Rahmân · Merhamet Eden", "Ar-Rahman · Yang Maha Pengasih", { ms: "Ar-Rahman · Maha Pemurah", ur: "الرحمٰن", bn: "আর-রহমান", fa: "الرحمن", uz: "Ar-Rahmon", sw: "Ar-Raḥmān · Mwingi wa Rehema" }) },
  { number: 67, arabic: "الملك", names: named("Аль-Мульк · Власть", "Al-Mulk · The Dominion", "الملك", "Мүлік · Билік", "Mülk · Hükümranlık", "Al-Mulk · Kerajaan", { ms: "Al-Mulk · Kerajaan", ur: "الملک", bn: "আল-মুলক", fa: "الملک", uz: "Al-Mulk", sw: "Al-Mulk · Ufalme" }) },
  { number: 112, arabic: "الإخلاص", names: named("Аль-Ихляс · Очищение веры", "Al-Ikhlas · Sincerity", "الإخلاص", "Ықылас · Сенімді тазарту", "İhlâs · Samimiyet", "Al-Ikhlas · Keikhlasan", { ms: "Al-Ikhlas · Keikhlasan", ur: "الاخلاص", bn: "আল-ইখলাস", fa: "اخلاص", uz: "Ixlos", sw: "Al-Ikhlāṣ · Ikhlasi" }) },
  { number: 113, arabic: "الفلق", names: named("Аль-Фаляк · Рассвет", "Al-Falaq · Daybreak", "الفلق", "Фалақ · Таң шапағы", "Felak · Tan Yeri", "Al-Falaq · Waktu Subuh", { ms: "Al-Falaq · Waktu Subuh", ur: "الفلق", bn: "আল-ফালাক", fa: "فلق", uz: "Falaq", sw: "Al-Falaq · Alfajiri" }) },
  { number: 114, arabic: "الناس", names: named("Ан-Нас · Люди", "An-Nas · Mankind", "الناس", "Нәс · Адамдар", "Nâs · İnsanlar", "An-Nas · Manusia", { ms: "An-Nas · Manusia", ur: "الناس", bn: "আন-নাস", fa: "ناس", uz: "Nas", sw: "An-Nās · Watu" }) }
];

export const RECITERS = [
  { id: "afasy", name: "Мишари Рашид Аль-Афаси", url: number => `https://server8.mp3quran.net/afs/${pad(number)}.mp3` },
  { id: "abdulbasit", name: "Абдуль-Басит Абдус-Самад", url: number => `https://server7.mp3quran.net/basit/Almusshaf-Al-Mojawwad/${pad(number)}.mp3` },
  { id: "islam-sobhi", name: "Ислам Собхи", url: number => `https://server14.mp3quran.net/islam/Rewayat-Hafs-A-n-Assem/${pad(number)}.mp3` }
];

export const DHIKR_COLLECTIONS = [
  {
    id: "free", icon: "∞", category: "open",
    title: named("Свободный счёт", "Free counter", "عداد حر", "Еркін санау", "Serbest sayaç", "Hitungan bebas", { ms: "Kiraan bebas", ur: "آزاد شمار", bn: "মুক্ত গণনা", fa: "شمارش آزاد", uz: "Erkin hisob", sw: "Hesabu huru" }),
    description: named("Считайте свой зикр в своём ритме", "Count your own dhikr at your pace", "اذكر الله بالوتيرة التي تناسبك", "Өзіңізге ыңғайлы зікірді санаңыз", "Zikrinizi kendi ritminizde sayın", "Hitung zikir Anda sesuai ritme", { ms: "Kira zikir mengikut rentak anda", ur: "اپنی رفتار سے ذکر شمار کریں", bn: "নিজের গতিতে জিকির গণনা করুন", fa: "ذکر خود را با ریتم خودتان بشمارید", uz: "Zikringizni o‘z sur’atingizda sanang", sw: "Hesabu dhikr yako kwa kasi yako" }),
    steps: [{ arabic: "", transliteration: "", goal: null, source: "" }]
  },
  {
    id: "fatimah", icon: "33", category: "daily",
    title: named("Тасбих Фатимы", "Tasbih of Fatimah", "تسبيح فاطمة", "Фатима тасбихы", "Fatıma tesbihi", "Tasbih Fatimah", { ms: "Tasbih Fatimah", ur: "تسبیح فاطمہ", bn: "ফাতিমার তাসবিহ", fa: "تسبیحات فاطمه", uz: "Fotima tasbihi", sw: "Tasbih ya Fatimah" }),
    description: named("33 · 33 · 34 — структурированный набор", "33 · 33 · 34 — a structured set", "٣٣ · ٣٣ · ٣٤ — ورد منظم", "33 · 33 · 34 — реттелген топтама", "33 · 33 · 34 — düzenli bir set", "33 · 33 · 34 — rangkaian terstruktur", { ms: "33 · 33 · 34 — set tersusun", ur: "۳۳ · ۳۳ · ۳۴ — ترتیب وار ورد", bn: "৩৩ · ৩৩ · ৩৪ — সাজানো সেট", fa: "۳۳ · ۳۳ · ۳۴ — مجموعه منظم", uz: "33 · 33 · 34 — tartibli to‘plam", sw: "33 · 33 · 34 — seti iliyopangwa" }),
    steps: [
      { arabic: "سُبْحَانَ ٱللَّٰهِ", transliteration: "SubḥānAllāh", goal: 33, source: "Sahih al-Bukhari, 5362; Sahih Muslim, 2727" },
      { arabic: "ٱلْحَمْدُ لِلَّٰهِ", transliteration: "Alḥamdulillāh", goal: 33, source: "Sahih al-Bukhari, 5362; Sahih Muslim, 2727" },
      { arabic: "ٱللَّٰهُ أَكْبَرُ", transliteration: "Allāhu Akbar", goal: 34, source: "Sahih al-Bukhari, 5362; Sahih Muslim, 2727" }
    ]
  },
  {
    id: "morning", icon: "☼", category: "morning",
    title: named("Утренний зикр", "Morning dhikr", "ذكر الصباح", "Таңғы зікір", "Sabah zikri", "Zikir pagi", { ms: "Zikir pagi", ur: "صبح کا ذکر", bn: "সকালের জিকির", fa: "ذکر صبح", uz: "Tonggi zikr", sw: "Dhikr ya asubuhi" }),
    description: named("Спокойные 100 повторений утром", "A calm set of 100 in the morning", "ورد هادئ من مائة تسبيحة", "Таңға арналған 100 рет тыныш зікір", "Sabah için sakin 100 tekrar", "100 bacaan tenang di pagi hari", { ms: "100 bacaan tenang pada waktu pagi", ur: "صبح کے سو پُرسکون اذکار", bn: "সকালে শান্ত ১০০ বার", fa: "صد ذکر آرام در صبح", uz: "Ertalab 100 marotaba sokin zikr", sw: "Marudio 100 tulivu asubuhi" }),
    steps: [{ arabic: "سُبْحَانَ ٱللَّٰهِ وَبِحَمْدِهِ", transliteration: "SubḥānAllāhi wa biḥamdih", goal: 100, source: "Sahih al-Bukhari, 6405; Sahih Muslim, 2691" }]
  },
  {
    id: "salawat", icon: "✧", category: "daily",
    title: named("Салават Пророку ﷺ", "Salawat upon the Prophet ﷺ", "الصلاة على النبي ﷺ", "Пайғамбарға ﷺ салауат", "Peygamber'e ﷺ salavat", "Salawat kepada Nabi ﷺ", { ms: "Selawat kepada Nabi ﷺ", ur: "نبی ﷺ پر درود", bn: "নবী ﷺ-এর উপর দরুদ", fa: "صلوات بر پیامبر ﷺ", uz: "Payg‘ambar ﷺ ga salovat", sw: "Swala kwa Mtume ﷺ" }),
    description: named("Небольшой набор с осмысленным вниманием", "A small, attentive set", "ورد قصير بتدبر", "Мағыналы ықыласпен қысқа топтама", "Düşünerek küçük bir set", "Rangkaian kecil penuh perhatian", { ms: "Set kecil dengan penuh perhatian", ur: "توجہ کے ساتھ مختصر ورد", bn: "মনোযোগী ছোট সেট", fa: "مجموعه‌ای کوتاه با توجه", uz: "Diqqatli qisqa to‘plam", sw: "Seti ndogo kwa umakini" }),
    steps: [{ arabic: "ٱللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ", transliteration: "Allāhumma ṣalli ʿalā Muḥammad", goal: 10, source: "Qur’an, 33:56" }]
  },
  {
    id: "istighfar", icon: "↺", category: "daily",
    title: named("Истигфар", "Istighfar", "الاستغفار", "Истиғфар", "İstiğfar", "Istighfar", { ms: "Istighfar", ur: "استغفار", bn: "ইস্তিগফার", fa: "استغفار", uz: "Istig‘for", sw: "Istighfar" }),
    description: named("Просите прощения с надеждой", "Seek forgiveness with hope", "استغفار برجاء", "Үмітпен кешірім тілеу", "Umutla bağışlanma dileyin", "Mohon ampun dengan harapan", { ms: "Memohon keampunan dengan harapan", ur: "امید کے ساتھ مغفرت مانگیں", bn: "আশা নিয়ে ক্ষমা প্রার্থনা করুন", fa: "با امید آمرزش بخواهید", uz: "Umid bilan mag‘firat so‘rang", sw: "Omba msamaha kwa matumaini" }),
    steps: [{ arabic: "أَسْتَغْفِرُ ٱللَّٰهَ وَأَتُوبُ إِلَيْهِ", transliteration: "Astaghfirullāha wa atūbu ilayh", goal: 100, source: "Sahih al-Bukhari, 6307" }]
  },
  {
    id: "tahlil", icon: "◇", category: "daily",
    title: named("Тахлиль", "Tahlil", "التهليل", "Тахлил", "Tehlil", "Tahlil", { ms: "Tahlil", ur: "تہلیل", bn: "তাহলিল", fa: "تهلیل", uz: "Tahlil", sw: "Tahlil" }),
    description: named("Единобожие, произносимое осознанно", "A mindful declaration of tawhid", "إعلان التوحيد بتدبر", "Таухидті саналы айту", "Tevhidi düşünerek söylemek", "Pernyataan tauhid dengan sadar", { ms: "Pernyataan tauhid dengan sedar", ur: "توحید کا با شعور اقرار", bn: "তাওহীদের সচেতন ঘোষণা", fa: "اعلام توحید با توجه", uz: "Tavhidni anglab aytish", sw: "Tamko la tawhid kwa uangalifu" }),
    steps: [{ arabic: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ", transliteration: "Lā ilāha illā-llāh", goal: 100, source: "Sahih Muslim, 2691" }]
  }
];

export const KNOWLEDGE_LIBRARY = [
  {
    id: "kindness", icon: "☼", glyph: "٭", category: "heart", color: "#0d7560", wide: false,
    label: named("Характер", "Character", "الأخلاق", "Мінез", "Ahlâk", "Akhlak"),
    title: named("Маленькое добро имеет вес", "Small goodness matters", "لا تحتقر المعروف", "Кішкентай жақсылықтың да салмағы бар", "Küçük iyilik önemlidir", "Kebaikan kecil itu berarti"),
    text: named("Не обесценивайте даже встречу с добрым лицом. Небольшой поступок может быть искренним и постоянным.", "Do not belittle even meeting someone with a cheerful face. A small act can be sincere and consistent.", "لا تحتقر من المعروف شيئاً، ولو لقاء أخيك بوجه طلق.", "Жылы жүзбен қарсы алуды да кішкентай көрмеңіз. Аз амал шынайы әрі тұрақты бола алады.", "Güler yüzle karşılamayı bile küçümsemeyin. Küçük bir iyilik samimi ve sürekli olabilir.", "Jangan meremehkan bahkan senyum ramah. Kebaikan kecil bisa tulus dan konsisten."),
    action: named("Сегодня: подарите кому-то спокойное приветствие.", "Today: offer someone a peaceful greeting.", "اليوم: بادر بتحية طيبة.", "Бүгін: біреуге ізгі сәлем беріңіз.", "Bugün: birine huzurlu bir selam verin.", "Hari ini: berikan salam yang baik kepada seseorang."), source: "Sahih Muslim, 2626"
  },
  {
    id: "charity", icon: "◌", glyph: "۞", category: "practice", color: "#926523", wide: false,
    label: named("Щедрость", "Generosity", "الصدقة", "Жомарттық", "Cömertlik", "Kedermawanan"),
    title: named("Садака не обедняет", "Charity does not diminish", "الصدقة لا تنقص المال", "Садақа малды кемітпейді", "Sadaka malı eksiltmez", "Sedekah tidak mengurangi harta"),
    text: named("Щедрость — не только крупная сумма. Поддержка, время и полезное слово тоже могут стать благом.", "Generosity is not only a large amount. Support, time, and a useful word can all be good.", "الصدقة لا تنقص المال، والكرم يشمل الوقت والكلمة الطيبة.", "Жомарттық тек үлкен сома емес. Қолдау, уақыт және пайдалы сөз де игілік.", "Cömertlik yalnızca büyük bir miktar değildir. Destek, zaman ve güzel söz de hayır olabilir.", "Kedermawanan bukan hanya jumlah besar. Dukungan, waktu, dan kata baik juga bisa menjadi kebaikan."),
    action: named("Сегодня: выберите один посильный жест поддержки.", "Today: choose one manageable act of support.", "اليوم: اختر وجهاً يسيراً من العطاء.", "Бүгін: қолыңыздан келетін бір қолдау қадамын таңдаңыз.", "Bugün: yapabileceğiniz bir destek seçin.", "Hari ini: pilih satu bentuk dukungan yang mampu Anda lakukan."), source: "Sahih Muslim, 2588"
  },
  {
    id: "intention", icon: "◇", glyph: "ن", category: "heart", color: "#564581", wide: true,
    label: named("Намерение", "Intention", "النية", "Ниет", "Niyet", "Niat"),
    title: named("Начните с намерения", "Begin with intention", "ابدأ بالنية", "Ниеттен бастаңыз", "Niyetle başlayın", "Mulailah dengan niat"),
    text: named("Перед привычным делом остановитесь на секунду: ради какого блага я это делаю? Это возвращает внимание к смыслу.", "Before a familiar task, pause for a second: what good do I intend through it? It brings attention back to meaning.", "توقف لحظة قبل عملك المألوف واسأل: لأي خير أنويه؟", "Үйреншікті істің алдында бір сәт: мұны қандай игілік үшін істеп жатырмын?", "Alışılmış bir işten önce bir an durun: Bunu hangi hayır için yapıyorum?", "Sebelum kegiatan biasa, berhentilah sejenak: kebaikan apa yang saya niatkan?"),
    action: named("Сегодня: обновите намерение перед одним обычным делом.", "Today: renew your intention before one ordinary task.", "اليوم: جدد نيتك قبل عمل عادي.", "Бүгін: бір кәдімгі істің алдында ниетіңізді жаңартыңыз.", "Bugün: sıradan bir işten önce niyetinizi yenileyin.", "Hari ini: perbarui niat sebelum satu kegiatan biasa."), source: "Sahih al-Bukhari, 1; Sahih Muslim, 1907"
  },
  {
    id: "remembrance", icon: "۝", glyph: "ذ", category: "daily", color: "#147778", wide: false,
    label: named("Поминание", "Remembrance", "الذكر", "Зікір", "Zikir", "Zikir"),
    title: named("Утро с зикра", "A morning with dhikr", "صباح مع الذكر", "Таңғы зікір", "Zikirle sabah", "Pagi dengan zikir"),
    text: named("Несколько спокойных минут с осмысленным зикром могут стать точкой опоры для всего дня.", "A few quiet minutes of mindful dhikr can become an anchor for the whole day.", "دقائق هادئة من الذكر بتدبر قد تكون سنداً ليومك.", "Саналы зікірге арналған бірнеше тыныш минут күнге тірек бола алады.", "Düşünerek yapılan birkaç sakin zikir dakikası güne dayanak olabilir.", "Beberapa menit zikir yang dihayati dapat menjadi penopang lembut untuk hari ini."),
    action: named("Сегодня: выберите один набор зикра и завершите его без спешки.", "Today: choose one dhikr set and complete it without rushing.", "اليوم: اختر ورداً واحداً وأتمه بلا استعجال.", "Бүгін: бір зікір жинағын таңдаңыз да, асықпай аяқтаңыз.", "Bugün: bir zikir seti seçin ve acele etmeden tamamlayın.", "Hari ini: pilih satu rangkaian zikir dan selesaikan tanpa tergesa."), source: "Qur’an, 33:41"
  },
  {
    id: "night", icon: "☾", glyph: "۩", category: "practice", color: "#335c78", wide: false,
    label: named("Ночь", "Night", "الليل", "Түн", "Gece", "Malam"),
    title: named("Тихое время", "A quiet time", "وقت هادئ", "Тыныш уақыт", "Sakin bir vakit", "Waktu yang hening"),
    text: named("Добровольная ночная молитва — возможность для личного обращения. Начинайте с малого, без непосильных обещаний.", "Voluntary night prayer is a chance for a personal turning. Begin small, without unmanageable promises.", "قيام الليل نافلة وفرصة لمناجاة خاصة؛ ابدأ بالقليل دون تكلف.", "Түнгі нәпіл намаз — оңаша жүгіну мүмкіндігі. Аздан бастаңыз.", "Gece namazı, kişisel yöneliş için bir fırsattır. Küçük başlayın.", "Salat malam sunnah adalah kesempatan untuk munajat pribadi. Mulailah dari yang kecil."),
    action: named("Сегодня: приготовьте спокойный вечерний ритуал без давления.", "Today: prepare a calm evening ritual without pressure.", "اليوم: هيئ لنفسك وقتاً هادئاً بلا ضغط.", "Бүгін: қысымсыз тыныш кешкі әдет дайындаңыз.", "Bugün: baskısız sakin bir akşam alışkanlığı hazırlayın.", "Hari ini: siapkan kebiasaan malam yang tenang tanpa tekanan."), source: "Qur’an, 17:79"
  },
  {
    id: "gratitude", icon: "✦", glyph: "ش", category: "daily", color: "#9a6c2a", wide: true,
    label: named("Благодарность", "Gratitude", "الشكر", "Шүкір", "Şükür", "Syukur"),
    title: named("Замечать благо", "Notice the good", "ملاحظة النعم", "Игілікті байқау", "Nimeti fark etmek", "Menyadari nikmat"),
    text: named("Благодарность не требует идеального дня. Назовите одну милость, которую вы уже видите, и скажите «альхамдулиллях».", "Gratitude does not require a perfect day. Name one blessing you can already see and say alhamdulillah.", "الشكر لا يحتاج إلى يوم مثالي؛ سمّ نعمة تراها الآن وقل الحمد لله.", "Шүкір етуге мінсіз күн керек емес. Бір нығметті атап, «әлхамдулиллаһ» деңіз.", "Şükür için kusursuz bir gün gerekmez. Gördüğünüz bir nimeti anın ve elhamdülillah deyin.", "Syukur tidak menunggu hari sempurna. Sebutkan satu nikmat yang Anda lihat lalu ucapkan alhamdulillah."),
    action: named("Сегодня: запишите одну благодарность только для себя.", "Today: write down one gratitude just for yourself.", "اليوم: اكتب نعمة واحدة لنفسك.", "Бүгін: өзіңіз үшін бір шүкірлікті жазыңыз.", "Bugün: kendiniz için bir şükür not edin.", "Hari ini: tulis satu rasa syukur untuk diri sendiri."), source: "Qur’an, 14:7"
  }
];

const referenceAnswers = {
  ru: {
    generic: "Я могу дать только справочную информацию на основе Корана и достоверной Сунны. В личном или спорном вопросе лучше обратиться к знающему местному имаму.",
    wudu: "Коран описывает омовение в аяте 5:6: омойте лицо и руки до локтей, протрите голову и омойте ноги до щиколоток. Детали и исключения могут различаться в правовых школах, поэтому для личной ситуации лучше обратиться к местному имаму.",
    fast: "Коран устанавливает пост в Рамадан (2:183–187). В частных вопросах о том, что нарушает пост, существуют разногласия и обстоятельства здоровья; лучше обратиться к местному имаму.",
    dua: "В Коране сказано: «Взывайте ко Мне — Я отвечу вам» (40:60). Просите Аллаха искренне, с надеждой и смирением. Вопросы о принятии дуа не сводятся к одной формуле; продолжайте дуа и обращайтесь за знанием к надёжному учителю.",
    prayer: "Соблюдение молитвы занимает центральное место: «Воистину, молитва предписана верующим в определённое время» (Коран, 4:103). Если вопрос касается порядка или исключения лично для вас, спросите местного имама."
  },
  en: {
    generic: "I can offer only general reference information based on the Qur’an and authentic Sunnah. For a personal or disputed matter, it is best to consult a knowledgeable local imam.",
    wudu: "The Qur’an describes ablution in 5:6: wash the face and hands to the elbows, wipe the head, and wash the feet to the ankles. Details and exceptions can differ among legal schools, so consult a local imam for a personal case.",
    fast: "The Qur’an establishes fasting in Ramadan (2:183–187). There are differences of opinion and health-related circumstances in questions about what invalidates a fast; consult a local imam.",
    dua: "The Qur’an says, ‘Call upon Me; I will respond to you’ (40:60). Ask Allah sincerely, with hope and humility. Acceptance of duʿāʾ is not reducible to one formula; keep making duʿāʾ and learn from a trusted teacher.",
    prayer: "Prayer has a central place: ‘Indeed, prayer has been decreed upon the believers a decree of specified times’ (Qur’an 4:103). For a personal question about its order or an exception, ask a local imam."
  },
  ar: {
    generic: "يمكنني تقديم معلومات عامة فقط من القرآن والسنة الصحيحة. في المسائل الشخصية أو الخلافية، الأفضل الرجوع إلى إمام محلي موثوق.",
    wudu: "وردت صفة الوضوء في القرآن في الآية 5:6: غسل الوجه واليدين إلى المرافق ومسح الرأس وغسل الرجلين إلى الكعبين. قد تختلف بعض التفاصيل بين المذاهب، فاسأل إماماً في حالتك الخاصة.",
    fast: "بيّن القرآن فريضة الصيام في رمضان في 2:183–187. توجد مسائل خلافية وظروف صحية في ما يفسد الصوم، والأفضل الرجوع إلى إمام محلي.",
    dua: "يقول القرآن: «ادعوني أستجب لكم» (40:60). ادع الله بإخلاص ورجاء وتواضع، واستمر في الدعاء وتعلم من معلّم موثوق.",
    prayer: "الصلاة مكتوبة في أوقات معلومة للمؤمنين (القرآن 4:103). في السؤال الشخصي عن الكيفية أو الرخصة، اسأل إماماً محلياً."
  },
  kk: {
    generic: "Мен Құран мен сахих Сүннетке негізделген жалпы анықтамалық қана ұсына аламын. Жеке не таласты мәселе бойынша білікті жергілікті имамға жүгінген дұрыс.",
    wudu: "Құранда дәрет 5:6 аятында сипатталған: бетті және қолды шынтаққа дейін жуу, басқа мәсіх тарту және аяқты тобыққа дейін жуу. Егжей-тегжейлер мәзһабтарға қарай өзгеше болуы мүмкін.",
    fast: "Құран Рамазан оразасын 2:183–187 аяттарында бекітеді. Оразаны не бұзатыны жөнінде пікір айырмашылықтары мен денсаулық жағдайлары болады; жергілікті имамнан сұраңыз.",
    dua: "Құранда: «Маған дұға етіңдер, сендерге жауап беремін» делінген (40:60). Алладан ықыласпен, үмітпен және кішіпейілдікпен сұраңыз.",
    prayer: "Намаз мүміндерге белгілі уақыттарда парыз етілген (Құран, 4:103). Жеке жағдайға қатысты сұрақта жергілікті имамнан кеңес алыңыз."
  },
  tr: {
    generic: "Yalnızca Kur’an ve sahih Sünnete dayalı genel bilgi sunabilirim. Kişisel veya ihtilaflı bir mesele için bilgili bir yerel imama danışmak en iyisidir.",
    wudu: "Kur’an, abdesti 5:6 ayetinde açıklar: yüzü ve dirseklere kadar elleri yıkamak, başı mesh etmek ve ayakları topuklara kadar yıkamak. Ayrıntılar mezheplere göre farklılık gösterebilir.",
    fast: "Kur’an Ramazan orucunu 2:183–187 ayetlerinde bildirir. Orucu bozanlar hakkında ihtilaflar ve sağlıkla ilgili durumlar vardır; yerel bir imama danışın.",
    dua: "Kur’an’da, ‘Bana dua edin, size cevap vereyim’ buyrulur (40:60). Allah’a ihlasla, ümit ve tevazu ile dua edin.",
    prayer: "Namaz, müminlere belirli vakitlerde farz kılınmıştır (Kur’an, 4:103). Kişisel bir durum için yerel imama danışın."
  },
  id: {
    generic: "Saya hanya dapat memberikan informasi umum berdasarkan Al-Qur'an dan Sunnah sahih. Untuk persoalan pribadi atau yang diperselisihkan, sebaiknya berkonsultasi kepada imam setempat yang berilmu.",
    wudu: "Al-Qur'an menjelaskan wudu pada 5:6: membasuh wajah dan tangan hingga siku, mengusap kepala, dan membasuh kaki hingga mata kaki. Rincian dapat berbeda antarmazhab.",
    fast: "Al-Qur'an menetapkan puasa Ramadan pada 2:183–187. Ada perbedaan pendapat dan keadaan kesehatan dalam pertanyaan tentang yang membatalkan puasa; konsultasikan kepada imam setempat.",
    dua: "Al-Qur'an berfirman, ‘Berdoalah kepada-Ku, niscaya akan Aku perkenankan bagimu’ (40:60). Berdoalah dengan tulus, penuh harap, dan rendah hati.",
    prayer: "Salat telah ditetapkan bagi orang beriman pada waktu-waktu tertentu (Al-Qur'an, 4:103). Untuk keadaan pribadi, tanyakan imam setempat."
  }
};

export function copyFor(item, language, fallback = "") { return item?.[language] || item?.en || item?.ru || fallback; }

export function localAnswer(language, question) {
  const answers = referenceAnswers[language] || referenceAnswers.en;
  const lowered = String(question).toLocaleLowerCase(language);
  if (/омов|дәрет|wudu|ablution|وضوء|abdest|wudhu|وضو|ওযু|وضو|taharat/.test(lowered)) return answers.wudu;
  if (/пост|ораз|fast|صوم|oruç|puasa|روز[هە]|روزه|রোজা/.test(lowered)) return answers.fast;
  if (/дуа|дұға|dua|دعاء|dua|دعا|দোয়া/.test(lowered)) return answers.dua;
  if (/намаз|молитв|salat|prayer|صلاة|namaz|solat|نماز|নামাজ/.test(lowered)) return answers.prayer;
  return answers.generic;
}
