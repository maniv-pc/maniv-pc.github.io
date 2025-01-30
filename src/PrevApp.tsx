import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select';
import { Checkbox } from 'components/ui/checkbox';
import { Label } from 'components/ui/label';
import { RadioGroup, RadioGroupItem } from 'components/ui/radio-group';
import emailjs from '@emailjs/browser';
import { createClient } from '@supabase/supabase-js';

import highEndSechand from "./assets/high-end-sechand.jpg";
import smallStrong from "./assets/small-strong.jpg";
import videoEditing from "./assets/video-editing-pc.jpg";
import learningPC from "./assets/learning-pc.jpg";
import budget2500 from "./assets/budget2500-pc.png";
import myPhoto from "./assets/MYSELF.jpg";
import logo from "./assets/logo.png";

const EMAILJS_SERVICE_ID = 'service_qy3nij6';
const EMAILJS_TEMPLATE_ID = 'template_s27bvkl';
const REFERRAL_TEMPLATE_ID = 'template_19nhiqb'
const EMAILJS_PUBLIC_KEY = 'ulj1-31N6L81zpCEt';

// Initialize Supabase client
const supabaseUrl = 'https://iwpjpjwpksxcduwzspmq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3cGpwandwa3N4Y2R1d3pzcG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NjAxNzksImV4cCI6MjA1MjMzNjE3OX0.37LJ_voXdBYTWB1GcYUuQyTIieNpn3x_jpyRfvLsc7I';
const supabase = createClient(supabaseUrl, supabaseKey);

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
    title: "מחשב תקציבי 2500 שח",
    description: "מחשב שממקסם את התקציב , מריץ משחקים באיכות טובה",
    imageUrl: budget2500
  },
  {
    title: "מחשב למידה",
    description: "מחשב מושלם לסטודנטים ולימודים מקוונים",
    imageUrl: learningPC
  }
];

