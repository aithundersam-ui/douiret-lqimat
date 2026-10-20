import type { Locale } from "./i18n";

const ar = {
  shopName: "دويرة اللقيمات",
  tagline: "مملحات وحلويات تقليدية جزائرية وعصرية",
  nav: { home: "الرئيسية", about: "من نحن", menu: "القائمة", team: "فريقنا", contact: "اتصل بنا" },
  hero: {
    title: "طعم دار جدّتي، كل يوم طازج",
    text: "حلويات تقليدية، حلويات عصرية ومملحات صغيرة، نحضّرها كل صباح في الجزائر العاصمة.",
    seeMenu: "شوف القائمة",
    order: "اطلب على واتساب",
  },
  about: {
    title: "واش نديرو",
    items: [
      { title: "حلويات تقليدية", text: "مقروط، بقلاوة، قريوش، مشوك، دزيريات واللقيمات اللي سمّينا عليها الدار." },
      { title: "حلويات عصرية", text: "تشكيلة عصرية للمناسبات والقهوة، بنفس الذوق والعناية." },
      { title: "مملحات صغيرة", text: "بوراك، محاجب، بيتزا صغيرة، كوكا ومسمن، سخونين من الفرن." },
      { title: "طلبيات المناسبات", text: "أعراس، أعياد، رمضان وختان: اطلب مسبقاً ونحضّرولك صينيتك على ذوقك." },
    ],
  },
  menu: {
    title: "القائمة",
    subtitle: "الأسعار بالدينار الجزائري. التوفر يتبدّل حسب اليوم.",
    all: "الكل",
    seeAll: "القائمة الكاملة",
    menus: { sweets: "قائمة الحلويات", salty: "قائمة المملحات", drinks: "قائمة المشروبات" },
    see: { sweets: "كل الحلويات", salty: "كل المملحات", drinks: "كل المشروبات" },
    perUnit: { piece: "للحبة", kg: "للكيلو", box: "للعلبة", tray: "للصينية" },
    empty: "ما كاين حتى منتوج في هذا الصنف حالياً.",
  },
  team: { title: "فريقنا", subtitle: "الأيادي اللي تخدم كل صباح." },
  contact: {
    title: "زورونا أو اطلبوا",
    address: "العنوان",
    hours: "أوقات العمل",
    phone: "الهاتف",
    follow: "تابعونا",
    preorder: "للطلبيات المسبقة (أعراس، أعياد، مناسبات) راسلونا على واتساب يومين قبل على الأقل.",
  },
  footer: "جميع الحقوق محفوظة",
  staffArea: "فضاء الفريق",
};

const fr: typeof ar = {
  shopName: "Douiret Lqimat",
  tagline: "Salés et sucrés traditionnels algériens et modernes",
  nav: { home: "Accueil", about: "Nous", menu: "Menu", team: "L'équipe", contact: "Contact" },
  hero: {
    title: "Le goût de chez grand-mère, frais chaque jour",
    text: "Gâteaux traditionnels, douceurs modernes et mini salés, préparés chaque matin à Alger.",
    seeMenu: "Voir le menu",
    order: "Commander sur WhatsApp",
  },
  about: {
    title: "Ce que nous faisons",
    items: [
      { title: "Gâteaux traditionnels", text: "Makrout, baklawa, griwech, mchewek, dziriettes et les lqimat qui ont donné leur nom à la maison." },
      { title: "Douceurs modernes", text: "Une sélection moderne pour le café et les fêtes, avec le même soin." },
      { title: "Mini salés", text: "Bourek, mhadjeb, mini pizzas, coca et msemen, tout chauds sortis du four." },
      { title: "Commandes pour fêtes", text: "Mariages, Aïd, Ramadan, circoncisions : commandez à l'avance, on prépare votre plateau sur mesure." },
    ],
  },
  menu: {
    title: "Menu",
    subtitle: "Prix en dinars algériens. La disponibilité change selon le jour.",
    all: "Tout",
    seeAll: "Menu complet",
    menus: { sweets: "Menu sucré", salty: "Menu salé", drinks: "Boissons" },
    see: { sweets: "Tout le sucré", salty: "Tout le salé", drinks: "Toutes les boissons" },
    perUnit: { piece: "la pièce", kg: "le kilo", box: "la boîte", tray: "le plateau" },
    empty: "Aucun produit dans cette catégorie pour le moment.",
  },
  team: { title: "L'équipe", subtitle: "Les mains qui travaillent chaque matin." },
  contact: {
    title: "Venez nous voir ou commandez",
    address: "Adresse",
    hours: "Horaires",
    phone: "Téléphone",
    follow: "Suivez-nous",
    preorder: "Pour les commandes (mariages, Aïd, fêtes), écrivez-nous sur WhatsApp au moins deux jours avant.",
  },
  footer: "Tous droits réservés",
  staffArea: "Espace équipe",
};

const en: typeof ar = {
  shopName: "Douiret Lqimat",
  tagline: "Traditional and modern Algerian savouries and sweets",
  nav: { home: "Home", about: "About", menu: "Menu", team: "Our team", contact: "Contact" },
  hero: {
    title: "Grandma's taste, fresh every day",
    text: "Traditional sweets, modern pastries and mini savouries, made every morning in Algiers.",
    seeMenu: "See the menu",
    order: "Order on WhatsApp",
  },
  about: {
    title: "What we make",
    items: [
      { title: "Traditional sweets", text: "Makrout, baklawa, griwech, mchewek, dziriettes and the lqimat our shop is named after." },
      { title: "Modern pastries", text: "A modern selection for coffee time and celebrations, made with the same care." },
      { title: "Mini savouries", text: "Bourek, mhadjeb, mini pizzas, coca and msemen, warm from the oven." },
      { title: "Event orders", text: "Weddings, Eid, Ramadan and family celebrations: order ahead and we prepare your tray your way." },
    ],
  },
  menu: {
    title: "Menu",
    subtitle: "Prices in Algerian dinars. What's available changes from day to day.",
    all: "All",
    seeAll: "Full menu",
    menus: { sweets: "Sweets Menu", salty: "Salty Menu", drinks: "Drinks Menu" },
    see: { sweets: "All sweets", salty: "All salty snacks", drinks: "All drinks" },
    perUnit: { piece: "each", kg: "per kg", box: "per box", tray: "per tray" },
    empty: "Nothing in this category right now.",
  },
  team: { title: "Our team", subtitle: "The hands at work every morning." },
  contact: {
    title: "Visit us or order",
    address: "Address",
    hours: "Opening hours",
    phone: "Phone",
    follow: "Follow us",
    preorder: "For pre-orders (weddings, Eid, celebrations), message us on WhatsApp at least two days ahead.",
  },
  footer: "All rights reserved",
  staffArea: "Staff area",
};

const dictionaries = { en, ar, fr };

export type Dictionary = typeof ar;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
