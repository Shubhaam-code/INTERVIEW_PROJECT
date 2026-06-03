import React from "react";

function Footer() {
  return (
    <footer className="mx-auto mt-8 max-w-[1400px] px-2 pb-4">
      <div className="card-premium py-8 text-center">
        <div className="mb-3 flex items-center justify-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 text-sm font-bold text-white">
            N
          </div>
          <h2 className="font-bold text-[#0F172A]">NextHire AI</h2>
        </div>
        <p className="mx-auto max-w-xl text-sm text-[#64748B]">
          AI-powered interview preparation platform designed to improve
          communication skills, technical depth and professional confidence.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
