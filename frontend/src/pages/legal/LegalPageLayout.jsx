import React from 'react';
import { Link } from 'react-router-dom';

const LegalPageLayout = ({ title, updatedAt, children }) => {
  return (
    <main className="min-h-screen bg-[#0f1115] px-4 pb-28 pt-16 text-slate-100">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-[#1e2026] bg-[#151821] p-6 shadow-lg sm:p-8">
        <nav className="mb-6 flex items-center gap-3 border-b border-[#2a2d36] pb-4 text-sm font-semibold text-slate-300">
          <Link to="/" className="rounded-full border border-[#2a2d36] bg-[#0f1115] px-3 py-1 transition hover:border-[#3a3d47] hover:text-slate-100">
            Ana Sayfa
          </Link>
          <Link
            to="/chat"
            className="rounded-full border border-[#2a2d36] bg-[#0f1115] px-3 py-1 transition hover:border-[#3a3d47] hover:text-slate-100"
          >
            Chat
          </Link>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">Last updated: {updatedAt}</p>
        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-200">{children}</div>
      </div>
    </main>
  );
};

export default LegalPageLayout;
