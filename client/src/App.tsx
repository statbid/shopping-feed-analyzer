import React from 'react';
import Header from './components/FileUpload/Header';
import FileUpload from './components/FileUpload/FileUpload';

function App() {
  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <Header />
      <main className="flex-grow px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
        <div className="h-full"> 
          <FileUpload />
        </div>
      </main>
    </div>
  );
}

export default App;