import React from 'react';
import { Link } from 'react-router-dom';

const LegalFooter = () => {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#2a2d36] bg-[#0f1115]/95 backdrop-blur"
      aria-label="Legal links"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-4 px-4 py-2 text-xs text-slate-400">
        <Link to="/privacy" className="font-medium transition hover:text-slate-200">
          Privacy Policy
        </Link>
        <span className="text-slate-600">|</span>
        <Link to="/terms" className="font-medium transition hover:text-slate-200">
          Terms
        </Link>
        <span className="text-slate-600">|</span>
        <Link to="/disclaimer" className="font-medium transition hover:text-slate-200">
          Disclaimer
        </Link>
      </div>
    </footer>
  );
};

export default LegalFooter;
