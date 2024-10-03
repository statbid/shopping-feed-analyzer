import React from 'react';
import Header from './components/FileUpload/Header';
import FileUpload from './components/FileUpload/FileUpload';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-grow px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full"> 
          <FileUpload />
        </div>
      </main>
    </div>
  );
}

export default App;
