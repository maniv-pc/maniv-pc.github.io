import React, { useState } from 'react';
import { Button } from "components/ui/button";
import logo from "assets/logo.png";  // Adjust path based on your assets location

// Import page components
import { HowItWorksPage } from './components/HowItWorksPage';
import { GalleryPage } from './components/GalleryPage';
import { OfferPage } from './components/OfferPage';

// Main component
const MainWebsite = () => {
  const [activePage, setActivePage] = useState('howItWorks');

  const renderContent = () => {
    switch(activePage) {
      case 'gallery':
        return <GalleryPage />;
      case 'offer':
        return <OfferPage />;
      case 'howItWorks':
      default:
        return <HowItWorksPage />;
    }
  };

  return (
    <div 
      dir="rtl" 
      className="p-4 bg-blue-950 text-white min-h-screen flex flex-col w-full h-full"
    >
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <img 
            src={logo}
            alt="לוגו מניב לך מחשב" 
            className="w-30 h-12 ml-4"
          />
          <h1 className="text-2xl font-bold">מניב לך מחשב</h1>
        </div>
        <nav className="flex space-x-reverse space-x-4">
          <Button 
            onClick={() => setActivePage('howItWorks')} 
            variant="ghost"
            className={`hover:text-blue-300 ${activePage === 'howItWorks' ? 'text-blue-400' : ''}`}
          >
            איך זה עובד?
          </Button>
          <Button 
            onClick={() => setActivePage('offer')} 
            variant="ghost"
            className={`hover:text-blue-200 ${activePage === 'offer' ? 'text-blue-400' : ''}`}
          >
            הצעה
          </Button>
          <Button 
            onClick={() => setActivePage('gallery')} 
            variant="ghost"
            className={`hover:text-blue-200 ${activePage === 'gallery' ? 'text-blue-400' : ''}`}
          >
            גלריה
          </Button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="w-full bg-black text-white p-3 text-center mb-0 mt-2.5">
        <div>© 2024 מניב לך מחשב. כל הזכויות שמורות.</div>
        <div>יניב הרשקוביץ - הרכבת מחשבים מותאמת אישית</div>
        <div>צור קשר: 054-5810287 | maniv.pc.founder@gmail.com</div>
      </footer>
    </div>
  );
};

export default MainWebsite;