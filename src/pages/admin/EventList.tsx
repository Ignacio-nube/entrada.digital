import { useEffect, useState, useCallback } from 'react';
import {
  Box, Heading, SimpleGrid, Text, Button, Badge, Flex, IconButton, Spinner, Center, VStack, HStack, Image
} from '@chakra-ui/react';
import { LuPlus, LuTrash2, LuPencil, LuTicket, LuCalendar, LuMapPin } from 'react-icons/lu';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { toaster } from '../../components/ui/toaster';
import { getOptimizedUrl } from '../../components/OptimizedImage';

interface Evento {
  id: number;
  titulo: string;
  fecha: string;
  lugar: string;
  descripcion: string;
  imagen_url: string;
}

// Glass card style
const glassCard = {
  bg: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '2xl',
};

export default function EventList() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchEventos = useCallback(async () => {
    try {
      const response = await fetch('/api/mis-eventos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setEventos(data);
        } else {
          setEventos([]);
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;

    try {
      const response = await fetch(`/api/eventos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toaster.success({ title: 'Evento eliminado' });
        setEventos(eventos.filter(e => e.id !== id));
      } else {
        toaster.error({ title: 'Error al eliminar' });
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Center h="50vh">
        <VStack gap={4}>
          <Spinner size="xl" color="#ff6b6b" />
          <Text color="whiteAlpha.600">Cargando eventos...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg" color="white" fontFamily="'Poppins', sans-serif">
            Mis Eventos
          </Heading>
          <Button 
            asChild 
            size="sm"
            bg="linear-gradient(135deg, #ff6b6b 0%, #ff8a80 100%)"
            color="white"
            borderRadius="xl"
            _hover={{ opacity: 0.9 }}
          >
            <RouterLink to="/admin/crear-evento">
              <LuPlus />
              Nuevo
            </RouterLink>
          </Button>
        </Flex>
      </motion.div>

      {eventos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Box 
            {...glassCard} 
            textAlign="center" 
            py={12} 
            px={6}
          >
            <VStack gap={4}>
              <Box
                p={4}
                borderRadius="full"
                bg="rgba(255, 107, 107, 0.1)"
              >
                <LuCalendar size={40} color="#ff6b6b" />
              </Box>
              <Heading size="md" color="white" fontFamily="'Poppins', sans-serif">
                No tienes eventos
              </Heading>
              <Text color="whiteAlpha.600" maxW="300px">
                Comienza creando tu primer evento para vender entradas
              </Text>
              <Button 
                asChild 
                mt={2}
                bg="linear-gradient(135deg, #ff6b6b 0%, #ff8a80 100%)"
                color="white"
                borderRadius="xl"
                _hover={{ opacity: 0.9 }}
              >
                <RouterLink to="/admin/crear-evento">
                  <LuPlus />
                  Crear Evento
                </RouterLink>
              </Button>
            </VStack>
          </Box>
        </motion.div>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {eventos.map((evento, index) => (
            <motion.div
              key={evento.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Box 
                {...glassCard} 
                overflow="hidden"
                _hover={{ 
                  bg: 'rgba(255, 255, 255, 0.08)',
                  transform: 'translateY(-2px)',
                }}
                transition="all 0.2s"
              >
                {/* Event Image */}
                <Box h="120px" overflow="hidden" position="relative">
                  <Image
                    src={getOptimizedUrl(evento.imagen_url, 400, 200, 'auto:eco')}
                    alt={evento.titulo}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                  />
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.8) 100%)"
                  />
                  <Badge 
                    position="absolute"
                    top={2}
                    right={2}
                    bg="rgba(74, 222, 128, 0.9)"
                    color="white"
                    fontSize="xs"
                    px={2}
                    borderRadius="full"
                  >
                    Activo
                  </Badge>
                </Box>

                {/* Event Info */}
                <Box p={4}>
                  <Text 
                    fontWeight="700" 
                    color="white" 
                    fontSize="md"
                    lineClamp={1}
                    fontFamily="'Poppins', sans-serif"
                    mb={2}
                  >
                    {evento.titulo}
                  </Text>

                  <VStack align="start" gap={1} mb={3}>
                    <HStack gap={2} color="whiteAlpha.600" fontSize="xs">
                      <LuCalendar size={12} />
                      <Text>{formatDate(evento.fecha)}</Text>
                    </HStack>
                    <HStack gap={2} color="whiteAlpha.600" fontSize="xs">
                      <LuMapPin size={12} />
                      <Text lineClamp={1}>{evento.lugar}</Text>
                    </HStack>
                  </VStack>

                  {/* Actions */}
                  <Flex gap={2} pt={2} borderTop="1px solid rgba(255,255,255,0.1)">
                    <Button 
                      size="xs" 
                      flex={1}
                      variant="ghost"
                      color="#ff6b6b"
                      _hover={{ bg: 'rgba(255, 107, 107, 0.1)' }}
                      asChild
                    >
                      <RouterLink to={`/admin/evento/${evento.id}/tickets`}>
                        <LuTicket size={14} />
                        Entradas
                      </RouterLink>
                    </Button>
                    <IconButton
                      aria-label="Editar"
                      size="xs"
                      variant="ghost"
                      color="whiteAlpha.700"
                      _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                      asChild
                    >
                      <RouterLink to={`/admin/editar-evento/${evento.id}`}>
                        <LuPencil size={14} />
                      </RouterLink>
                    </IconButton>
                    <IconButton
                      aria-label="Eliminar"
                      size="xs"
                      variant="ghost"
                      color="red.400"
                      _hover={{ bg: 'rgba(239, 68, 68, 0.1)' }}
                      onClick={() => handleDelete(evento.id)}
                    >
                      <LuTrash2 size={14} />
                    </IconButton>
                  </Flex>
                </Box>
              </Box>
            </motion.div>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
