import { useRef } from 'react';
import { Box, Image } from '@chakra-ui/react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ImageMotionProps {
  src?: string;
  alt?: string;
}

const ImageMotion = ({ 
  src = "https://i.postimg.cc/1ztkf4hX/moveimage.png",
  alt = "Featured Event"
}: ImageMotionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Transform rotateX from 90deg to 0deg as user scrolls (like original)
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [90, 0]);

  return (
    <Box 
      ref={containerRef}
      as="section"
      bg="black"
      overflow="hidden"
      position="relative"
      minH="min-content"
      mt="-1px" // Ensure no gap between sections
    >
      {/* Top gradient overlay to blend with carousel */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        h={{ base: '80px', md: '120px' }}
        background="linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%)"
        zIndex={2}
        pointerEvents="none"
      />
      
      <Box
        className="image-motion-container"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          style={{
            rotateX,
            transformOrigin: '50% 0%',
            width: '100%',
          }}
        >
          <Image
            src={src}
            alt={alt}
            w="100%"
            h="auto"
            objectFit="cover"
            objectPosition="center"
            display="block"
          />
        </motion.div>
      </Box>
    </Box>
  );
};

export default ImageMotion;
