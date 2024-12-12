
/**
 * InfoModal Component
 *
 * This component renders a modal overlay with information about the Google Shopping Feed Analyzer.
 * The modal explains the problem the project addresses and its importance.
 *
 * Props:
 * - `isOpen` (boolean): Controls whether the modal is visible.
 * - `onClose` (function): Callback function triggered when the modal is closed.
 *
 * Key Features:
 * - Overlay is dismissed when clicking outside the modal or on the close button.
 * - Styled with Tailwind CSS for a responsive and visually appealing layout.
 *
 * Dependencies:
 * - React (required for functional components).
 * - Tailwind CSS (used for styling the modal).
 */


import React from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#FCFCFC] rounded-lg p-8 max-w-lg w-full relative shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-[#232323] hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-[#17235E]">Google Shopping Feed Analyzer</h2>
        <h3 className="text-lg font-semibold mb-2 text-[#232323]">
          What is the problem and why is this important?
        </h3>
        <p className="text-base mb-4 text-[#232323]">
          <strong>Problem Statement:</strong> Maintaining high-quality product data in shopping feeds is crucial for maximizing visibility, reducing disapproved products, and enhancing overall ad performance. Many businesses rely on external systems to monitor and improve feed quality, but these solutions can be inflexible, costly, or not fully integrated into existing workflows. This project aims to provide an open-source solution that enables users to perform comprehensive quality checks on their shopping feeds, ensuring data accuracy, consistency, and compliance with best practices, without relying on third-party tools.
        </p>
      </div>
    </div>
  );
};

export default InfoModal;
