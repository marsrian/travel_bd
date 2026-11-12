
export const destinations = [
  {
    id: 1,
    name: "Cox's Bazar Sea Beach",
    nameBn: "কক্সবাজার সমুদ্র সৈকত",
    district: "Cox's Bazar",
    districtBn: "কক্সবাজার",
    category: "Beach",
    categoryBn: "সমুদ্র সৈকত",
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=900",
    opening: "All Day",
    openingBn: "সারাদিন",
    ticket: "Free",
    ticketBn: "বিনামূল্যে",
    slug: "cox-bazar-sea-beach",
  },
  {
    id: 2,
    name: "Ahsan Manzil",
    nameBn: "আহসান মঞ্জিল",
    district: "Dhaka",
    districtBn: "ঢাকা",
    category: "Historical",
    categoryBn: "ঐতিহাসিক",
    image:
      "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=900",
    opening: "9 AM – 5 PM",
    openingBn: "সকাল ৯টা – বিকাল ৫টা",
    ticket: "Check locally",
    ticketBn: "স্থানীয়ভাবে যাচাই করুন",
    slug: "ahsan-manzil",
  },
  {
    id: 3,
    name: "Ratargul Swamp Forest",
    nameBn: "রাতারগুল সোয়াম্প ফরেস্ট",
    district: "Sylhet",
    districtBn: "সিলেট",
    category: "Forest",
    categoryBn: "বন",
    image:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=900",
    opening: "8 AM – 5 PM",
    openingBn: "সকাল ৮টা – বিকাল ৫টা",
    ticket: "Check locally",
    ticketBn: "স্থানীয়ভাবে যাচাই করুন",
    slug: "ratargul-swamp-forest",
  },
  {
    id: 4,
    name: "Somapura Mahavihara",
    nameBn: "সোমপুর মহাবিহার",
    district: "Naogaon",
    districtBn: "নওগাঁ",
    category: "Historical",
    categoryBn: "ঐতিহাসিক",
    image:
      "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=900",
    opening: "9 AM – 5 PM",
    openingBn: "সকাল ৯টা – বিকাল ৫টা",
    ticket: "Check locally",
    ticketBn: "স্থানীয়ভাবে যাচাই করুন",
    slug: "somapura-mahavihara",
  },
];

export const districts = [
  {
    name: "Dhaka",
    nameBn: "ঢাকা",
    image:
      "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=500",
  },
  {
    name: "Chattogram",
    nameBn: "চট্টগ্রাম",
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=500",
  },
  {
    name: "Sylhet",
    nameBn: "সিলেট",
    image:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500",
  },
  {
    name: "Rajshahi",
    nameBn: "রাজশাহী",
    image:
      "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=500",
  },
  {
    name: "Khulna",
    nameBn: "খুলনা",
    image:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=500",
  },
  {
    name: "Barishal",
    nameBn: "বরিশাল",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500",
  },
  {
    name: "Rangpur",
    nameBn: "রংপুর",
    image:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=500",
  },
  {
    name: "Mymensingh",
    nameBn: "ময়মনসিংহ",
    image:
      "https://images.unsplash.com/photo-1511497584788-876760111969?w=500",
  },
];

export const events = [
  {
    title: "Boishakhi Mela",
    titleBn: "বৈশাখী মেলা",
    location: "Dhaka",
    locationBn: "ঢাকা",
    date: "25",
    month: "APR",
    image:
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=400",
  },
  {
    title: "Tea Festival",
    titleBn: "চা উৎসব",
    location: "Sylhet",
    locationBn: "সিলেট",
    date: "15",
    month: "NOV",
    image:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400",
  },
  {
    title: "Sundarban Tourism Festival",
    titleBn: "সুন্দরবন পর্যটন উৎসব",
    location: "Khulna",
    locationBn: "খুলনা",
    date: "01",
    month: "DEC",
    image:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400",
  },
];

export const guides = [
  {
    title: "Top 10 Places to Visit in Bangladesh",
    titleBn: "বাংলাদেশের সেরা ১০টি ভ্রমণ স্থান",
    date: "October 10, 2026",
    image: destinations[0].image,
  },
  {
    title: "How to Plan a Budget Trip",
    titleBn: "কম বাজেটে ভ্রমণের পরিকল্পনা",
    date: "October 5, 2026",
    image: districts[2].image,
  },
  {
    title: "Travel Tips for Cox's Bazar",
    titleBn: "কক্সবাজার ভ্রমণের প্রয়োজনীয় টিপস",
    date: "September 28, 2026",
    image: destinations[0].image,
  },
];
