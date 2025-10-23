import React from 'react';

const StudentCharacter = () => {
  return (
    <div className="flex flex-col items-center p-8 bg-gradient-to-br from-slate-50 to-slate-200 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
      {/* Head - Junior high student face */}
      <div className="relative w-36 h-40 bg-gradient-to-br from-amber-100 via-orange-100 to-amber-200 rounded-full shadow-xl mb-2 border-2 border-amber-50" style={{borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'}}>
        
        {/* Hair - Teen styled hair */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-40 h-28 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-t-full shadow-lg" style={{borderRadius: '50% 50% 40% 40% / 80% 80% 20% 20%'}}></div>
        <div className="absolute -top-1 -left-5 w-14 h-20 bg-gradient-to-r from-slate-800 to-slate-900 rounded-r-full transform rotate-12 shadow-md"></div>
        <div className="absolute -top-1 -right-5 w-14 h-20 bg-gradient-to-l from-slate-800 to-slate-900 rounded-l-full transform -rotate-12 shadow-md"></div>
        
        {/* Forehead highlight */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-white opacity-30 rounded-full blur-sm"></div>

        {/* Eyebrows */}
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 flex space-x-8 z-10">
          <div className="w-6 h-2 bg-slate-700 rounded-full transform -rotate-12"></div>
          <div className="w-6 h-2 bg-slate-700 rounded-full transform rotate-12"></div>
        </div>

        {/* Eyes - Junior high student eyes */}
        <div className="absolute top-14 left-1/2 transform -translate-x-1/2 flex space-x-5 z-10">
          <div className="relative w-5 h-5 bg-white rounded-full shadow-inner border border-gray-200">
            <div className="absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-gradient-to-br from-brown-600 to-brown-800 rounded-full"></div>
            <div className="absolute top-1 left-1.5 w-1.5 h-1.5 bg-black rounded-full"></div>
            <div className="absolute top-1.5 left-2 w-0.5 h-0.5 bg-white rounded-full"></div>
          </div>
          <div className="relative w-5 h-5 bg-white rounded-full shadow-inner border border-gray-200">
            <div className="absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-gradient-to-br from-brown-600 to-brown-800 rounded-full"></div>
            <div className="absolute top-1 left-1.5 w-1.5 h-1.5 bg-black rounded-full"></div>
            <div className="absolute top-1.5 left-2 w-0.5 h-0.5 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Nose - Teen proportions */}
        <div className="absolute top-18 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-2.5 h-5 bg-gradient-to-b from-amber-200 to-amber-300 rounded-full shadow-sm"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
            <div className="w-0.5 h-0.5 bg-amber-400 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-amber-400 rounded-full"></div>
          </div>
        </div>

        {/* Mouth - Teen smile */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-10 h-3 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full shadow-sm"></div>
          <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-rose-600 rounded-full opacity-60"></div>
        </div>

        {/* Cheeks */}
        <div className="absolute bottom-12 left-3 w-3 h-3 bg-rose-200 rounded-full opacity-50"></div>
        <div className="absolute bottom-12 right-3 w-3 h-3 bg-rose-200 rounded-full opacity-50"></div>
      </div>

      {/* Body - Junior high student outfit */}
      <div className="relative w-48 mt-1">
        
        {/* School Uniform Shirt */}
        <div className="relative w-44 h-28 mx-auto bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-t-2xl rounded-b-md shadow-lg z-20 border border-gray-200">
          {/* School logo/emblem */}
          <div className="absolute top-3 left-3 w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full border-2 border-white shadow-sm">
            <div className="absolute top-1 left-1 w-4 h-4 bg-white opacity-30 rounded-full"></div>
          </div>
          
          {/* Shirt collar */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-white border-2 border-gray-200 rounded-b-lg shadow-inner z-30"></div>
          
          {/* Sleeve shadows */}
          <div className="absolute top-0 -left-3 w-14 h-18 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full transform -rotate-12 shadow-md"></div>
          <div className="absolute top-0 -right-3 w-14 h-18 bg-gradient-to-bl from-gray-100 to-gray-200 rounded-full transform rotate-12 shadow-md"></div>
        </div>

        {/* Arms */}
        <div className="absolute top-2 -left-6 w-10 h-20 bg-gradient-to-b from-amber-200 to-amber-300 rounded-full shadow-md transform -rotate-12"></div>
        <div className="absolute top-2 -right-6 w-10 h-20 bg-gradient-to-b from-amber-200 to-amber-300 rounded-full shadow-md transform rotate-12"></div>

        {/* School Pants - Navy blue */}
        <div className="w-40 h-36 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 mx-auto rounded-t-sm rounded-b-2xl mt-6 shadow-xl relative border-t border-slate-600">
          
          {/* Belt */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-full h-3 bg-gradient-to-r from-black to-gray-800 rounded-full shadow-sm"></div>
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-sm shadow-sm border border-gray-300"></div>
          
          {/* Pants seam */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-0.5 h-16 bg-slate-900 opacity-60 rounded-full"></div>
          
          {/* Pockets */}
          <div className="absolute top-6 left-5 w-6 h-8 border border-slate-800 rounded-sm opacity-40"></div>
          <div className="absolute top-6 right-5 w-6 h-8 border border-slate-800 rounded-sm opacity-40"></div>
        </div>
      </div>

      {/* School Shoes - Black leather shoes */}
      <div className="flex w-44 justify-between mt-3 relative">
        <div className="relative w-16 h-10 bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-lg transform rotate-2">
          {/* Shoe sole */}
          <div className="absolute -bottom-0.5 -left-0.5 w-17 h-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full shadow-sm"></div>
          {/* Shoe details */}
          <div className="absolute top-2 left-2 w-8 h-1 bg-gray-700 rounded-full"></div>
          <div className="absolute top-4 left-3 w-6 h-0.5 bg-gray-600 rounded-full"></div>
        </div>
        <div className="relative w-16 h-10 bg-gradient-to-bl from-gray-900 to-black rounded-lg shadow-lg transform -rotate-2">
          {/* Shoe sole */}
          <div className="absolute -bottom-0.5 -right-0.5 w-17 h-3 bg-gradient-to-l from-gray-700 to-gray-800 rounded-full shadow-sm"></div>
          {/* Shoe details */}
          <div className="absolute top-2 right-2 w-8 h-1 bg-gray-700 rounded-full"></div>
          <div className="absolute top-4 right-3 w-6 h-0.5 bg-gray-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default StudentCharacter;