const HowItWorksPage = () => (
  <div className="container mx-auto p-8 text-white">
    <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
      <div className="md:w-1/2 flex justify-center">
        <div className="relative">
          <img 
            src={myPhoto} 
            alt="יניב הרשקוביץ" 
            className="rounded-full shadow-xl w-64 h-64 object-cover border-4 border-blue-400"
          />
          <div className="absolute -inset-2 rounded-full border-2 border-blue-300 opacity-50"></div>
        </div>
      </div>
      <div className="md:w-1/2">
        <h1 className="text-3xl font-bold mb-6">למה לבחור בי?</h1>
        <ul className="space-y-4 text-lg">
          <li className="flex items-center gap-2">
            <span className="text-blue-400">✓</span>
            ניסיון של מעל 10 שנים בהרכבת מחשבים
          </li>
          <li className="flex items-center gap-2">
            <span className="text-blue-400">✓</span>
            מומחיות בהתאמה אישית לצרכי הלקוח
          </li>
          <li className="flex items-center gap-2">
            <span className="text-blue-400">✓</span>
            שירות אישי ומקצועי לאורך כל התהליך
          </li>
          <li className="flex items-center gap-2">
            <span className="text-blue-400">✓</span>
            אחריות מלאה על העבודה
          </li>
        </ul>
      </div>
    </div>

    <div className="bg-blue-800 rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">איך זה עובד?</h2>
      <div className="grid md:grid-cols-5 gap-6 relative">
        {/* Process arrows */}
        <div className="hidden md:flex absolute top-1/2 left-0 right-0 -z-10">
          <div className="w-full flex justify-between px-20">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="text-4xl text-blue-400">→</div>
            ))}
          </div>
        </div>
        
        {[
          { step: 1, text: "ממלאים טופס הצעה ומזינים את הפרטים" },
          { step: 2, text: "בוחרים בין ייעוץ בלבד, הרכבה בלבד או ייעוץ והרכבה" },
          { step: 3, text: "תוך 2 ימי עסקים נשלחת הצעה עם קישורים לחלקים" },
          { step: 4, text: "הלקוח מזמין את החלקים ומשלוח בהתאם לאפשרות שנבחרה" },
          { step: 5, text: "הרכבה בבית העסק (10%) או בבית הלקוח (15%)" }
        ].map(({ step, text }) => (
          <div key={step} className="bg-blue-700 p-6 rounded-lg text-center relative z-10">
            <div className="text-2xl font-bold mb-2">{step}</div>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const GalleryPage = () => (
  <div className="container mx-auto p-4 text-white">
    <h2 className="text-2xl mb-6">גלריית מחשבים</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {computerGallery.map((computer, index) => (
        <div key={index} className="bg-blue-800 p-4 rounded">
          <h3 className="text-xl mb-2">{computer.title}</h3>
          <p className="mb-4">{computer.description}</p>
          <div className="aspect-w-16 aspect-h-9">
            <img 
              src={computer.imageUrl} 
              alt={computer.title} 
              className="object-contain w-full h-full"
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// const ReferralPage = () => {
//   const [referrerName, setReferrerName] = useState('');
//   const [referrerEmail, setReferrerEmail] = useState('');
//   const [newCustomerName, setNewCustomerName] = useState('');
//   const [newCustomerEmail, setNewCustomerEmail] = useState('');
//   const [generatedCode, setGeneratedCode] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!/^\S+@\S+\.\S+$/.test(referrerEmail) || !/^\S+@\S+\.\S+$/.test(newCustomerEmail)) {
//       alert("כתובות המייל אינן תקינות.");
//       return;
//     }

//     try {
//       const code = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
//       // Save to Supabase
//       const { error } = await supabase
//         .from('referral_codes')
//         .insert([{
//           code,
//           referrer_name: referrerName,
//           referrer_email: referrerEmail,
//           new_customer_name: newCustomerName,
//           new_customer_email: newCustomerEmail,
//           used: false
//         }]);

//       if (error) throw error;
//       setGeneratedCode(code);

//       // Send emails using EmailJS with referral template
//       const response = await emailjs.send(
//         EMAILJS_SERVICE_ID,
//         REFERRAL_TEMPLATE_ID, // Use different template ID for referrals
//         {
//           referrer_name: referrerName,
//           referrer_email: referrerEmail,
//           new_customer_name: newCustomerName,
//           new_customer_email: newCustomerEmail,
//           referral_code: code
//         },
//         EMAILJS_PUBLIC_KEY
//       );

//       if (response.status === 200) {
//         alert("קוד ההפניה נשלח בהצלחה!");
//       }
//     } catch (err) {
//       console.error("שגיאה:", err);
//       alert("שגיאה במהלך שליחת הקוד. נסה שוב מאוחר יותר.");
//     } finally {
//       setIsSubmitting(false);  // End loading
//     }
//   };

//   return (
//     <div className="container mx-auto p-4 bg-blue-900 text-gray-200">
//       <h2 className="text-2xl mb-4">תוכנית הפניות</h2>
//       <div className="bg-blue-800 p-6 rounded mb-8">
//         <h3 className="text-xl mb-2">איך זה עובד?</h3>
//         <p>הבא חבר והרווח 20% הנחה על השירות!</p>
//         <div className="mt-4">
//           <h4 className="font-bold">כללי התוכנית:</h4>
//           <ul className="list-disc pr-5">
//             <li>הלקוח החדש צריך לציין את שמך ואימייל</li>
//             <li>ההנחה תקפה עבור הלקוח החדש</li>
//             <li>ניתן להפנות כמה חברים שתרצה</li>
//           </ul>
//         </div>
//       </div>

//       <Card className="w-full max-w-md mx-auto">
//         <CardHeader>
//           <CardTitle className="text-center">טופס הפניית חבר</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <Label htmlFor="referrerName">שם הלקוח המפנה</Label>
//               <Input
//                 id="referrerName"
//                 value={referrerName}
//                 onChange={(e) => setReferrerName(e.target.value)}
//                 required
//                 className="bg-white text-black"
//               />
//             </div>
//             <div>
//               <Label htmlFor="referrerEmail">אימייל הלקוח המפנה</Label>
//               <Input
//                 id="referrerEmail"
//                 type="email"
//                 value={referrerEmail}
//                 onChange={(e) => setReferrerEmail(e.target.value)}
//                 required
//                 className="bg-white text-black"
//               />
//             </div>
//             <div>
//               <Label htmlFor="newCustomerName">שם החבר המופנה</Label>
//               <Input
//                 id="newCustomerName"
//                 value={newCustomerName}
//                 onChange={(e) => setNewCustomerName(e.target.value)}
//                 required
//                 className="bg-white text-black"
//               />
//             </div>
//             <div>
//               <Label htmlFor="newCustomerEmail">אימייל החבר המופנה</Label>
//               <Input
//                 id="newCustomerEmail"
//                 type="email"
//                 value={newCustomerEmail}
//                 onChange={(e) => setNewCustomerEmail(e.target.value)}
//                 required
//                 className="bg-white text-black"
//               />
//             </div>
//             <Button 
//                 type="submit" 
//                 className="w-full" 
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? "...שולח" : "צור קוד הפניה"}
//               </Button>
//           </form>
//           {generatedCode && (
//             <div className="mt-4 p-4 bg-green-100 text-green-800 rounded text-center">
//               <p className="font-bold">קוד ההפניה שלך:</p>
//               <p className="text-xl">{generatedCode}</p>
//               <p className="text-sm mt-2">*הקוד תקף לשימוש חד פעמי עבור החבר המופנה</p>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

const ComputerBuildWebsite = () => {
  const [selectedOption, setSelectedOption] = useState("consultationAndBuild"); // סוג השירות שנבחר
  const [activePage, setActivePage] = useState('howItWorks');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [budget, setBudget] = useState('');
  const [operatingSystem, setOperatingSystem] = useState('');
  const [customOS, setCustomOS] = useState('');
  const [useTypes, setUseTypes] = useState<string[]>([]);
  const [gameResolution, setGameResolution] = useState('');
  const [videoEditSoftware, setVideoEditSoftware] = useState('');
  const [customVideoSoftware, setCustomVideoSoftware] = useState('');
  const [buildLocation, setBuildLocation] = useState('business');
  const [pickupOrShipping, setPickupOrShipping] = useState('pickup');
  // const [referralCode, setReferralCode] = useState('');
  // const [isValidReferral, setIsValidReferral] = useState(false);
  // const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const operatingSystems = [
    'Windows 11 Pro', 'Windows 11 Home', 'Windows 11 Student',
    'Windows 10 Pro', 'Windows 10 Home', 'Windows 10 Student',
    'Windows 7', 'Linux Mint', 'Ubuntu'
  ];

  useEffect(() => {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }, []);  

  // Price calculation utility function
const calculateServiceCost = (budget: number, option: string, buildLocation: string, pickupOrShipping: string) => {
  if (!budget || budget <= 0) return 0;
  
  let totalCost = 0;
  const baseServiceRate = budget * 0.1; // Base 10% of budget
  
  // Calculate cost based on service option
  switch (option) {
    case "consultationOnly":
      totalCost = baseServiceRate * 0.2; // 20% of base rate for consultation only
      break;
    case "buildOnly":
      totalCost = baseServiceRate * 0.8; // 80% of base rate for build only
      break;
    case "consultationAndBuild":
      totalCost = baseServiceRate; // Full base rate (100%) for both services
      break;
    default:
      totalCost = baseServiceRate;
  }
  
  // Add location surcharge
  if (buildLocation === 'customer') {
    totalCost *= 1.05; // Additional 5% for home build
  }
  
  // Add shipping cost if applicable
  if (buildLocation === 'business' && pickupOrShipping === 'shipping') {
    totalCost += 150; // Fixed shipping cost
  }

  // Apply referral discount if valid
  // if (isValidReferral) {
  //   totalCost *= 0.8; // 20% discount
  // }
  
  return Math.round(totalCost); // Round to nearest shekel
};

// const validateReferralCode = async (code: string) => {
//   try {
//     const { data, error } = await supabase
//       .from('referral_codes')
//       .select('*')
//       .eq('code', code)
//       .eq('used', false)
//       .single();

//     if (error) {
//       console.error('Error validating referral code:', error);
//       return false;
//     }

//     const isValid = !!data;
//     setIsValidReferral(isValid);
//     return isValid;
//   } catch (error) {
//     console.error('Error validating referral code:', error);
//     return false;
//   }
// };

// Update your handleSubmit function:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Input validation
  if (!/^0\d{1,2}-?\d{7}$/.test(phone)) {
    alert("מספר טלפון לא תקין. ניתן להשתמש בפורמט עם מקף בודד או ללא מקפים");
    return;
  }
  
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    alert("כתובת מייל לא תקינה.");
    return;
  }
  
  if (parseFloat(budget) <= 0) {
    alert("יש להזין תקציב גבוה מ-0.");
    return;
  }

  const finalCost = calculateServiceCost(parseFloat(budget), selectedOption, buildLocation, pickupOrShipping);

  try {
    // If there's a valid referral code, mark it as used
    // if (referralCode && isValidReferral) {
    //   const { error: updateError } = await supabase
    //     .from('referral_codes')
    //     .update({ used: true })
    //     .eq('code', referralCode);

    //   if (updateError) throw updateError;
    // }

    // Save form submission
    const { error: submissionError } = await supabase
      .from('form_submissions')
      .insert([{
        full_name: fullName,
        email: email,
        phone: phone,
        budget: parseFloat(budget),
        operating_system: operatingSystem === 'other' ? customOS : operatingSystem,
        use_types: useTypes,
        service_type: selectedOption === "consultationOnly" ? "ייעוץ בלבד" :
                     selectedOption === "buildOnly" ? "הרכבה בלבד" :
                     "ייעוץ והרכבה",
        location_details: buildLocation === 'customer' ? 
                         "הרכבה בבית הלקוח (תוספת 5%)" :
                         `הרכבה בבית העסק ${pickupOrShipping === 'shipping' ? '+ משלוח' : '+ איסוף עצמי'}`,
        service_cost: finalCost,
        video_software: videoEditSoftware === 'other' ? customVideoSoftware : videoEditSoftware,
        game_resolution: gameResolution || null,
        // referral_code: isValidReferral ? referralCode : null
      }]);

    if (submissionError) throw submissionError;

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        full_name: fullName,
        email: email,
        phone: phone,
        budget: budget,
        operating_system: operatingSystem === 'other' ? customOS : operatingSystem,
        use_types: useTypes.join(', '),
        service_type: selectedOption === "consultationOnly" ? "ייעוץ בלבד" :
                   selectedOption === "buildOnly" ? "הרכבה בלבד" :
                   "ייעוץ והרכבה",
        location_details: buildLocation === 'customer' ? 
                       "הרכבה בבית הלקוח (תוספת 5%)" :
                       `הרכבה בבית העסק ${pickupOrShipping === 'shipping' ? '+ משלוח' : '+ איסוף עצמי'}`,
        service_cost: finalCost,
        video_software: videoEditSoftware === 'other' ? customVideoSoftware : videoEditSoftware,
        game_resolution: gameResolution || 'לא צוין'
      }
    );

    if (response.status === 200) {
      alert("ההצעה נשלחה בהצלחה!");
      
      // Reset form
      setFullName('');
      setEmail('');
      setPhone('');
      setBudget('');
      setOperatingSystem('');
      setCustomOS('');
      setUseTypes([]);
      setGameResolution('');
      setVideoEditSoftware('');
      setCustomVideoSoftware('');
      setBuildLocation('business');
      setPickupOrShipping('pickup');
      // setReferralCode('');
      // setIsValidReferral(false);
    } else {
      throw new Error('Failed to send email');
    }
  } catch (error) {
    console.error("שגיאה:", error);
    alert("שגיאה במהלך שליחת ההצעה. נסה שוב מאוחר יותר.");
  }
};

  const renderContent = () => {
    switch(activePage) {
      case 'howItWorks':
        return <HowItWorksPage />;
      // case 'referral':
      //   return <ReferralPage />;
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
                  <>
                    <Select onValueChange={setVideoEditSoftware}>
                      <SelectTrigger className="bg-white text-black">
                        <SelectValue placeholder="תוכנת עריכה מועדפת" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black mt-2 rounded shadow-lg transition-all duration-300">
                        <SelectItem value="Adobe Premiere Pro">Adobe Premiere Pro</SelectItem>
                        <SelectItem value="DaVinci Resolve">DaVinci Resolve</SelectItem>
                        <SelectItem value="Final Cut Pro">Final Cut Pro</SelectItem>
                        <SelectItem value="Vegas Pro">Vegas Pro</SelectItem>
                        <SelectItem value="Adobe After Effects">Adobe After Effects</SelectItem>
                        <SelectItem value="Filmora">Filmora</SelectItem>
                        <SelectItem value="other">אחר</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {videoEditSoftware === 'other' && (
                      <Input 
                        placeholder="פרט את תוכנת העריכה" 
                        value={customVideoSoftware}
                        onChange={(e) => setCustomVideoSoftware(e.target.value)}
                        className="bg-white text-black mt-2"
                      />
                    )}
                  </>
                )}

                <h3 className="mb-2 font-bold text-lg underline">שירות</h3>
                <RadioGroup onValueChange={(value) => setSelectedOption(value)} defaultValue="consultationAndBuild">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center flex-row-reverse space-x-reverse space-x-2 rtl:space-x-reverse">
                      <RadioGroupItem value="consultationOnly" id="consultationOnly" />
                      <Label htmlFor="consultationOnly">ייעוץ בלבד</Label>
                    </div>
                    <div className="flex items-center flex-row-reverse space-x-reverse space-x-2 rtl:space-x-reverse">
                      <RadioGroupItem value="buildOnly" id="buildOnly" />
                      <Label htmlFor="buildOnly">הרכבה בלבד</Label>
                    </div>
                    <div className="flex items-center flex-row-reverse space-x-reverse space-x-2 rtl:space-x-reverse">
                      <RadioGroupItem value="consultationAndBuild" id="consultationAndBuild" />
                      <Label htmlFor="consultationAndBuild">ייעוץ והרכבה (ברירת מחדל)</Label>
                    </div>
                  </div>
                </RadioGroup>

                {/* Show build options only if not consultation only */}
                {selectedOption !== "consultationOnly" && (
                  <>
                    <h3 className="mb-2 font-bold text-lg underline">מיקום הרכבה</h3>
                    <RadioGroup 
                      defaultValue="business" 
                      value={buildLocation}
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
                        value={pickupOrShipping}
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
                    </>
                )}

                {/* <div>
                  <Label htmlFor="referralCode">קוד הפניה (אופציונלי)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="referralCode"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      className="bg-white text-black"
                    />
                    <Button 
                      type="button"
                      disabled={isCheckingCode}
                      onClick={async () => {
                        if (referralCode) {
                          setIsCheckingCode(true);
                          try {
                            const isValid = await validateReferralCode(referralCode);
                            if (isValid) {
                              alert('קוד הפניה תקף! הנחה של 20% תתווסף לחישוב');
                            } else {
                              alert('קוד הפניה לא תקף');
                              setReferralCode('');
                            }
                          } finally {
                            setIsCheckingCode(false);
                          }
                        }
                      }}
                    >
                      {isCheckingCode ? "...בודק" : "בדוק קוד"}
                    </Button>
                  </div>
                </div> */}

                {/* Price Display Section */}
                <div className="font-bold mt-4 p-4 bg-blue-700 rounded">
                  <div className="text-lg mb-2">פירוט עלויות:</div>
                  <div className="space-y-1 text-sm">
                    <div>תקציב בסיס: {budget} ₪</div>
                    <div>סוג שירות: {
                      selectedOption === "consultationOnly" ? "ייעוץ בלבד (20%)" :
                      selectedOption === "buildOnly" ? "הרכבה בלבד (80%)" :
                      "ייעוץ והרכבה (100%)"
                    }</div>
                    {selectedOption !== "consultationOnly" && (
                      <>
                        {buildLocation === 'customer' && <div>תוספת הרכבה בבית לקוח: 5%</div>}
                        {buildLocation === 'business' && pickupOrShipping === 'shipping' && 
                          <div>עלות משלוח: 150 ₪</div>
                        }
                      </>
                    )}
                    <div className="text-lg font-bold mt-2 pt-2 border-t border-blue-600">
                      סה"כ לתשלום: {calculateServiceCost(
                        parseFloat(budget), 
                        selectedOption, 
                        selectedOption === "consultationOnly" ? "business" : buildLocation, 
                        selectedOption === "consultationOnly" ? "pickup" : pickupOrShipping
                      )} ₪
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-500"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "...שולח" : "שלח הצעה"}
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
            src={logo}
            // alt="לוגו מניב לך מחשב" 
            className="w-30 h-12 ml-4"
          />
          <h1 className="text-2xl font-bold">מניב לך מחשב</h1>
        </div>
        <nav className="flex space-x-reverse space-x-4">
          <button 
          onClick={() => setActivePage('howItWorks')} className="hover:text-blue-300">
            איך זה עובד?
          </button>
          <button 
            onClick={() => setActivePage('home')} 
            className="hover:text-blue-200">
           הצעה
          </button>
          <button 
            onClick={() => setActivePage('gallery')} 
            className="hover:text-blue-200">
            גלריה
          </button>
          {/* <button 
            onClick={() => setActivePage('referral')} 
            className="hover:text-blue-200">
            הפניות
          </button> */}
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
