import { useState } from 'react';
import { Box, Skeleton } from '@chakra-ui/react';

// Cloudinary cloud name
const CLOUD_NAME = 'doosdrcdk';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: 'auto' | 'auto:low' | 'auto:eco' | 'auto:good' | 'auto:best';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

/**
 * Transforms a Cloudinary URL to include optimization parameters
 */
function getOptimizedUrl(
  url: string, 
  width?: number, 
  height?: number, 
  quality: string = 'auto:good'
): string {
  // Check if it's a Cloudinary URL
  if (!url.includes('cloudinary.com') && !url.includes('res.cloudinary.com')) {
    return url; // Return original URL if not Cloudinary
  }

  // Parse the URL to add transformations
  const urlParts = url.split('/upload/');
  if (urlParts.length !== 2) return url;

  // Build transformation string
  const transformations = [
    `f_auto`, // Auto format (WebP, AVIF, etc.)
    `q_${quality}`, // Quality
  ];

  if (width) {
    transformations.push(`w_${width}`);
  }
  if (height) {
    transformations.push(`h_${height}`);
  }

  // Add crop mode if both dimensions are specified
  if (width && height) {
    transformations.push('c_fill');
    transformations.push('g_auto'); // Smart cropping
  } else if (width || height) {
    transformations.push('c_scale');
  }

  return `${urlParts[0]}/upload/${transformations.join(',')}/${urlParts[1]}`;
}

/**
 * Get srcset for responsive images
 */
function getSrcSet(url: string, quality: string = 'auto:good'): string {
  if (!url.includes('cloudinary.com')) return '';

  const widths = [320, 640, 960, 1280, 1920];
  return widths
    .map(w => `${getOptimizedUrl(url, w, undefined, quality)} ${w}w`)
    .join(', ');
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 'auto:good',
  objectFit = 'cover',
  borderRadius,
  className,
  style,
  onClick,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const optimizedSrc = getOptimizedUrl(src, width, height, quality);
  const srcSet = getSrcSet(src, quality);

  // Fallback image if error
  const fallbackImage = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v1/placeholder_event`;

  return (
    <Box position="relative" overflow="hidden" borderRadius={borderRadius}>
      {!isLoaded && !hasError && (
        <Skeleton
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
        />
      )}
      <img
        src={hasError ? fallbackImage : optimizedSrc}
        srcSet={!hasError && srcSet ? srcSet : undefined}
        sizes={srcSet ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw' : undefined}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        onClick={onClick}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit,
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          cursor: onClick ? 'pointer' : 'default',
          ...style,
        }}
      />
    </Box>
  );
}

// Export utility functions for use elsewhere
export { getOptimizedUrl, getSrcSet };
