import React, { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface AdminErrorLoggerProps {
  message: string | null;
  onClose: () => void;
}

export const AdminErrorLogger: React.FC<AdminErrorLoggerProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#da3633] text-white px-5 py-3 rounded-lg shadow-2xl text-xs flex items-center gap-2 animate-bounce">
      <AlertCircle className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
};
