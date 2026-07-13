import React, { FunctionComponent, useMemo } from "react";
// We remove 'wagmi' imports to stop the crash

export const Header: FunctionComponent = () => {
  return (
    <div className="flex flex-row items-center justify-between p-4 bg-white shadow-sm">
      {/* 🟢 YOUR LOGO SECTION (I am preserving your likely layout) */}
      <div className="flex items-center gap-2 cursor-pointer">
        {/* If you had an SVG logo here, paste it back. For now, we use a placeholder text matching your screenshot */}
        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg"></div>
        <span className="text-xl font-bold text-gray-800">PrivaSetu</span>
      </div>

      {/* 🟢 THE RIGHT SIDE BUTTON */}
      {/* Instead of "Connect Wallet", we show "Gasless Mode" */}
      <div className="flex items-center gap-4">
        <div className="hidden md:block px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-sm font-semibold border border-green-200">
          🟢 Gasless Mode Active
        </div>
        
        <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-mono border border-gray-200">
           0xGasless...User
        </div>
      </div>
    </div>
  );
};