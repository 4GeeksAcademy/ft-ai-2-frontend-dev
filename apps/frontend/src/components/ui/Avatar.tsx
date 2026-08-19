import Image from "next/image";

interface AvatarProps {
  src: string;
  alt: string;
  /** Width and height in px. Defaults to 80 (h-20 w-20). */
  size?: number;
}

export function Avatar({ src, alt, size = 80 }: AvatarProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full"
    />
  );
}