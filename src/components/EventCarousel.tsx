import { useState, useEffect, useCallback } from 'react';
import { Box, Text, Button, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { getOptimizedUrl } from './OptimizedImage';

interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  lugar: string;
  imagen_url: string;
}

interface EventCarouselProps {
  eventos: Evento[];
  searchTerm?: string;
}

// Default images when no events
const defaultSlides = [
  { 
    id: 0, 
    titulo: 'Próximos Eventos', 
    descripcion: 'Descubre los mejores eventos de tu ciudad. Conciertos, festivales, teatro y más.',
    imagen_url: 'https://cdn.mos.cms.futurecdn.net/dP3N4qnEZ4tCTCLq59iysd.jpg',
    fecha: '',
    lugar: ''
  },
  { 
    id: 0, 
    titulo: 'Vive la Experiencia', 
    descripcion: 'Compra tus entradas de forma segura y recíbelas al instante en tu correo.',
    imagen_url: 'https://i.redd.it/tc0aqpv92pn21.jpg',
    fecha: '',
    lugar: ''
  },
  { 
    id: 0, 
    titulo: 'Eventos Exclusivos', 
    descripcion: 'Accede a preventas y ofertas especiales para los eventos más populares.',
    imagen_url: 'https://images7.alphacoders.com/878/878663.jpg',
    fecha: '',
    lugar: ''
  },
];

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const EventCarousel = ({ eventos, searchTerm = '' }: EventCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Filter eventos by search term
  const filteredEventos = eventos.filter(evento => 
    evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.lugar.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Use filtered eventos or default slides
  const slides = filteredEventos.length > 0 ? filteredEventos : defaultSlides;
  
  // Reset active index when search changes
  useEffect(() => {
    setActiveIndex(0);
  }, [searchTerm]);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Handle swipe
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      goToPrev();
    } else if (info.offset.x < -threshold) {
      goToNext();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  // Calculate positions for stacked cards
  const getCardStyle = (index: number) => {
    const diff = index - activeIndex;
    const totalSlides = slides.length;
    
    // Normalize diff for circular navigation
    let normalizedDiff = diff;
    if (diff > totalSlides / 2) normalizedDiff = diff - totalSlides;
    if (diff < -totalSlides / 2) normalizedDiff = diff + totalSlides;

    // First two cards are fullscreen (background)
    if (normalizedDiff === 0) {
      return {
        zIndex: 2,
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        borderRadius: 0,
        opacity: 1,
      };
    }
    
    if (normalizedDiff === -1 || (normalizedDiff === totalSlides - 1)) {
      return {
        zIndex: 1,
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        borderRadius: 0,
        opacity: 0.5,
      };
    }

    // Cards on the right side (stacked)
    const baseLeft = window.innerWidth > 650 
      ? (window.innerWidth > 900 ? '50%' : '50%')
      : '50%';
    
    const cardWidth = window.innerWidth > 900 ? 200 : (window.innerWidth > 650 ? 160 : 130);
    const cardHeight = window.innerWidth > 900 ? 300 : (window.innerWidth > 650 ? 270 : 220);
    const gap = window.innerWidth > 900 ? 220 : (window.innerWidth > 650 ? 170 : 140);

    if (normalizedDiff >= 1 && normalizedDiff <= 4) {
      return {
        zIndex: 5 - normalizedDiff,
        left: `calc(${baseLeft} + ${(normalizedDiff - 1) * gap}px)`,
        top: '50%',
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        borderRadius: '20px',
        opacity: normalizedDiff === 4 ? 0 : 1,
        transform: 'translateY(-50%)',
      };
    }

    // Hidden cards
    return {
      zIndex: 0,
      left: '100%',
      top: '50%',
      width: `${cardWidth}px`,
      height: `${cardHeight}px`,
      borderRadius: '20px',
      opacity: 0,
      transform: 'translateY(-50%)',
    };
  };

  const activeSlide = slides[activeIndex];

  return (
    <Box
      position="relative"
      w="100%"
      h="100vh"
      overflow="hidden"
      bg="black"
    >
      {/* Background slides */}
      <AnimatePresence mode="sync">
        {slides.map((slide, index) => {
          const style = getCardStyle(index);
          const isActive = index === activeIndex;
          
          return (
            <motion.div
              key={`${slide.id}-${index}`}
              initial={false}
              animate={{
                left: style.left,
                top: style.top,
                width: style.width,
                height: style.height,
                borderRadius: style.borderRadius,
                opacity: style.opacity,
                zIndex: style.zIndex,
              }}
              transition={{
                duration: 0.75,
                ease: [0.4, 0, 0.2, 1],
              }}
              drag={isActive ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={isActive ? handleDragEnd : undefined}
              style={{
                position: 'absolute',
                backgroundImage: `url('${getOptimizedUrl(slide.imagen_url, 1920, 1080, 'auto:good')}')`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                boxShadow: style.borderRadius !== 0 
                  ? '0 20px 30px rgba(255,255,255,0.3) inset' 
                  : 'none',
                cursor: isActive ? 'grab' : 'pointer',
                transform: style.transform,
              }}
              onClick={() => !isActive && setActiveIndex(index)}
            />
          );
        })}
      </AnimatePresence>

      {/* Content overlay for active slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: 75, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.75, delay: 0.3, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '3rem',
            transform: 'translateY(-50%)',
            zIndex: 10,
            maxWidth: window.innerWidth > 650 ? 'min(30vw, 400px)' : '70%',
          }}
        >
          <VStack align="start" gap={4}>
            <Text
              as="h2"
              fontFamily="'Poppins', sans-serif"
              fontWeight="800"
              fontSize={{ base: '1.5rem', md: '2rem', lg: '2.5rem' }}
              color="white"
              textTransform="uppercase"
              textShadow="0 3px 8px rgba(0,0,0,0.5)"
              lineHeight="1.2"
            >
              {activeSlide.titulo}
            </Text>
            
            {activeSlide.fecha && (
              <Text
                fontFamily="'Poppins', sans-serif"
                fontSize={{ base: '0.75rem', md: '0.85rem' }}
                color="whiteAlpha.800"
                textShadow="0 2px 4px rgba(0,0,0,0.5)"
              >
                📅 {formatDate(activeSlide.fecha)}
                {activeSlide.lugar && ` • 📍 ${activeSlide.lugar}`}
              </Text>
            )}
            
            <Text
              fontFamily="'Poppins', sans-serif"
              fontWeight="400"
              fontSize={{ base: '0.7rem', md: '0.85rem' }}
              color="white"
              textShadow="0 2px 4px rgba(0,0,0,0.5)"
              lineHeight="1.7"
              maxW="400px"
            >
              {activeSlide.descripcion.length > 150 
                ? activeSlide.descripcion.substring(0, 150) + '...' 
                : activeSlide.descripcion}
            </Text>
            
            {activeSlide.id > 0 && (
              <Button
                asChild
                bg="rgba(255, 255, 255, 0.1)"
                color="white"
                border="2px solid white"
                borderRadius="md"
                px={6}
                py={3}
                fontFamily="'Poppins', sans-serif"
                fontWeight="500"
                _hover={{
                  bg: 'rgba(255, 107, 107, 0.3)',
                  borderColor: '#ff6b6b',
                  transform: 'translateY(-2px)',
                }}
                transition="all 0.3s ease"
              >
                <RouterLink to={`/evento/${activeSlide.id}`}>
                  Comprar Entrada
                </RouterLink>
              </Button>
            )}
          </VStack>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <Box
        position="absolute"
        bottom={{ base: '1.5rem', md: '2rem' }}
        left="50%"
        transform="translateX(-50%)"
        zIndex={20}
        display="flex"
        gap={2}
        userSelect="none"
      >
        <Box
          as="button"
          onClick={goToPrev}
          bg="rgba(255, 255, 255, 0.5)"
          color="rgba(0, 0, 0, 0.7)"
          border="2px solid rgba(0, 0, 0, 0.6)"
          borderRadius="full"
          p={3}
          cursor="pointer"
          display="flex"
          alignItems="center"
          justifyContent="center"
          _hover={{ bg: 'rgba(255, 255, 255, 0.3)' }}
          transition="all 0.2s ease"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Box>
        <Box
          as="button"
          onClick={goToNext}
          bg="rgba(255, 255, 255, 0.5)"
          color="rgba(0, 0, 0, 0.7)"
          border="2px solid rgba(0, 0, 0, 0.6)"
          borderRadius="full"
          p={3}
          cursor="pointer"
          display="flex"
          alignItems="center"
          justifyContent="center"
          _hover={{ bg: 'rgba(255, 255, 255, 0.3)' }}
          transition="all 0.2s ease"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Box>
      </Box>

      {/* Slide indicators */}
      <Box
        position="absolute"
        bottom={{ base: '5rem', md: '6rem' }}
        left="50%"
        transform="translateX(-50%)"
        zIndex={20}
        display="flex"
        gap={2}
      >
        {slides.map((_, index) => (
          <Box
            key={index}
            as="button"
            w={activeIndex === index ? '24px' : '8px'}
            h="8px"
            borderRadius="full"
            bg={activeIndex === index ? 'white' : 'rgba(255, 255, 255, 0.5)'}
            cursor="pointer"
            transition="all 0.3s ease"
            onClick={() => setActiveIndex(index)}
            _hover={{ bg: 'white' }}
          />
        ))}
      </Box>

      {/* Search results indicator */}
      {searchTerm && (
        <Box
          position="absolute"
          top={{ base: '80px', md: '90px' }}
          left="50%"
          transform="translateX(-50%)"
          zIndex={20}
          bg="rgba(0, 0, 0, 0.7)"
          backdropFilter="blur(10px)"
          px={4}
          py={2}
          borderRadius="full"
          border="1px solid rgba(255, 255, 255, 0.2)"
        >
          <Text color="white" fontSize="sm" fontFamily="'Poppins', sans-serif">
            {filteredEventos.length > 0 
              ? `${filteredEventos.length} evento${filteredEventos.length !== 1 ? 's' : ''} encontrado${filteredEventos.length !== 1 ? 's' : ''}`
              : 'No se encontraron eventos'}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default EventCarousel;
