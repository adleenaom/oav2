import coinSvg from '../assets/coin.svg';

interface CoinIconProps {
  size?: number;
  className?: string;
}

export default function CoinIcon({ size = 16, className = '' }: CoinIconProps) {
  return <img src={coinSvg} alt="credits" width={size} height={size} className={`inline-block shrink-0 ${className}`} />;
}
