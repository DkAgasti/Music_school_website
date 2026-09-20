// ─── Classes ─────────────────────────────────────────────────────────

export const classes = [
  {
    id: "cls_vocals",
    name: "Vocals",
    slug: "vocals",
    tagline: "Learn to sing with confidence.",
    description:
      "Develop your singing voice with breath control, pitch, and stage presence.",
    syllabus:
      "Breathing techniques, pitch training, raga basics, performance skills.",
    duration: "6 Months",
    feeRange: "₹2,000 – ₹3,000/month",
    imageUrl: "/images/classes/vocals.png",
    active: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    batches: [
      {
        id: "bat_vocals_a",
        classId: "cls_vocals",
        name: "Vocals Batch A",
        schedule: "Mon/Wed/Fri 11:00 AM - 12:30 PM",
        capacity: 10,
        active: true,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ],
    feePlans: [
      {
        id: "fp_vocals_monthly",
        classId: "cls_vocals",
        name: "Monthly",
        amount: 200000,
        durationMonths: 1,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ],
    teachers: [],
  },
  {
    id: "cls_guitar",
    name: "Guitar",
    title: "Guitar Class",
    slug: "guitar",
    tagline: "Learn. Play. Perform.",
    description:
      "Our guitar class is designed for beginners and intermediate learners. You will learn chords, strumming, fingerstyle, and popular songs with step-by-step guidance.",
    aboutText:
      "Our guitar class is designed for beginners and intermediate learners. You will learn chords, strumming, fingerstyle, and popular songs with step-by-step guidance.",
    syllabus: "Basic chords and strumming, Fingerstyle techniques, Popular songs and progressions, Music theory basics.",
    syllabusList: [
      "Basic chords and strumming",
      "Fingerstyle techniques",
      "Popular songs and progressions",
      "Music theory basics",
    ],
    duration: "6 Months",
    feeRange: "₹2,000 – ₹3,500/month",
    batchTiming: "Mon & Wed | 5:00 PM – 6:00 PM",
    location: "Main Branch, New Delhi",
    availableSeats: "5 Seats Left",
    heroImage: "/images/classes/guitar-hero-banner.png",
    imageUrl: "/images/classes/guitar-main.png",
    mainImage: "/images/classes/guitar-main.png",
    quote: "Music is not just a skill,\nit's a lifelong companion.",
    active: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    batches: [
      {
        id: "bat_guitar_morning",
        classId: "cls_guitar",
        name: "Guitar Morning",
        schedule: "Mon & Wed | 5:00 PM – 6:00 PM",
        capacity: 8,
        active: true,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ],
    feePlans: [
      {
        id: "fp_guitar_monthly",
        classId: "cls_guitar",
        name: "Monthly",
        amount: 200000,
        durationMonths: 1,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ],
    teachers: [],
  },
  {
    id: "cls_piano",
    name: "Piano",
    slug: "piano",
    tagline: "Master the keys.",
    description:
      "Master the keyboard with classical and modern piano training.",
    syllabus:
      "Posture, finger exercises, scales, chords, sight-reading, compositions.",
    duration: "6 Months",
    feeRange: "₹2,500 – ₹4,000/month",
    imageUrl: "/images/classes/piano.png",
    active: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    batches: [
      {
        id: "bat_piano_morning",
        classId: "cls_piano",
        name: "Piano Morning",
        schedule: "Mon/Wed/Fri 10:00 AM - 11:30 AM",
        capacity: 6,
        active: true,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ],
    feePlans: [
      {
        id: "fp_piano_monthly",
        classId: "cls_piano",
        name: "Monthly",
        amount: 250000,
        durationMonths: 1,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ],
    teachers: [],
  },
  {
    id: "cls_tabla",
    name: "Tabla",
    slug: "tabla",
    tagline: "Feel the rhythm.",
    description:
      "Learn Indian classical rhythm and tabla bols from basic strokes to intricate taals.",
    syllabus:
      "Hand posture, Dayan and Bayan techniques, Teentaal, Dadra, Keherwa, and accompaniment.",
    duration: "6 Months",
    feeRange: "₹2,000 – ₹3,000/month",
    imageUrl: "/images/classes/tabla.png",
    active: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    batches: [
      {
        id: "bat_tabla_morning",
        classId: "cls_tabla",
        name: "Tabla Morning",
        schedule: "Tue/Thu/Sat 10:00 AM - 11:30 AM",
        capacity: 6,
        active: true,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ],
    feePlans: [
      {
        id: "fp_tabla_monthly",
        classId: "cls_tabla",
        name: "Monthly",
        amount: 200000,
        durationMonths: 1,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ],
    teachers: [],
  },
  {
    id: "cls_violin",
    name: "Violin",
    slug: "violin",
    tagline: "Strings of emotion.",
    description:
      "Master the bowed strings with classical posture, bowing technique, and expressive melody.",
    syllabus:
      "Bow hold, fingering, intonation, scales, vibrato, classical compositions.",
    duration: "6 Months",
    feeRange: "₹2,500 – ₹3,500/month",
    imageUrl: "/images/classes/violin.png",
    active: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    batches: [
      {
        id: "bat_violin_evening",
        classId: "cls_violin",
        name: "Violin Evening",
        schedule: "Tue/Thu/Sat 5:00 PM - 6:30 PM",
        capacity: 6,
        active: true,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ],
    feePlans: [
      {
        id: "fp_violin_monthly",
        classId: "cls_violin",
        name: "Monthly",
        amount: 250000,
        durationMonths: 1,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ],
    teachers: [],
  },
  {
    id: "cls_drums",
    name: "Drums",
    slug: "drums",
    tagline: "Play the beats.",
    description:
      "Develop powerful rhythm, limb independence, and grooves across rock, pop, and jazz styles.",
    syllabus:
      "Stick grip, drum rudiments, coordinate drills, beat patterns, song performance.",
    duration: "6 Months",
    feeRange: "₹2,500 – ₹3,500/month",
    imageUrl: "/images/classes/drums.png",
    active: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    batches: [
      {
        id: "bat_drums_weekend",
        classId: "cls_drums",
        name: "Drums Weekend",
        schedule: "Sat/Sun 3:00 PM - 4:30 PM",
        capacity: 6,
        active: true,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ],
    feePlans: [
      {
        id: "fp_drums_monthly",
        classId: "cls_drums",
        name: "Monthly",
        amount: 250000,
        durationMonths: 1,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ],
    teachers: [],
  },
];

// ─── Teachers (linked to classes via implicit M2N) ──────────────────

export const teachers = [
  {
    id: "tch_1",
    name: "Amit Singh",
    role: "Guitar Instructor",
    experience: "10+ Years Experience",
    bio: "Classical and fingerstyle guitarist with 10+ years of teaching experience.",
    photoUrl: "/images/classes/teacher-amit-singh.png",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    classes: [classes[1]],
  },
  {
    id: "tch_2",
    name: "Priya Sharma",
    bio: "ARIA-certified pianist specialising in Hindustani and Western classical.",
    photoUrl: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    classes: [classes[2]],
  },
  {
    id: "tch_3",
    name: "Kavitha Nair",
    bio: "Playback and carnatic vocalist, performed at national-level concerts.",
    photoUrl: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    classes: [classes[0]],
  },
];

// Back-fill teachers on each class (mirrors implicit M2N)
classes[0].teachers = [teachers[2]];
classes[1].teachers = [teachers[0]];
classes[2].teachers = [teachers[1]];

// ─── Testimonials ───────────────────────────────────────────────────

export const testimonials = [
  {
    id: "tst_1",
    name: "Rahul Verma",
    message:
      "My son has been learning guitar here for 6 months and the progress is remarkable. The teachers are patient and skilled.",
    imageUrl: null,
    createdAt: "2025-02-01T00:00:00.000Z",
    updatedAt: "2025-02-01T00:00:00.000Z",
  },
  {
    id: "tst_2",
    name: "Sneha Iyer",
    message:
      "The vocal classes helped me find my voice. I never thought I could sing in front of an audience!",
    imageUrl: null,
    createdAt: "2025-03-01T00:00:00.000Z",
    updatedAt: "2025-03-01T00:00:00.000Z",
  },
  {
    id: "tst_3",
    name: "Amit Patel",
    message:
      "Best piano school in the city. The small batch size means real individual attention.",
    imageUrl: null,
    createdAt: "2025-04-01T00:00:00.000Z",
    updatedAt: "2025-04-01T00:00:00.000Z",
  },
  {
    id: "tst_4",
    name: "Divya Rao",
    message:
      "Flexible timings and genuine care for students. Highly recommend for anyone serious about learning music.",
    imageUrl: null,
    createdAt: "2025-05-01T00:00:00.000Z",
    updatedAt: "2025-05-01T00:00:00.000Z",
  },
];

// ─── Gallery Images ─────────────────────────────────────────────────

export const galleryImages = [
  {
    id: "gal_1",
    url: "https://placehold.co/600x400?text=Gallery+1",
    caption: "Annual day performance",
    createdAt: "2025-01-15T00:00:00.000Z",
    updatedAt: "2025-01-15T00:00:00.000Z",
  },
  {
    id: "gal_2",
    url: "https://placehold.co/600x400?text=Gallery+2",
    caption: "Guitar recital",
    createdAt: "2025-02-10T00:00:00.000Z",
    updatedAt: "2025-02-10T00:00:00.000Z",
  },
  {
    id: "gal_3",
    url: "https://placehold.co/600x400?text=Gallery+3",
    caption: "Piano workshop",
    createdAt: "2025-03-05T00:00:00.000Z",
    updatedAt: "2025-03-05T00:00:00.000Z",
  },
  {
    id: "gal_4",
    url: "https://placehold.co/600x400?text=Gallery+4",
    caption: "Vocals practice session",
    createdAt: "2025-04-20T00:00:00.000Z",
    updatedAt: "2025-04-20T00:00:00.000Z",
  },
  {
    id: "gal_5",
    url: "https://placehold.co/600x400?text=Gallery+5",
    caption: "Student concert",
    createdAt: "2025-05-12T00:00:00.000Z",
    updatedAt: "2025-05-12T00:00:00.000Z",
  },
  {
    id: "gal_6",
    url: "https://placehold.co/600x400?text=Gallery+6",
    caption: "Music festival booth",
    createdAt: "2025-06-01T00:00:00.000Z",
    updatedAt: "2025-06-01T00:00:00.000Z",
  },
];

// ─── Products ───────────────────────────────────────────────────────

export const products = [
  {
    id: "prd_1",
    name: "Acoustic Guitar - Beginner Pack",
    slug: "acoustic-guitar-beginner-pack",
    description:
      "Full-size dreadnought acoustic guitar with picks, strap, and carry bag.",
    price: 499900,
    imageUrls: ["https://placehold.co/600x600?text=Guitar+Pack"],
    stock: 12,
    active: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "prd_2",
    name: "Keyboard Stand - Adjustable",
    slug: "keyboard-stand-adjustable",
    description:
      "Heavy-duty Z-style keyboard stand, adjustable height, fits 61-88 keys.",
    price: 249900,
    imageUrls: ["https://placehold.co/600x600?text=Keyboard+Stand"],
    stock: 20,
    active: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "prd_3",
    name: "Music Theory Workbook",
    slug: "music-theory-workbook",
    description:
      "A comprehensive workbook covering scales, chords, rhythm, and notation for beginners.",
    price: 35000,
    imageUrls: ["https://placehold.co/600x600?text=Workbook"],
    stock: 50,
    active: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "prd_4",
    name: "Studio Monitor Headphones",
    slug: "studio-monitor-headphones",
    description:
      "Over-ear closed-back headphones with flat response, ideal for practice and recording.",
    price: 189900,
    imageUrls: ["https://placehold.co/600x600?text=Headphones"],
    stock: 30,
    active: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
];
