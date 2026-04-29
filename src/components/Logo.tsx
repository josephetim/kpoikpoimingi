interface LogoProps {
  size: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClassMap: Record<LogoProps['size'], string> = {
  sm: 'h-7 sm:h-8',
  md: 'h-8 sm:h-10',
  lg: 'h-8 sm:h-10 lg:h-12',
};

const Logo = ({ size, className = '' }: LogoProps) => {
  return (
    <span className={`inline-flex min-w-0 max-w-full ${sizeClassMap[size]}`}>
      <img
        src="/logo.webp"
        alt="Kpoikpoimingi Investment Limited logo"
        loading="lazy"
        decoding="async"
        className={`h-full w-auto max-w-full object-contain ${className}`}
      />
    </span>
  );
};

export default Logo;
