/**
 * App Component
 *
 * The root component of the application. It structures the application layout by integrating 
 * the header and main content area, and initializes the file upload functionality. 
 * This serves as the entry point for the user interface.
 *
 * Key Functionalities:
 * - **Responsive Layout:** Implements a full-screen layout with a header and a flexible main content area.
 * - **Component Composition:** Integrates the `Header` and `FileUpload` components to provide seamless functionality.
 * - **Styling:** Applies Tailwind CSS classes for consistent and modern styling across the layout.
 *
 * Components:
 * - `Header`: Displays the application title or navigation at the top of the screen.
 * - `FileUpload`: Manages the upload functionality for files.
 *
 * Structure:
 * - The layout uses a vertical flex container to ensure the header remains fixed at the top,
 *   and the main content dynamically adjusts to fill the available space.
 *
 * Export:
 * - The `App` component as the default export for rendering the application.
 */

import React from 'react';
import Header from './components/FileUpload/Header';
import FileUpload from './components/FileUpload/FileUpload';

function App() {
  return (
    <div className="h-screen flex flex-col bg-[#F3F4F6] overflow-hidden font-sans">
      {/* Header Component */}
      <Header />
      
      {/* Main Content Area */}
      <main className="flex-grow px-4 sm:px-6 lg:px-8 py-2 overflow-hidden">
        <div className="h-full"> 
          {/* File Upload Component */}
          <FileUpload />
        </div>
      </main>
    </div>
  );
}

export default App;
