import { useEffect, useState } from 'react';
import { Box, SimpleGrid, Image, Text, Button, Heading, Container, Badge, Stack, Flex, Card } from '@chakra-ui/react';
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
    <Box minH="calc(100vh - 72px)" bg="bg.subtle">
      <Container maxW="1200px" py={12}>
        <Stack gap={8}>
          <Box textAlign="center">
            <Heading as="h1" size="4xl" mb={4}>
              Próximos Eventos
            </Heading>
            <Text fontSize="xl" color="fg.muted">
              Descubre y reserva tu lugar en los mejores espectáculos.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
            {eventos.map(evento => (
              <Card.Root 
                key={evento.id} 
                overflow="hidden"
                variant="elevated"
                _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                transition="all 0.2s"
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
                    colorPalette="purple" 
                    variant="solid" 
                    borderRadius="full"
                    px={3}
                  >
                    Nuevo
                  </Badge>
                </Box>

                <Card.Body gap={3}>
                  <Text 
                    color="purple.fg" 
                    fontWeight="bold" 
                    fontSize="sm" 
                    textTransform="uppercase" 
                    letterSpacing="wide"
                  >
                    {new Date(evento.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </Text>

                  <Card.Title lineClamp={2}>
                    {evento.titulo}
                  </Card.Title>
                  
                  <Flex align="center" color="fg.muted" fontSize="sm">
                    <Text>📍 {evento.lugar}</Text>
                  </Flex>
                </Card.Body>

                <Card.Footer>
                  <Button 
                    asChild
                    colorPalette="purple" 
                    size="lg" 
                    width="full"
                  >
                    <RouterLink to={`/evento/${evento.id}`}>
                      Ver Entradas
                    </RouterLink>
                  </Button>
                </Card.Footer>
              </Card.Root>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
};

export default Inicio;
