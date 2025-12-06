import { useRef, useState } from 'react';
import { Box, Text, VStack, Image } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { motion, useAnimationFrame } from 'framer-motion';

interface Evento {
  id: number;
  titulo: string;
  fecha: string;
  lugar: string;
  imagen_url: string;
}

// Default images for carousel when no events
const defaultImages = [
  { url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&auto=format&fit=crop', title: 'Concierto Rock', date: 'Próximamente' },
  { url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop', title: 'Festival Electrónica', date: 'Próximamente' },
  { url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop', title: 'Show en Vivo', date: 'Próximamente' },
  { url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop', title: 'Festival de Verano', date: 'Próximamente' },
  { url: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&auto=format&fit=crop', title: 'Noche de Gala', date: 'Próximamente' },
  { url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&auto=format&fit=crop', title: 'Evento Especial', date: 'Próximamente' },
  { url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop', title: 'Celebración', date: 'Próximamente' },
  { url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&auto=format&fit=crop', title: 'Festival Música', date: 'Próximamente' },
  { url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&auto=format&fit=crop', title: 'Show de Luces', date: 'Próximamente' },
  { url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&auto=format&fit=crop', title: 'Gran Concierto', date: 'Próximamente' },
  { url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop', title: 'Fiesta VIP', date: 'Próximamente' },
  { url: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?w=600&auto=format&fit=crop', title: 'Teatro Musical', date: 'Próximamente' },
];

interface HeroCarouselProps {
  title?: string;
  subtitle?: string;
  eventos?: Evento[];
}

interface CarouselItem {
  id?: number;
  url: string;
  title: string;
  date: string;
  lugar?: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', { 
    day: 'numeric',
    month: 'short'
  });
};

// Individual Card Component with 3D effect
const CarouselCard = ({ 
  item, 
  isEvent 
}: { 
  item: CarouselItem; 
  isEvent: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const cardContent = (
    <Box
      position="relative"
      w={{ base: '280px', md: '320px' }}
      h={{ base: '280px', md: '320px' }}
      flexShrink={0}
      perspective="1000px"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      cursor="pointer"
    >
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateY: isHovered ? 0 : -45,
          y: isHovered ? -16 : 0,
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <Image
          src={item.url}
          alt={item.title}
          w="100%"
          h="100%"
          objectFit="cover"
          borderRadius="lg"
          loading="lazy"
          style={{
            maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&auto=format&fit=crop';
          }}
        />
        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          p={4}
          background="linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, transparent 100%)"
          borderBottomRadius="lg"
        >
          <Text
            fontFamily="'Poppins', sans-serif"
            fontSize={{ base: 'sm', md: 'md' }}
            fontWeight="600"
            color="white"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {item.title}
          </Text>
          <Text
            fontFamily="'Poppins', sans-serif"
            fontSize={{ base: 'xs', md: 'sm' }}
            fontWeight="300"
            color="whiteAlpha.800"
          >
            {item.date}
          </Text>
        </Box>
      </motion.div>
    </Box>
  );

  if (isEvent && item.id) {
    return (
      <RouterLink to={`/evento/${item.id}`} style={{ display: 'block' }}>
        {cardContent}
      </RouterLink>
    );
  }

  return cardContent;
};

const HeroCarousel = ({ 
  title = "Vive la Experiencia", 
  subtitle = "Los mejores eventos en un solo lugar",
  eventos = []
}: HeroCarouselProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Create carousel items - duplicate for seamless loop
  const baseItems: CarouselItem[] = eventos.length > 0 
    ? eventos.map(e => ({
        id: e.id,
        url: e.imagen_url || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&auto=format&fit=crop',
        title: e.titulo,
        date: formatDate(e.fecha),
        lugar: e.lugar
      }))
    : defaultImages;
  
  // Triple the items for seamless infinite scroll
  const carouselItems = [...baseItems, ...baseItems, ...baseItems];
  
  const cardWidth = 340; // Card width + gap
  const totalWidth = baseItems.length * cardWidth;
  const speed = 0.5; // pixels per frame

  useAnimationFrame(() => {
    if (isPaused) return;
    
    setTranslateX(prev => {
      const next = prev - speed;
      // Reset when we've scrolled one full set
      if (Math.abs(next) >= totalWidth) {
        return 0;
      }
      return next;
    });
  });

  return (
    <Box 
      as="section" 
      bg="white"
      minH="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
      pt={{ base: 20, md: 24 }}
      pb={{ base: 32, md: 40 }}
    >
      {/* Title Section */}
      <VStack 
        gap={2} 
        textAlign="center" 
        mb={{ base: 8, md: 12 }}
        px={4}
        zIndex={2}
      >
        <Text
          as="h1"
          fontSize={{ base: '2.5rem', sm: '3rem', md: '4rem', lg: '5rem' }}
          fontWeight="800"
          fontFamily="'Poppins', sans-serif"
          bgGradient="linear(to-r, #ff6b6b, #ff5722)"
          bgClip="text"
          letterSpacing={{ base: '-1px', md: '-2px' }}
          lineHeight="1.1"
        >
          {title}
        </Text>
        
        <Text
          fontSize={{ base: 'xs', md: 'sm' }}
          color="gray.500"
          fontFamily="'Poppins', sans-serif"
          fontWeight="300"
          letterSpacing={{ base: '1px', md: '2px' }}
          textTransform="uppercase"
        >
          {subtitle}
        </Text>
      </VStack>

      {/* Carousel Container */}
      <Box 
        w="100%" 
        overflow="hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          ref={trackRef}
          style={{
            display: 'flex',
            gap: '20px',
            paddingLeft: '50px',
            paddingRight: '50px',
            transform: `translateX(${translateX}px)`,
          }}
        >
          {carouselItems.map((item, index) => (
            <CarouselCard
              key={`${item.title}-${index}`}
              item={item}
              isEvent={eventos.length > 0}
            />
          ))}
        </motion.div>
      </Box>

      {/* Scroll Down Indicator with gradient background */}
      <Box 
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        h={{ base: '150px', md: '200px' }}
        background="linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.9) 100%)"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="flex-end"
        pb={6}
        zIndex={10}
      >
        <motion.div
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ 
            y: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
            opacity: { duration: 0.3 }
          }}
        >
          <VStack gap={1}>
            <Text
              fontFamily="'Poppins', sans-serif"
              fontSize={{ base: 'xs', md: 'sm' }}
              color="white"
              fontWeight="400"
            >
              Scroll down
            </Text>
            <Text fontSize="xl" color="white">↓</Text>
          </VStack>
        </motion.div>
      </Box>
    </Box>
  );
};

export default HeroCarousel;
