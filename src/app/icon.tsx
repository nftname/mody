import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'nodejs';

export const size = {
  width: 512,
  height: 512,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'rgba(255, 255, 255, 0.25)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          boxSizing: 'border-box',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          width="100%"
          height="100%"
          fill="none"
        >
          <defs>
            <linearGradient
              id="blockGold"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FFF5CC" />
              <stop offset="20%" stopColor="#FCD535" />
              <stop offset="80%" stopColor="#B3882A" />
            </linearGradient>

            <linearGradient
              id="blockSide"
              x1="100%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#9E7C0C" />
              <stop offset="100%" stopColor="#5C4004" />
            </linearGradient>

            <filter
              id="innerEtch"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="4"
                stdDeviation="4"
                floodColor="#000"
                floodOpacity="0.8"
              />
            </filter>
          </defs>

          <g filter="url(#innerEtch)" transform="scale(0.75) translate(85.33px, 85.33px)">
            <path
              d="M256 20 L356 120 L256 220 L156 120 Z"
              fill="url(#blockGold)"
            />
            <path
              d="M156 120 L256 220 L256 240 L156 140 Z"
              fill="url(#blockSide)"
            />

            <path
              d="M256 292 L356 392 L256 492 L156 392 Z"
              fill="url(#blockGold)"
            />
            <path
              d="M356 392 L256 492 L256 472 L356 372 Z"
              fill="url(#blockSide)"
              opacity="0.5"
            />

            <path
              d="M120 156 L220 256 L120 356 L20 256 Z"
              fill="url(#blockGold)"
            />

            <path
              d="M392 156 L492 256 L392 356 L292 256 Z"
              fill="url(#blockGold)"
            />

            <circle cx="256" cy="256" r="10" fill="#0b0e11" />
          </g>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
