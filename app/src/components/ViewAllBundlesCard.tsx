import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ViewAllBundlesCardProps {
  thumbnails: string[]; // up to 3 thumbnail URLs
}

export default function ViewAllBundlesCard({ thumbnails }: ViewAllBundlesCardProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  // Fan config: rotation and horizontal offset for each card (left, center, right)
  const configs = [
    { rotate: -12, tx: -20, hoverRotate: -22, hoverTx: -36, z: 1 },
    { rotate: 0,   tx: 0,   hoverRotate: 0,   hoverTx: 0,   z: 3 },
    { rotate: 12,  tx: 20,  hoverRotate: 22,  hoverTx: 36,  z: 2 },
  ];

  return (
    <button
      onClick={() => navigate('/discover#bundles')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative w-full h-full rounded-[12px] overflow-hidden flex flex-col items-center justify-center gap-5 cursor-pointer border border-border-default transition-colors duration-300 ${
        hovered ? 'bg-[#ddd] dark:bg-[#2a2a2a]' : 'bg-bg-secondary'
      }`}
    >
      {/* Fanning thumbnails */}
      <div className="relative w-[200px] h-[200px]">
        {thumbnails.slice(0, 3).map((src, i) => {
          const c = configs[i];
          const rotate = hovered ? c.hoverRotate : c.rotate;
          const tx = hovered ? c.hoverTx : c.tx;
          const scale = hovered ? 1.05 : 1;

          return (
            <img
              key={i}
              src={src}
              alt=""
              className="absolute top-1/2 left-1/2 w-[120px] h-[180px] rounded-[10px] object-cover shadow-lg transition-transform duration-300 ease-out"
              style={{
                zIndex: c.z,
                transformOrigin: 'bottom center',
                transform: `translate(-50%, -50%) translateX(${tx}px) rotate(${rotate}deg) scale(${scale})`,
              }}
            />
          );
        })}
      </div>

      {/* Label */}
      <span className="type-headline-medium text-text-primary">View All Bundles</span>
    </button>
  );
}
