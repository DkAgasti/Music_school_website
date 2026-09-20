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
    photoUrl: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    classes: [classes[1]],
  },
  {
    id: "tch_2",
    name: "Sneha Verma",
    role: "Piano Instructor",
    experience: "10+ Years Experience",
    bio: "Concert pianist and passionate educator specializing in classical piano technique, sight-reading, and expressive playing.",
    photoUrl: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    classes: [classes[2]],
  },
  {
    id: "tch_3",
    name: "Rahul Sharma",
    role: "Guitar Instructor",
    experience: "8+ Years Experience",
    bio: "Acoustic and electric guitar instructor with extensive performance background and music theory foundation.",
    photoUrl: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    classes: [classes[1]],
  },
  {
    id: "tch_4",
    name: "Priya Nair",
    role: "Vocal & Music Theory",
    experience: "6+ Years Experience",
    bio: "Hindustani classical vocalist and voice coach focusing on voice texture, breath control, and ear training.",
    photoUrl: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    classes: [classes[0]],
  },
  {
    id: "tch_5",
    name: "Ishaan Kapoor",
    role: "Vocal Instructor",
    experience: "7+ Years Experience",
    bio: "Contemporary and Western vocal mentor, guiding students in pitch mastery, vocal range extension, and stage presence.",
    photoUrl: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    classes: [classes[0]],
  },
  {
    id: "tch_6",
    name: "Rohit Kulkarni",
    role: "Tabla Instructor",
    experience: "9+ Years Experience",
    bio: "Master of traditional taals, gharana styles, and accompaniment techniques with 9+ years of dedicated teaching.",
    photoUrl: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    classes: [classes[3]],
  },
  {
    id: "tch_7",
    name: "Kavya Menon",
    role: "Violin Instructor",
    experience: "8+ Years Experience",
    bio: "Carnatic and Western classical violinist, specializing in bow precision, fingering technique, and soulful melody.",
    photoUrl: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    classes: [classes[4]],
  },
  {
    id: "tch_8",
    name: "Arjun Das",
    role: "Drums Instructor",
    experience: "5+ Years Experience",
    bio: "Dynamic percussionist coaching students in rhythm theory, rudiments, limb independence, and modern rock/jazz grooves.",
    photoUrl: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    classes: [classes[5]],
  },
];

// Back-fill teachers on each class (mirrors implicit M2N)
classes[0].teachers = [teachers[3], teachers[4]];
classes[1].teachers = [teachers[0], teachers[2]];
classes[2].teachers = [teachers[1]];
if (classes[3]) classes[3].teachers = [teachers[5]];
if (classes[4]) classes[4].teachers = [teachers[6]];
if (classes[5]) classes[5].teachers = [teachers[7]];

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
    name: "Acoustic Guitar",
    title: "Acoustic Guitar",
    slug: "acoustic-guitar",
    category: "instruments",
    tagline: "Perfect for beginners",
    description:
      "Full-size dreadnought acoustic guitar with picks, strap, and carry bag.",
    price: 1200000,
    imageUrls: [],
    stock: 12,
    active: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "prd_2",
    name: "Digital Piano",
    title: "Digital Piano",
    slug: "digital-piano",
    category: "instruments",
    tagline: "Full 88-key weighted",
    description:
      "Full 88-key weighted digital piano with built-in speakers and sustain pedal.",
    price: 2500000,
    imageUrls: [],
    stock: 8,
    active: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "prd_3",
    name: "Tabla Set",
    title: "Tabla Set",
    slug: "tabla-set",
    category: "instruments",
    tagline: "Handcrafted classic pair",
    description:
      "Handcrafted classic Dayan-Bayan pair with cushions and hammer.",
    price: 800000,
    imageUrls: [],
    stock: 15,
    active: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "prd_4",
    name: "Music Theory Workbook",
    title: "Music Theory Workbook",
    slug: "music-theory-workbook",
    category: "books",
    tagline: "For every beginner",
    description:
      "A comprehensive workbook covering scales, chords, rhythm, and notation for beginners.",
    price: 35000,
    imageUrls: [],
    stock: 50,
    active: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "prd_5",
    name: "Violin",
    title: "Violin",
    slug: "violin",
    category: "instruments",
    tagline: "Classic 4/4 size with bow",
    description:
      "Full-size 4/4 violin with bow, rosin, and a padded carry case.",
    price: 1500000,
    imageUrls: [],
    stock: 10,
    active: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "prd_6",
    name: "Drum Kit",
    title: "Drum Kit",
    slug: "drum-kit",
    category: "instruments",
    tagline: "5-piece kit with cymbals",
    description:
      "5-piece beginner drum kit with cymbals, throne, and sticks included.",
    price: 3000000,
    imageUrls: [],
    stock: 6,
    active: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "prd_7",
    name: "Sheet Music Collection",
    title: "Sheet Music Collection",
    slug: "sheet-music-collection",
    category: "books",
    tagline: "50+ popular music sheets",
    description:
      "A curated collection of 50+ popular sheet music arrangements for practice and performance.",
    price: 45000,
    imageUrls: [],
    stock: 40,
    active: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
];

// ─── Student Dashboard ──────────────────────────────────────────────

