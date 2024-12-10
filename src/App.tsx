import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select';
import { Checkbox } from 'components/ui/checkbox';
import { Label } from 'components/ui/label';
import { RadioGroup, RadioGroupItem } from 'components/ui/radio-group';

import highEndSechand from "./assets/high-end-sechand.jpg";
import smallStrong from "./assets/small-strong.jpg";
import videoEditing from "./assets/video-editing-pc.jpg";


const computerGallery = [
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
    title: "מחשב משרדי",
    description: "מחשב יעיל ואמין לעבודה משרדית",
    imageUrl: "/api/placeholder/300/200"
  },
  {
    title: "מחשב למידה",
    description: "מחשב מושלם לסטודנטים ולימודים מקוונים",
    imageUrl: "/api/placeholder/300/200"
  },
  {
    title: "מחשב למעצבים",
    description: "מחשב עם כרטיס גרפי חזק ומסך מקצועי",
    imageUrl: "/api/placeholder/300/200"
  }
];

const GalleryPage = () => (
  <div className="container mx-auto p-4 bg-blue-900 text-white">
    <h2 className="text-2xl mb-6">גלריית מחשבים</h2>
    <div className="grid grid-cols-2 gap-4">
      {computerGallery.map((computer, index) => (
        <div key={index} className="bg-blue-800 p-4 rounded">
          <h3 className="text-xl mb-2">{computer.title}</h3>
          <p className="mb-4">{computer.description}</p>
          <img 
            src={computer.imageUrl} 
            // alt={computer.title} 
            className="w-full h-48 object-cover rounded"
          />
        </div>
      ))}
    </div>
  </div>
);

const ReferralPage = () => (
  <div className="container mx-auto p-4 bg-blue-900 text-gray-200">
    <h2 className="text-2xl mb-4">תוכנית הפניות</h2>
    <div className="bg-blue-800 p-6 rounded">
      <h3 className="text-xl mb-2">איך זה עובד?</h3>
      <p>הבא חבר והרוויח 20% הנחה על השירות!</p>
      <div className="mt-4">
        <h4 className="font-bold">כללי התוכנית:</h4>
        <ul className="list-disc pr-5">
          <li>הלקוח החדש צריך לציין את שמך ואימייל</li>
          <li>ההנחה תקפה עבור הלקוח החדש</li>
          <li>ניתן להפנות כמה חברים שתרצה</li>
        </ul>
      </div>
    </div>
  </div>
);

