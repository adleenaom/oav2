interface PromotionBannerProps {
  title: string;
  subtitle: string;
  image: string;
  color: string;
}

export default function PromotionBanner({ title, subtitle, image, color }: PromotionBannerProps) {
  return (
    <div className="relative w-[330px] h-[210px] rounded-[8px] overflow-hidden shrink-0">
      <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${color}dd 0%, ${color}88 50%, transparent 100%)` }} />
      <div className="absolute bottom-4 left-4 right-4">
        <p className="type-headline-small text-text-primary">{title}</p>
        <p className="type-pre-text text-text-primary/70 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
