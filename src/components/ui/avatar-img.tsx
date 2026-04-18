import Image from "next/image";

interface AvatarImgProps {
  src?: string | null;
  name: string;
  size?: number; // px, applied to both width and height
  className?: string;
}

/** Renders a circular avatar — photo if available, otherwise initial letter fallback. */
export function AvatarImg({ src, name, size = 36, className = "" }: AvatarImgProps) {
  const fontSize = size <= 24 ? "text-[9px]" : size <= 32 ? "text-xs" : size <= 48 ? "text-sm" : "text-base";
  return (
    <div
      style={{ width: size, height: size, minWidth: size }}
      className={`rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0 ${fontSize} ${className}`}
    >
      {src ? (
        <Image src={src} alt={name} width={size} height={size} className="object-cover w-full h-full" />
      ) : (
        name[0]?.toUpperCase() ?? "?"
      )}
    </div>
  );
}
