export function Capybara({
  size = 220,
  className = "",
  alt = "",
}: {
  size?: number;
  className?: string;
  alt?: string;
}) {
  return (
    <img
      className={`capybara ${className}`.trim()}
      src={`${import.meta.env.BASE_URL}arte/capibaras-estudiando.svg`}
      width={size}
      height={size}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      draggable={false}
    />
  );
}
