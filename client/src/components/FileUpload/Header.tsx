/**
 * Header Component
 * 
 * This component renders the application's header section. It includes a logo 
 * and sets a consistent background and text style using Tailwind CSS classes.
 * 
 * Styling:
 * - Background color: `#17235E` (Navigation Bar color)
 * - Text color: White
 * - Padding: 4 units (Tailwind CSS utility)
 * 
 * This component is designed to be reusable and lightweight, serving as the 
 * top section of the app's layout.
 */

import React from 'react';

const Header: React.FC = () => (
  <header className="bg-navigationBar text-white p-4">
    <h1 className="text-3xl font-sans">Logo</h1>{/* Placeholder for a logo or app name */}
  </header>
);

export default Header;

