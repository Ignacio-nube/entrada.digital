import { type ReactNode } from 'react';
import { Box, type BoxProps, Image } from '@chakra-ui/react';
import { motion } from 'framer-motion';

interface GlassCardProps extends BoxProps {
  children: ReactNode;
  delay?: number;
  hoverScale?: number;
  glowColor?: string;
}

const GlassCard = ({ 
  children, 
  delay = 0,
  hoverScale = 1.02,
  glowColor = 'rgba(255, 107, 107, 0.3)',
  ...props 
}: GlassCardProps) => {
  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.175, 0.885, 0.32, 1.275]
      }}
      whileHover={{ 
        y: -8,
        scale: hoverScale,
        boxShadow: `0 20px 40px ${glowColor}, 0 0 60px rgba(255, 107, 107, 0.1)`
      }}
      style={{ padding: '1rem', cursor: 'pointer' }}
    >
      <Box {...props}>
        {children}
      </Box>
    </motion.div>
  );
};

// Event Card variant - for showing events
interface EventGlassCardProps {
  image: string;
  title: string;
  date: string;
  location: string;
  price?: string;
  delay?: number;
  onClick?: () => void;
}

export const EventGlassCard = ({
  image,
  title,
  date,
  location,
  price,
  delay = 0,
  onClick
}: EventGlassCardProps) => {
  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.175, 0.885, 0.32, 1.275]
      }}
      whileHover={{ 
        y: -12,
        scale: 1.03,
      }}
      style={{ overflow: 'hidden', cursor: 'pointer' }}
      onClick={onClick}
    >
      {/* Image Container */}
      <Box position="relative" overflow="hidden" borderRadius="16px" mb={4}>
        <Image
          src={image}
          alt={title}
          w="100%"
          h={{ base: '180px', md: '220px' }}
          objectFit="cover"
          transition="transform 0.4s ease"
          _groupHover={{ transform: 'scale(1.1)' }}
        />
        {/* Gradient overlay on image */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          h="50%"
          bgGradient="to-t"
          gradientFrom="rgba(0,0,0,0.8)"
          gradientTo="transparent"
          pointerEvents="none"
        />
        {/* Price badge */}
        {price && (
          <Box
            position="absolute"
            top={3}
            right={3}
            bg="rgba(255, 107, 107, 0.9)"
            backdropFilter="blur(8px)"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="sm"
            fontWeight="bold"
            color="white"
          >
            {price}
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box px={2}>
        <Box
          fontSize={{ base: 'xs', md: 'sm' }}
          color="red.300"
          fontWeight="500"
          textTransform="uppercase"
          letterSpacing="1px"
          mb={1}
        >
          {date}
        </Box>
        <Box
          as="h3"
          fontSize={{ base: 'lg', md: 'xl' }}
          fontWeight="700"
          color="white"
          mb={2}
          lineClamp={2}
          fontFamily="'Poppins', sans-serif"
        >
          {title}
        </Box>
        <Box
          fontSize={{ base: 'sm', md: 'md' }}
          color="whiteAlpha.700"
          display="flex"
          alignItems="center"
          gap={1}
        >
          📍 {location}
        </Box>
      </Box>
    </motion.div>
  );
};

// Feature Card variant - for info sections
interface FeatureGlassCardProps {
  icon: string;
  title: string;
  description: string;
  delay?: number;
}

export const FeatureGlassCard = ({
  icon,
  title,
  description,
  delay = 0
}: FeatureGlassCardProps) => {
  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.175, 0.885, 0.32, 1.275]
      }}
      whileHover={{ 
        y: -15,
        scale: 1.02,
      }}
      style={{ padding: '1.5rem', textAlign: 'center' }}
    >
      <Box 
        fontSize={{ base: '3xl', md: '4xl' }} 
        mb={4}
        className="feature-icon"
      >
        {icon}
      </Box>
      <Box
        as="h3"
        fontSize={{ base: 'lg', md: 'xl' }}
        fontWeight="700"
        color="white"
        mb={3}
        fontFamily="'Poppins', sans-serif"
        className="gradient-text"
      >
        {title}
      </Box>
      <Box
        fontSize={{ base: 'sm', md: 'md' }}
        color="whiteAlpha.600"
        lineHeight="1.7"
        fontFamily="'Poppins', sans-serif"
      >
        {description}
      </Box>
    </motion.div>
  );
};

export default GlassCard;
