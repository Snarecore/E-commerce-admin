import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type AppearanceLanguage = 'en' | 'bn'

const LANGUAGE_STORAGE_KEY = 'bazaarbound-appearance-language'

const BANGLA: Record<string, string> = {
  Appearance: 'ড্যাশবোর্ড রূপ ও থিম (Admin Appearance)',
  'Controls the look of every form, button and table in the dashboard. Settings apply instantly to this admin panel.':
    'এডমিন প্যানেলের প্রতিটি ফর্ম, বাটন, টেবিল ও স্ক্রলবারের ডিজাইন ও থিম এখান থেকে নিয়ন্ত্রণ করুন।',
  'Customize the storefront appearance, design system, theme colors, and layout presets in real-time.':
    'এখান থেকে ফ্রন্টএন্ড স্টোরফ্রন্টের থিম কালার, ফন্ট ও ভিজ্যুয়াল স্টাইল রিয়েল-টাইমে সাজান।',
  'Reduce motion': 'অ্যানিমেশন কমান (Reduce motion)',
  'Reset to theme defaults': 'থিমের আগের সেটিংসে ফিরুন',
  'Restore defaults': 'সব ডিফল্টে রিসেট করুন',
  Theme: 'থিম বাছাই (Theme Presets)',
  'Each theme sets its own palette, shape and density. Pick one as a starting point, then adjust anything below.':
    'প্রতিটি থিমে রং, কোণা, ফিল্ডের মাপ ও ঘনত্ব আলাদা। পছন্দের একটি থিম বেছে নিয়ে নিচের সেটিংস নিজের মতো করে সাজান।',
  'Theme studio': 'কাস্টম থিম স্টুডিও (Theme Studio)',
  'Density & typography': 'ফিল্ডের মাপ ও ফন্ট সাইজ',
  'Control height drives every input, select and button at once.':
    'এখান থেকে ইনপুট, ড্রপডাউন ও বাটনের উচ্চতা এবং ফন্টের আকার নির্ধারণ করুন।',
  'Control height': 'ফিল্ড ও বাটনের উচ্চতা',
  'Base font size': 'লেখার সাইজ (Font Scale)',
  'Font family': 'ফন্ট স্টাইল (Font Family)',
  'Field & label style': 'ফিল্ড ও লেবেলের ধরন',
  'How every input is drawn and where its label sits. Inline labels fall back to stacked on phone-width screens.':
    'ফিল্ডের স্টাইল কেমন হবে এবং লেবেল কোথায় থাকবে ঠিক করুন। ছোট স্ক্রিনে লেবেল নিজে থেকেই ওপরে থাকবে।',
  'Field style': 'ফিল্ডের ডিজাইন',
  'Label placement': 'লেবেল কোথায় বসবে?',
  'Label case': 'লেবেলের অক্ষর বিন্যাস',
  'Required indicator': 'আবশ্যকীয় ফিল্ড নির্দেশক',
  'Focus indicator': 'ক্লিক করলে ফোকাস কীভাবে দেখাবে?',
  'Primary button style': 'বাটন দেখতে কেমন হবে?',
  'Validation feedback': 'ভুল তথ্য দিলে কীভাবে দেখাবে?',
  'Choose how invalid fields and their messages appear.':
    'তথ্য ভুল বা ফাঁকা থাকলে ফিল্ড ও বার্তা কীভাবে হাইলাইট হবে, বেছে নিন।',
  'Shape & borders': 'কোণা, বর্ডার ও ছায়া (Shape & Elevation)',
  'Tune corner radius, border weight and elevation independently of the theme.':
    'থিমের রং না বদলিয়েও কার্ড ও ফিল্ডের কোণা, বর্ডারের পুরুত্ব ও ড্রপ-শ্যাডো আলাদা করে ঠিক করুন।',
  'Corner radius': 'কোণা কতটা গোল হবে (Radius)',
  'Border weight': 'বর্ডার কতটা স্পষ্ট হবে?',
  Elevation: 'ছায়া কেমন হবে (Shadow)?',
  'Accent colour': 'ব্র্যান্ডের মূল রং (Accent Color)',
  'Overrides the theme accent. Hover, light and dark shades are derived automatically.':
    'থিমের মূল রং বদলান। মাউস হোভার, হালকা ও গাঢ় শেড স্বয়ংক্রিয়ভাবে তৈরি হবে।',
  'Table & layout': 'টেবিল ও পেজের মাপ (Table & Layout)',
  'Row height and content width for data screens, separate from form density.':
    'টেবিলের সারির উচ্চতা এবং ড্যাশবোর্ডের সর্বোচ্চ চওড়া নির্ধারণ করুন।',
  'Page content width': 'পেজের প্রশস্ততা (Max Width)',
  'Table row height': 'টেবিলের সারির উচ্চতা (Row Height)',
  'Table row appearance': 'টেবিলের সারির ডিজাইন',
  Dialogs: 'মডাল ও ডায়ালগ বক্স',
  'Adjust the shared modal and confirmation dialog treatment.':
    'পপ-আপ ও নিশ্চিতকরণ ডায়ালগের ডিজাইন বেছে নিন।',
  'Dialog appearance': 'ডায়ালগ দেখতে কেমন হবে?',
  'Alerts & notifications': 'নোটিশ ও মেসেজ স্টাইল',
  'Choose how success, error, and loading notifications are presented.':
    'কাজ সফল, ভুল বা লোড হওয়ার মেসেজ কীভাবে দেখাবে, তা নির্ধারণ করুন।',
  'Notification appearance': 'নোটিশের ধরন',
  'Saved configurations': 'সেভ করা কনফিগারেশন (Presets)',
  'Store the current setup under a name, or move it to another browser as a file. Saved here, not on the server.':
    'আপনার পছন্দের সেটিংস একটি নামে সেভ করে রাখুন, অথবা ফাইল আকারে অন্য ডিভাইসে ব্যবহার করুন।',
  'Live preview': 'লাইভ প্রিভিউ (Live Preview)',
  'Real components': 'বাস্তব কম্পোনেন্ট',
  'Current configuration': 'বর্তমান কনফিগারেশন বিবরণ',
  'setting overridden from the': 'টি সেটিংস পরিবর্তন করা হয়েছে —',
  'setting overrides from the': 'টি সেটিংস পরিবর্তন করা হয়েছে —',
  'Search fonts': 'ফন্ট খুঁজুন...',
  'Search by name or use — e.g. tables, Bengali, reports': 'নাম বা ব্যবহারের ধরন লিখে খুঁজুন — যেমন Bengali, Inter, Reports',
  'Bengali sample': 'বাংলা নমুনা দেখুন',
  'Button text on accent': 'অ্যাকসেন্ট বাটনে লেখার স্পষ্টতা',
  'Accent text on white': 'সাদা ব্যাকগ্রাউন্ডে রঙের স্পষ্টতা',
  'No font matches': 'কোনো ফন্ট পাওয়া যায়নি',
  'Preset name': 'প্রিসেটের নাম',
  'Save current': 'বর্তমান সেটিংস সেভ করুন',
  'New theme': 'নতুন থিম তৈরি করুন',
  Import: 'ইমপোর্ট',
  'Export all': 'সব এক্সপোর্ট',
  'From theme': 'থিম থেকে প্রাপ্ত',
  Outlined: 'আউটলাইন্ড (বক্স বর্ডার)',
  Filled: 'ফিল্ড (ভরাট ব্যাকগ্রাউন্ড)',
  Soft: 'সফট (হালকা রঙ)',
  Underlined: 'আন্ডারলাইনড (নিচে দাগ)',
  Top: 'উপরে (Top)',
  Left: 'বামে (Left)',
  'Normal Case': 'স্বাভাবিক (Normal)',
  UPPERCASE: 'বড় হাতের অক্ষর (UPPERCASE)',
  'Asterisk (*)': 'স্টার চিহ্ন (*)',
  'Text tag': 'টেক্সট ট্যাগ (required)',
  None: 'কোনোটি নয়',
  'Accent Ring': 'আলোকিত রিং (Ring)',
  'Crisp Border': 'স্পষ্ট বর্ডার (Border)',
  'Bottom Bar': 'নিচে রেখা (Bottom Line)',
  'Soft Glow': 'মৃদু আভা (Glow)',
  'Solid Fill': 'গাঢ় ফিল্ড বাটন',
  'Soft Tint': 'হালকা শেড বাটন',
  'Red Border': 'লাল বর্ডার',
  'Tinted Fill': 'হালকা লাল ব্যাকগ্রাউন্ড',
  'Callout Box': 'কলআউট বক্স',
  'Plain Rows': 'সাদা সারি',
  'Zebra Striped': 'জেব্রা স্ট্রাইপ (একান্তর রঙ)',
  Standard: 'স্ট্যান্ডার্ড',
  'Brand Header Strip': 'ব্র্যান্ড টপ বার',
  Compact: 'কমপ্যাক্ট (ঘন)',
  Default: 'ডিফল্ট (ভারসাম্যপূর্ণ)',
  Comfortable: 'কমফোর্টেবল (প্রসারিত)',
  Small: 'ছোট (Small)',
  Medium: 'মাঝারি (Medium)',
  Large: 'বড় (Large)',
  'Extra Large': 'অনেক বড় (Extra Large)',
  Sharp: 'ধারালো কোণা (0px)',
  Subtle: 'হালকা কোণা (5px)',
  Rounded: 'গোল কোণা (10px)',
  'Pill / Soft': 'সফট পিল (14px)',
  'Extra Rounded': 'অতিরিক্ত গোল (20px)',
  Hairline: 'চিকন (1px)',
  Strong: 'পুরু (2px)',
  Flat: 'ফ্ল্যাট (ছায়াহীন)',
  Raised: 'উঁচু (স্পষ্ট ছায়া)',
  Form: 'ফর্ম প্রিভিউ',
  Table: 'টেবিল প্রিভিউ',
  Buttons: 'বাটন প্রিভিউ',
  Dialog: 'ডায়ালগ প্রিভিউ',
  'Customer name': 'গ্রাহকের নাম',
  'Invoice amount': 'চালানের পরিমাণ',
  'Payment method': 'মূল্য পরিশোধ মাধ্যম',
  Cash: 'ক্যাশ',
  'Bank transfer': 'ব্যাংক ট্রান্সফার',
  'Mobile banking': 'বিকাশ / নগদ',
  'Reference (read-only)': 'রেফারেন্স আইডি (রিড-অনলি)',
  Discount: 'ছাড় / ডিসকাউন্ট (৳)',
  'Discount cannot be negative': 'ডিসকাউন্টের মান ঋণাত্মক হতে পারে না',
  Note: 'অতিরিক্ত নোট',
  'Order details...': 'অর্ডারের বিবরণ লিখুন...',
  Save: 'সংরক্ষণ করুন',
  Cancel: 'বাতিল',
  Status: 'অবস্থা',
  Invoice: 'ইনভয়েস',
  Customer: 'গ্রাহক',
  Amount: 'টাকার পরিমাণ',
  Paid: 'পরিশোধিত',
  Due: 'বকেয়া',
  Partial: 'আংশিক',
  'Primary Button': 'মূল বাটন',
  'Secondary Button': 'সেকেন্ডারি বাটন',
  'Subtle Button': 'সাবটল বাটন',
  'Ghost Button': 'ঘোস্ট বাটন',
  'Danger Button': 'ডিলিট বাটন',
  'Main Color (Amber)': 'প্রধান কালার (অ্যাম্বার)',
  'Confirm order #FT-9042?': 'অর্ডার #FT-9042 নিশ্চিত করবেন?',
  'This order will be moved to the packing and dispatch queue. Customer will be notified via SMS.':
    'এই অর্ডারটি প্যাকিং ও ডেলিভারি লাইনে স্থানান্তরিত হবে। গ্রাহককে এসএমএস পাঠানো হবে।',
  'Cancel order': 'অর্ডার বাতিল',
  'Confirm and Dispatch': 'নিশ্চিত ও প্রেরণ করুন',
  'Build your own theme, or paste the colours from a theme you own to convert it. Only colour values are read — no CSS or assets are copied.':
    'আপনার ব্র্যান্ডের রঙের সাথে মিলিয়ে নতুন থিম তৈরি করুন, অথবা লোগো আপলোড করে স্বয়ংক্রিয়ভাবে থিম জেনারেট করুন।',
  Storefront: 'স্টোরফ্রন্ট (Website)',
  'Storefront (Website)': 'স্টোরফ্রন্ট শোরুম',
  'Real-time customer storefront preview': 'কাস্টমারদের ওয়েবসাইট শোরুমের লাইভ প্রিভিউ',
  'Special Eid Collection 2026 - Flat 20% Off | Code: EID26': '✨ স্পেশাল ঈদ কালেকশন ২০২৬ - ফ্ল্যাট ২০% ছাড়! কোড: EID26',
  'Fashion Time': 'ফ্যাশন টাইম',
  'Search sarees, panjabis...': 'শাড়ি, পাঞ্জাবি বা অন্য পোশাক খুঁজুন...',
  All: 'সবগুলো',
  Panjabi: 'পাঞ্জাবি',
  Kurti: 'কুর্তি',
  Saree: 'শাড়ি',
  Kids: 'কিডস',
  'Embroidered Georgette Saree': 'এমব্রয়ডারি জর্জেট শাড়ি',
  'Royal Semi-Silk Panjabi': 'রয়্যাল সেমি-সিল্ক পাঞ্জাবি',
  'Add to Bag': 'ব্যাগে যোগ করুন',
  BESTSELLER: 'সেরা বিক্রয়',
  '-20% OFF': '-২০% ছাড়',
  'Free Delivery ৳ 1,500+': '৳ ১,৫০০+ অর্ডারে ফ্রি ডেলিভারি',
  '7 Days Return': '৭ দিনে সহজ রিটার্ন',
  '100% Original': '১০০% অরিজিনাল পণ্য',
  'Publish to Storefront': 'স্টোরফ্রন্টে পাবলিশ করুন',
  'Storefront theme synchronized!': 'স্টোরফ্রন্ট থিম সফলভাবে সিঙ্ক হয়েছে!',
}

interface AppearanceLanguageContextValue {
  language: AppearanceLanguage
  setLanguage: (lang: AppearanceLanguage) => void
  t: (english: string) => string
}

const AppearanceLanguageContext = createContext<AppearanceLanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
  t: (str) => str,
})

export const AppearanceLanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppearanceLanguage>(() => {
    if (typeof window === 'undefined') return 'en'
    try {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
      return stored === 'bn' ? 'bn' : 'en'
    } catch {
      return 'en'
    }
  })

  const setLanguage = (next: AppearanceLanguage) => {
    setLanguageState(next)
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next)
    } catch {
      // Ignore
    }
  }

  const t = useMemo(
    () => (english: string) => {
      if (language === 'bn') {
        return BANGLA[english] ?? english
      }
      return english
    },
    [language]
  )

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t])

  return (
    <AppearanceLanguageContext.Provider value={value}>
      {children}
    </AppearanceLanguageContext.Provider>
  )
}

export const useAppearanceLanguage = () => useContext(AppearanceLanguageContext)

export const useAppearanceTranslation = () => {
  const { t } = useAppearanceLanguage()
  return t
}
