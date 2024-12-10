/**
 * Toast Component
 *
 * This component displays a brief notification message (toast) at the top-right corner of the screen.
 * It automatically disappears after a set duration (3 seconds by default).
 *
 * Features:
 * - **Type-based Styling**: Displays different colors based on the toast type (`success` or `error`).
 * - **Auto-close**: Automatically closes after 3 seconds, but can also be manually closed via the `onClose` callback.
 *
 * Props:
 * - `type`: The type of the toast, either 'success' or 'error'. Determines the background color.
 * - `message`: The message to be displayed in the toast.
 * - `onClose`: A callback function triggered when the toast is dismissed.
 *
 * Styling:
 * - Uses Tailwind CSS for styling.
 * - Success type: Green background (`bg-green-600`).
 * - Error type: Red background (`bg-red-600`).
 * - Positioned at the top-right corner of the screen (`fixed top-4 right-4`).
 */

import React, { useEffect } from 'react';

interface ToastProps {
  type: 'success' | 'error'; // Determines the visual style of the toast
  message: string; // The message displayed in the toast
  onClose: () => void; // Callback to close the toast
}

const Toast: React.FC<ToastProps> = ({ type, message, onClose }) => {
  // Set up a timer to automatically close the toast after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    // Cleanup the timer if the component unmounts or `onClose` changes
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      <p>{message}</p>
    </div>
  );
};

export default Toast;
