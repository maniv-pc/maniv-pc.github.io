// src/pages/main/components/GalleryPage.tsx
import React from 'react';
import { computerGallery } from 'utils/constants';

export const GalleryPage = () => {
  return (
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
};

export default GalleryPage;