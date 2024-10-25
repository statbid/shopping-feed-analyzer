import React from 'react';
import Header from './components/FileUpload/Header';
import FileUpload from './components/FileUpload/FileUpload';

function App() {
  return (
    <div className="h-screen flex flex-col bg-[#F3F4F6] overflow-hidden font-sans"> {/* Added font-sans to apply Lato font */}
      <Header />
     <main className="flex-grow px-4 sm:px-6 lg:px-8 py-2 overflow-hidden"> {/* Reduced padding-y from 4 to 2 to reduce space */}
        <div className="h-full"> 
          <FileUpload />
        </div>
      </main>
    </div>
  );
}

export default App;
