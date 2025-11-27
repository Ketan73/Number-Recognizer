import React from 'react';

const Tooltip = () => {
  return (
    <div className="relative inline-block group">
      <button className="relative w-9 h-9 text-xl font-semibold text-[#2c2c2c] bg-white rounded-full border-2 border-[#2c2c2c] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#2c2c2c] focus:outline-none transition-all duration-200 shadow-[2px_2px_0_#2c2c2c]" style={{ fontFamily: "'Literata', serif" }}>
        <span className="relative flex items-center justify-center">
          ?
        </span>
      </button>
      <div className="absolute invisible opacity-0 group-hover:visible group-hover:opacity-100 top-full right-0 mt-3 transition-all duration-300 ease-out transform group-hover:translate-y-0 -translate-y-2 z-50" style={{ width: '320px' }}>
        <div className="relative bg-white rounded-xl border-2 border-[#2c2c2c] shadow-[4px_4px_0_#2c2c2c]" style={{ padding: '13px 15px' }}>
          <div className="flex items-center gap-3" style={{ marginBottom: '16px' }}>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#ccc]">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#2c2c2c]">
                <path clipRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" fillRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#2c2c2c]" style={{ fontFamily: "'Literata', serif" }}>About</h3>
          </div>
          
          <p className="text-base text-[#555] leading-relaxed" style={{ marginBottom: '16px', fontFamily: "'Literata', serif" }}>
            Upload an image with handwritten numbers and our AI will recognize all the digits for you!
          </p>
          
          <div style={{ padding: '16px 0', borderTop: '1px dashed #ccc', borderBottom: '1px dashed #ccc' }}>
            <div style={{ marginBottom: '12px', paddingLeft: '16px' }}>
              <span className="text-base text-[#444]" style={{ fontFamily: "'Literata', serif" }}>1. Upload a JPG or PNG image</span>
            </div>
            <div style={{ marginBottom: '12px', paddingLeft: '16px' }}>
              <span className="text-base text-[#444]" style={{ fontFamily: "'Literata', serif" }}>2. Click the Recognize button</span>
            </div>
            <div style={{ paddingLeft: '16px' }}>
              <span className="text-base text-[#444]" style={{ fontFamily: "'Literata', serif" }}>3. See the magic happen! (๑'ᵕ'๑)⸝*</span>
            </div>
          </div>
          
          <p className="text-sm text-[#888] italic" style={{ marginTop: '16px', fontFamily: "'Literata', serif" }}>Powered by Google Gemini AI</p>
          
          <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white rotate-45 border-l-2 border-t-2 border-[#2c2c2c]" />
        </div>
      </div>
    </div>
  );
}

export default Tooltip;
