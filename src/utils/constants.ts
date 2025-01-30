import highEndSechand from "../assets/high-end-sechand.jpg";
import smallStrong from "../assets/small-strong.jpg";
import videoEditing from "../assets/video-editing-pc.jpg";
import learningPC from "../assets/learning-pc.jpg";
import budget2500 from "../assets/budget2500-pc.png";

// Computer Gallery Data
export const computerGallery = [
  {
    title: "מחשב קטן ועוצמתי",
    description: "לוח אם קטן עם ביצועים מרשימים, מתאים למקומות מוגבלי שטח",
    imageUrl: smallStrong
  },
  {
    title: "מחשב לעריכת וידאו",
    description: "מעבד חזק ביותר, RAM מקסימלי וכרטיס גרפי מקצועי",
    imageUrl: videoEditing
  },
  {
    title: "מחשב גיימינג יד 2",
    description: "מחשב בחצי מתקציב חדש עם ביצועים מעולים למשחקים",
    imageUrl: highEndSechand
  },
  {
    title: "מחשב תקציבי 2500 שח",
    description: "מחשב שממקסם את התקציב , מריץ משחקים באיכות טובה",
    imageUrl: budget2500
  },
  {
    title: "מחשב למידה",
    description: "מחשב מושלם לסטודנטים ולימודים מקוונים",
    imageUrl: learningPC
  }
] as const;

// Operating Systems Options
export const operatingSystems = [
  'Windows 11 Pro', 'Windows 11 Home', 'Windows 11 Student',
  'Windows 10 Pro', 'Windows 10 Home', 'Windows 10 Student',
  'Windows 7', 'Linux Mint', 'Ubuntu'
] as const;

// Computer Use Types
export const computerUseTypes = [
  { value: 'גיימינג', label: 'גיימינג' },
  { value: 'עריכת וידאו', label: 'עריכת וידאו' },
  { value: 'שימוש רגיל', label: 'שימוש רגיל' },
  { value: 'לימודים', label: 'לימודים' },
  { value: 'תכנות מתקדם', label: 'תכנות מתקדם' }
] as const;

// Gaming Resolutions
export const gamingResolutions = ['4K', '2K', '1080p'] as const;

// Video Editing Software Options
export const videoEditingSoftware = [
  'Adobe Premiere Pro',
  'DaVinci Resolve',
  'Final Cut Pro',
  'Vegas Pro',
  'Adobe After Effects',
  'Filmora',
  'other'
] as const;