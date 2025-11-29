import { useEffect, useState } from 'react';
import { Box, SimpleGrid, Image, Text, Button, Heading, Container, Badge, Stack, Flex, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  lugar: string;
  imagen_url: string;
}

const Inicio = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);

  // Dynamic colors for Light/Dark mode
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.7)', 'rgba(26, 32, 44, 0.7)');
  const cardHoverBg = useColorModeValue('rgba(255, 255, 255, 0.85)', 'rgba(26, 32, 44, 0.85)');
  const cardBorder = useColorModeValue('rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');
  const dateColor = useColorModeValue('purple.600', 'purple.300');

  useEffect(() => {
    axios.get('/api/eventos')
      .then(res => {
        if (Array.isArray(res.data)) {
          setEventos(res.data);
        } else {
          console.error('La respuesta de la API no es un array:', res.data);
          setEventos([]);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <Box minH="calc(100vh - 72px)">
      <Container maxW="1200px" py={12}>
        <Stack spacing={8}>
          <Box textAlign="center" color="white">
            <Heading as="h1" size="2xl" mb={4} textShadow="0 2px 10px rgba(0,0,0,0.3)">
              Próximos Eventos
            </Heading>
            <Text fontSize="xl" fontWeight="medium" textShadow="0 1px 5px rgba(0,0,0,0.3)">
              Descubre y reserva tu lugar en los mejores espectáculos.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
            {eventos.map(evento => (
              <Box 
                key={evento.id} 
                bg={cardBg} 
                backdropFilter="blur(16px)"
                border="1px solid"
                borderColor={cardBorder}
                borderRadius="xl" 
                overflow="hidden" 
                shadow="xl"
                transition="all 0.3s ease"
                _hover={{ transform: 'translateY(-8px)', shadow: '2xl', bg: cardHoverBg }}
              >
                <Box position="relative">
                  <Image 
                    src={evento.imagen_url} 
                    alt={evento.titulo} 
                    height="220px" 
                    width="100%" 
                    objectFit="cover" 
                  />
                  <Badge 
                    position="absolute" 
                    top={4} 
                    right={4} 
                    colorScheme="purple" 
                    variant="solid" 
                    fontSize="0.8em"
                    borderRadius="full"
                    px={3}
                    boxShadow="md"
                  >
                    Nuevo
                  </Badge>
                </Box>

                <Box p={6}>
                  <Stack spacing={3}>
                    <Text 
                      color={dateColor} 
                      fontWeight="bold" 
                      fontSize="sm" 
                      textTransform="uppercase" 
                      letterSpacing="wide"
                    >
                      {new Date(evento.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Text>

                    <Heading size="md" lineHeight="tight" noOfLines={2} color={textColor}>
                      {evento.titulo}
                    </Heading>
                    
                    <Flex align="center" color={subTextColor} fontSize="sm">
                      <Text>📍 {evento.lugar}</Text>
                    </Flex>

                    <Button 
                      as={RouterLink} 
                      to={`/evento/${evento.id}`} 
                      colorScheme="purple" 
                      size="lg" 
                      width="full"
                      mt={4}
                      shadow="md"
                      _hover={{ transform: 'scale(1.02)', shadow: 'lg' }}
                    >
                      Ver Entradas
                    </Button>
                  </Stack>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
};

export default Inicio;