export const studentDashboard = {
  student: {
    id: "std_1",
    name: "Aarav Sharma",
  },
  stats: {
    enrolledClasses: 3,
    attendance: 92,
    progressStatus: "On Track",
    totalPayments: 1200000,
  },
  enrolledClasses: [
    {
      id: "enr_1",
      name: "Guitar",
      teacher: "Amit Singh",
      schedule: "Mon & Wed | 5:00 PM – 6:00 PM",
      startedDate: "2025-01-01T00:00:00.000Z",
      status: "Active",
    },
    {
      id: "enr_2",
      name: "Piano",
      teacher: "Sneha Verma",
      schedule: "Tue & Thu | 4:00 PM – 5:00 PM",
      startedDate: "2025-01-01T00:00:00.000Z",
      status: "Active",
    },
    {
      id: "enr_3",
      name: "Music Theory",
      teacher: "Priya Nair",
      schedule: "Sat | 11:00 AM – 12:00 PM",
      startedDate: "2025-02-01T00:00:00.000Z",
      status: "Active",
    },
  ],
  progressNotes: [
    {
      id: "pn_1",
      class: "Guitar",
      note: "Improved chord transitions and rhythm.",
      date: "2025-04-10T00:00:00.000Z",
    },
    {
      id: "pn_2",
      class: "Piano",
      note: "Good progress in both hands coordination.",
      date: "2025-04-05T00:00:00.000Z",
    },
  ],
};

export const studentProfile = {
  id: "std_1",
  name: "Aarav Sharma",
  studentIdLabel: "HMS-2025-014",
  status: "Active",
  memberSince: "2025-01-01T00:00:00.000Z",
  email: "aarav.sharma@gmail.com",
  phone: "+91 98111 22334",
  dob: "2008-03-12T00:00:00.000Z",
  guardianName: "Rajesh Sharma",
  guardianPhone: "+91 98111 55667",
  address: "45 Green Park, New Delhi",
};

export const studentAttendance = {
  overall: 92,
  sessionsPresent: 46,
  sessionsAbsent: 4,
  recentSessions: [
    { id: "s1", date: "2025-04-28T00:00:00.000Z", class: "Guitar", time: "5:00 PM – 6:00 PM", status: "Present" },
    { id: "s2", date: "2025-04-26T00:00:00.000Z", class: "Music Theory", time: "11:00 AM – 12:00 PM", status: "Present" },
    { id: "s3", date: "2025-04-24T00:00:00.000Z", class: "Piano", time: "4:00 PM – 5:00 PM", status: "Absent" },
    { id: "s4", date: "2025-04-23T00:00:00.000Z", class: "Guitar", time: "5:00 PM – 6:00 PM", status: "Present" },
    { id: "s5", date: "2025-04-22T00:00:00.000Z", class: "Piano", time: "4:00 PM – 5:00 PM", status: "Present" },
    { id: "s6", date: "2025-04-21T00:00:00.000Z", class: "Guitar", time: "5:00 PM – 6:00 PM", status: "Present" },
    { id: "s7", date: "2025-04-19T00:00:00.000Z", class: "Music Theory", time: "11:00 AM – 12:00 PM", status: "Present" },
    { id: "s8", date: "2025-04-17T00:00:00.000Z", class: "Piano", time: "4:00 PM – 5:00 PM", status: "Present" },
  ],
};

export const studentProgress = {
  classes: [
    { id: "guitar", name: "Guitar", level: "Intermediate Level", percent: 75 },
    { id: "piano", name: "Piano", level: "Improver Level", percent: 60 },
    { id: "music-theory", name: "Music Theory", level: "Advanced Basics", percent: 80 },
  ],
  recentNotes: [
    { id: "pn_1", class: "Guitar", note: "Improved chord transitions and rhythm.", date: "2025-04-10T00:00:00.000Z" },
    { id: "pn_2", class: "Piano", note: "Good progress in both hands coordination.", date: "2025-04-05T00:00:00.000Z" },
    { id: "pn_3", class: "Music Theory", note: "Strong grasp of scales and notation.", date: "2025-03-28T00:00:00.000Z" },
  ],
};

export const studentPayments = {
  totalPaid: 1200000,
  pendingDues: 0,
  nextDueDate: "2025-05-01T00:00:00.000Z",
  transactions: [
    { id: "txn_1", date: "2025-04-01T00:00:00.000Z", description: "Monthly Fee – April", amount: 300000, status: "Paid" },
    { id: "txn_2", date: "2025-03-01T00:00:00.000Z", description: "Monthly Fee – March", amount: 300000, status: "Paid" },
    { id: "txn_3", date: "2025-02-01T00:00:00.000Z", description: "Monthly Fee – February", amount: 300000, status: "Paid" },
    { id: "txn_4", date: "2025-01-05T00:00:00.000Z", description: "Monthly Fee – January", amount: 300000, status: "Paid" },
  ],
};

export const studentAdmissions = [
  { id: "HMS-2025-014", class: "Guitar", appliedOn: "2025-01-05T00:00:00.000Z", batch: "Evening", status: "Approved" },
  { id: "HMS-2025-015", class: "Piano", appliedOn: "2025-01-05T00:00:00.000Z", batch: "Evening", status: "Approved" },
  { id: "HMS-2025-042", class: "Music Theory", appliedOn: "2025-02-01T00:00:00.000Z", batch: "Weekend", status: "Approved" },
  { id: "HMS-2024-102", class: "Vocals", appliedOn: "2024-06-10T00:00:00.000Z", batch: "Weekend", status: "Completed" },
];
