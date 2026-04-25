interface LogoProps {
  size: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClassMap: Record<LogoProps['size'], string> = {
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-12',
};

const Logo = ({ size, className = '' }: LogoProps) => {
  return (
    <span className={`inline-flex ${sizeClassMap[size]} max-w-full`}>
      <img
        src="/logo.webp"
        alt="Kpoikpoimingi Investment Limited logo"
        loading="lazy"
        decoding="async"
        className={`h-auto max-h-full w-auto max-w-full object-contain ${className}`}
      />
    </span>
  );
};

export default Logo;
