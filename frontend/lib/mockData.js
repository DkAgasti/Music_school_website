// ─── Classes ─────────────────────────────────────────────────────────

export const classes = [
  {
    id: "cls_guitar",
    name: "Guitar",
    slug: "guitar",
    description:
      "Learn acoustic and electric guitar from fundamentals to advanced techniques.",
    syllabus: "Chords, strumming, fingerpicking, scales, music theory basics.",
    imageUrl: null,
    active: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    batches: [
      {
        id: "bat_guitar_morning",
        classId: "cls_guitar",
        name: "Guitar Morning",
        schedule: "Mon/Wed/Fri 9:00 AM - 10:30 AM",
        capacity: 8,
        active: true,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
      {
        id: "bat_guitar_evening",
        classId: "cls_guitar",
        name: "Guitar Evening",
        schedule: "Tue/Thu/Sat 6:00 PM - 7:30 PM",
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
        amount: 150000,
        durationMonths: 1,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
      {
        id: "fp_guitar_quarterly",
        classId: "cls_guitar",
        name: "Quarterly",
        amount: 400000,
        durationMonths: 3,
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
    description:
      "Master the keyboard with classical and modern piano training.",
    syllabus:
      "Posture, finger exercises, scales, chords, sight-reading, compositions.",
    imageUrl: null,
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
      {
        id: "bat_piano_evening",
        classId: "cls_piano",
        name: "Piano Evening",
        schedule: "Tue/Thu/Sat 5:00 PM - 6:30 PM",
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
        amount: 200000,
        durationMonths: 1,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
      {
        id: "fp_piano_quarterly",
        classId: "cls_piano",
        name: "Quarterly",
        amount: 550000,
        durationMonths: 3,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ],
    teachers: [],
  },
  {
    id: "cls_vocals",
    name: "Vocals",
    slug: "vocals",
    description:
      "Develop your singing voice with breath control, pitch, and stage presence.",
    syllabus:
      "Breathing techniques, pitch training, raga basics, performance skills.",
    imageUrl: null,
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
      {
        id: "bat_vocals_b",
        classId: "cls_vocals",
        name: "Vocals Batch B",
        schedule: "Tue/Thu/Sat 4:00 PM - 5:30 PM",
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
        amount: 120000,
        durationMonths: 1,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
      {
        id: "fp_vocals_quarterly",
        classId: "cls_vocals",
        name: "Quarterly",
        amount: 320000,
        durationMonths: 3,
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
    description:
      "Master the keyboard with classical and modern piano training.",
    syllabus:
      "Posture, finger exercises, scales, chords, sight-reading, compositions.",
    imageUrl: null,
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
      {
        id: "bat_piano_evening",
        classId: "cls_piano",
        name: "Piano Evening",
        schedule: "Tue/Thu/Sat 5:00 PM - 6:30 PM",
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
        amount: 200000,
        durationMonths: 1,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
      {
        id: "fp_piano_quarterly",
        classId: "cls_piano",
        name: "Quarterly",
        amount: 550000,
        durationMonths: 3,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ],
    teachers: [],
  }
];

// ─── Teachers (linked to classes via implicit M2N) ──────────────────

export const teachers = [
  {
    id: "tch_1",
    name: "Arjun Mehta",
    bio: "Classical and fingerstyle guitarist with 12 years of teaching experience.",
    photoUrl: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    classes: [classes[0]],
  },
  {
    id: "tch_2",
    name: "Priya Sharma",
    bio: "ARIA-certified pianist specialising in Hindustani and Western classical.",
    photoUrl: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    classes: [classes[1]],
  },
  {
    id: "tch_3",
    name: "Kavitha Nair",
    bio: "Playback and carnatic vocalist, performed at national-level concerts.",
    photoUrl: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    classes: [classes[2]],
  },
];

// Back-fill teachers on each class (mirrors implicit M2N)
classes[0].teachers = [teachers[0]];
classes[1].teachers = [teachers[1]];
classes[2].teachers = [teachers[2]];

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
