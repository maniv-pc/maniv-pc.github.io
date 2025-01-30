// src/pages/main/components/HowItWorksPage.tsx
import React from 'react';
import myPhoto from "assets/MYSELF.jpg";

export const HowItWorksPage = () => {
  return (
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
              ניסיון של מעל 5 שנים בהרכבת מחשבים
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
            { step: 3, text: "הרכבה ואיסוף בבית העסק ללא עלות נוספת, אם בבית הלקוח - מתווספת עלות יחסית למרחק מהעסק"},
            { step: 4, text: "תוך 2 ימי עסקים נשלחת הצעה עם קישורים לחלקים" },
            { step: 5, text: "ולסיום הלקוח מזמין את החלקים אל המיקום הנבחר והמחשב בבנייה" }

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
};

export default HowItWorksPage;