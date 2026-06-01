import { useState, useRef, useCallback, useEffect } from "react";

export const ProductZoom = ({ images = [] }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [fullscreen, setFullscreen] = useState(false);
  const [touchPos, setTouchPos] = useState(null);
  const containerRef = useRef(null);
  const thumbnailsRef = useRef(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    if (thumbnailsRef.current) {
      const activeThumb = thumbnailsRef.current.children[selectedIndex];
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [selectedIndex]);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current || !zoomed) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, [zoomed]);

  const handleTouchStart = (e) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setTouchPos({ x, y });
    setZoomed(true);
  };

  const handleTouchMove = (e) => {
    if (!isMobile || !zoomed || !touchPos) return;
    e.preventDefault();
    const touch = e.touches[0];
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleTouchEnd = () => {
    if (isMobile) {
      setZoomed(false);
      setTouchPos(null);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full bg-gray-50 rounded-xl flex items-center justify-center min-h-[300px] sm:min-h-[400px] border border-dashed border-gray-200">
        <div className="text-center">
          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-400">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row gap-3 lg:gap-4">
        {/* Thumbnails */}
        <div ref={thumbnailsRef}
          className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[520px] scrollbar-thin pb-1 md:pb-0 md:pr-1"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#d1d5db transparent" }}>
          {images.map((img, index) => (
            <button key={index} onClick={() => { setSelectedIndex(index); setZoomed(false); }}
              className={`w-12 h-12 sm:w-14 sm:h-14 md:w-[72px] md:h-[72px] rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-200 ${
                selectedIndex === index
                  ? "border-gray-900 ring-2 ring-gray-900/10 shadow-sm opacity-100 scale-105"
                  : "border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-400"
              }`}>
              <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>

        {/* Main Image */}
        <div ref={containerRef}
          onClick={() => isMobile && !zoomed ? setFullscreen(true) : setZoomed(!zoomed)}
          onMouseEnter={() => !isMobile && setZoomed(true)}
          onMouseLeave={() => { if (!isMobile) { setZoomed(false); setPosition({ x: 50, y: 50 }); } }}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex-1 rounded-xl overflow-hidden bg-gray-50 min-h-[280px] sm:min-h-[350px] md:min-h-[450px] relative group cursor-crosshair select-none">

          <img src={images[selectedIndex]} alt="Product"
            className="w-full h-full object-cover transition-opacity duration-200"
            style={zoomed ? {
              transform: "scale(2)",
              transformOrigin: `${position.x}% ${position.y}%`,
            } : { transform: "scale(1)", transformOrigin: "center center" }}
            draggable={false} />

          {!zoomed && !isMobile && (
            <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-[11px] text-gray-500 shadow-sm pointer-events-none">
              Hover to zoom
            </div>
          )}
          {isMobile && !zoomed && (
            <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-[11px] text-gray-500 shadow-sm pointer-events-none flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              Tap to zoom
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Viewer for Mobile */}
      {fullscreen && (
        <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
          onClick={() => setFullscreen(false)}>
          <button onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <img src={images[selectedIndex]} alt="Product"
              className="max-w-full max-h-full object-contain" />
          </div>
          {/* Thumbnails strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((img, index) => (
                <button key={index} onClick={() => setSelectedIndex(index)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedIndex === index ? "border-white opacity-100" : "border-transparent opacity-50"
                  }`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