const ComputerBuildWebsite = () => {
  const [activePage, setActivePage] = useState('home');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [budget, setBudget] = useState('');
  const [operatingSystem, setOperatingSystem] = useState('');
  const [customOS, setCustomOS] = useState('');
  const [useTypes, setUseTypes] = useState<string[]>([]);
  const [gameResolution, setGameResolution] = useState('');
  const [videoEditSoftware, setVideoEditSoftware] = useState('');
  const [buildLocation, setBuildLocation] = useState('business');
  const [pickupOrShipping, setPickupOrShipping] = useState('pickup');

  const operatingSystems = [
    'Windows 11 Pro', 'Windows 11 Home', 'Windows 11 Student',
    'Windows 10 Pro', 'Windows 10 Home', 'Windows 10 Student',
    'Windows 7', 'Linux Mint', 'Ubuntu'
  ];

  const calculateServiceCost = () => {
    const budgetNum = parseFloat(budget);
    let baseCost;

    if (buildLocation === 'customer') {
      baseCost = budgetNum > 10000 ? 1250 : budgetNum * 0.15; // 15% עבור הרכבה בבית הלקוח
    } else {
      baseCost = budgetNum > 10000 ? 1000 : budgetNum * 0.1; // 10% או מקסימום 1000 ₪
    }
    
    if (buildLocation === 'business' && pickupOrShipping === 'shipping') {
      baseCost += 150;
    }

    return baseCost.toFixed(0);
  };

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    const mailtoLink = `mailto:maniv.pc.founder@gmail.com?subject=הצעה חדשה למפרט מחשב&body=
שם מלא: ${fullName}
אימייל: ${email}
טלפון: ${phone}
תקציב: ${budget} ₪
מערכת הפעלה: ${operatingSystem}
סוג שימוש: ${useTypes.join(', ')}
מיקום הרכבה: ${buildLocation}
עלות שירות: ${calculateServiceCost()} ₪`;
    
    window.location.href = mailtoLink;
  };

  const renderContent = () => {
    switch(activePage) {
      case 'referral':
        return <ReferralPage />;
      case 'gallery':
        return <GalleryPage />;
      case 'home':
      default:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-center">שליחת הצעה למפרט</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="mb-2 font-bold text-lg underline">פרטים מזהים</h3>
                <Input 
                  placeholder="שם מלא" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="bg-white text-black"
                />

                <div className="flex space-x-reverse space-x-2">
                  <Input 
                    placeholder="אימייל" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white text-black"
                  />
                  <Input 
                    placeholder="טלפון" 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-white text-black"
                  />
                </div>

                <h3 className="mb-2 font-bold text-lg underline">על בסיס מה נרכיב</h3>
                <Input 
                  type="number" 
                  placeholder="תקציב מחשב" 
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                  className="bg-white text-black"
                />

                <Select onValueChange={setOperatingSystem}>
                  <SelectTrigger className="bg-white text-black">
                    <SelectValue placeholder="מערכת הפעלה" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black mt-2 rounded shadow-lg transition-all duration-300">
                    {operatingSystems.map(os => (
                      <SelectItem key={os} value={os}>{os}</SelectItem>
                    ))}
                    <SelectItem value="other">אחר</SelectItem>
                  </SelectContent>
                </Select>

                {operatingSystem === 'other' && (
                  <Input 
                    placeholder="פרט מערכת הפעלה" 
                    value={customOS}
                    onChange={(e) => setCustomOS(e.target.value)}
                    className="bg-white text-black"
                  />
                )}

                <div>
                  <h3 className="mb-2 font-bold text-lg underline">שימוש במחשב</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'גיימינג', label: 'גיימינג' },
                      { value: 'עריכת וידאו', label: 'עריכת וידאו' },
                      { value: 'שימוש רגיל', label: 'שימוש רגיל' },
                      { value: 'לימודים', label: 'לימודים' },
                      { value: 'תכנות מתקדם', label: 'תכנות מתקדם' }
                    ].map(item => (
                      <div 
                        key={item.value} 
                        className="flex items-center space-x-reverse space-x-2 p-2 rounded"
                      >
                        <Checkbox 
                          id={item.value}
                          onCheckedChange={(checked) => 
                            setUseTypes(prev => checked ? [...prev, item.value] : prev.filter(type => type !== item.value)
                            )
                          }
                        />
                        <Label htmlFor={item.value} className="cursor-pointer">{item.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {useTypes.includes('גיימינג') && (
                  <Select onValueChange={setGameResolution}>
                    <SelectTrigger className="bg-white text-black">
                      <SelectValue placeholder="רזולוצית משחק" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black mt-2 rounded shadow-lg transition-all duration-300">
                      {['4K', '2K', '1080p'].map(res => (
                        <SelectItem key={res} value={res}>{res}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {useTypes.includes('עריכת וידאו') && (
                  <Input 
                    placeholder="תוכנת עריכה מועדפת" 
                    value={videoEditSoftware}
                    onChange={(e) => setVideoEditSoftware(e.target.value)}
                    className="bg-white text-black"
                  />
                )}

                <h3 className="mb-2 font-bold text-lg underline">מיקום הרכבה</h3>
                <RadioGroup 
                  defaultValue="business" 
                  onValueChange={setBuildLocation}
                  className="mb-4"
                >
                  <div className="flex items-center flex-row-reverse space-x-reverse space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="business" id="business" />
                    <Label htmlFor="business">הרכבה בבית העסק</Label>
                  </div>
                  <div className="flex items-center flex-row-reverse space-x-reverse space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="customer" id="customer" />
                    <Label htmlFor="customer">הרכבה בבית הלקוח (תוספת 5%)</Label>
                  </div>
                </RadioGroup>

                {buildLocation === 'business' && (
                  <RadioGroup 
                    defaultValue="pickup" 
                    onValueChange={setPickupOrShipping}
                    className="mb-4"
                  >
                    <div className="flex items-center flex-row-reverse space-x-reverse space-x-2 rtl:space-x-reverse">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup">איסוף מהעסק</Label>
                    </div>
                    <div className="flex items-center flex-row-reverse space-x-reverse space-x-2 rtl:space-x-reverse">
                      <RadioGroupItem value="shipping" id="shipping" />
                      <Label htmlFor="shipping">משלוח לבית הלקוח (150 ₪)</Label>
                    </div>
                  </RadioGroup>
                )}

                <div className="font-bold">
                  עלות השירות: {calculateServiceCost()} ₪
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">
                  שלח הצעה
                </Button>
              </form>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div 
      dir="rtl" 
      className="container mx-auto p-4 bg-blue-950 text-white min-h-screen flex flex-col w-full h-full"
    >
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <img 
            src={require('./assets/logo.png')} 
            // alt="לוגו מניב לך מחשב" 
            className="w-30 h-12 ml-4"
          />
          <h1 className="text-2xl font-bold">מניב לך מחשב</h1>
        </div>
        <nav className="flex space-x-reverse space-x-4">
          <button 
            onClick={() => setActivePage('home')} 
            className="hover:text-blue-200"
          >
            דף הבית
          </button>
          <button 
            onClick={() => setActivePage('gallery')} 
            className="hover:text-blue-200"
          >
            גלריה
          </button>
          <button 
            onClick={() => setActivePage('referral')} 
            className="hover:text-blue-200"
          >
            הפניות
          </button>
        </nav>
      </header>

      <main className="flex-grow">
        {renderContent()}
      </main>

      <footer className="w-full bg-black text-white p-3 text-center mb-0 mt-2.5">
        <div>© 2024 מניב לך מחשב. כל הזכויות שמורות.</div>
        <div>יניב הרשקוביץ - הרכבת מחשבים מותאמת אישית</div>
        <div>צור קשר: 054-5810287 | maniv.pc.founder@gmail.com</div>
      </footer>
    </div>
  );
};

export default ComputerBuildWebsite;
