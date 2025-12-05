import { useEffect, useState, useCallback } from 'react';
import {
  Box, Heading, SimpleGrid, Card, Text, Button, Badge, Flex, IconButton, Spinner, Center
} from '@chakra-ui/react';
import { LuPlus, LuTrash } from 'react-icons/lu';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toaster } from '../../components/ui/toaster';

interface Evento {
  id: number;
  titulo: string;
  fecha: string;
  lugar: string;
  descripcion: string;
  imagen_url: string;
}

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
          console.error('API response is not an array:', data);
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
        toaster.success({
          title: 'Evento eliminado',
        });
        setEventos(eventos.filter(e => e.id !== id));
      } else {
        toaster.error({
          title: 'Error al eliminar',
        });
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="purple.500" />
      </Center>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Mis Eventos</Heading>
        <Button asChild colorPalette="purple">
          <RouterLink to="/admin/crear-evento">
            <LuPlus />
            Nuevo Evento
          </RouterLink>
        </Button>
      </Flex>

      {eventos.length === 0 ? (
        <Box textAlign="center" py={10} px={6} borderWidth={1} borderRadius="lg" borderStyle="dashed" borderColor={{ _light: "gray.300", _dark: "gray.600" }}>
          <Heading size="md" mb={2} color={{ _light: "gray.600", _dark: "gray.400" }}>No tienes eventos creados</Heading>
          <Text color={{ _light: "gray.500", _dark: "gray.400" }} mb={6}>Comienza creando tu primer evento para vender entradas.</Text>
          <Button asChild colorPalette="purple">
            <RouterLink to="/admin/crear-evento">
              Crear Evento
            </RouterLink>
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
          {eventos.map((evento) => (
            <Card.Root key={evento.id} variant="outline" bg={{ _light: "white", _dark: "gray.800" }} borderColor={{ _light: "gray.200", _dark: "gray.700" }} _hover={{ shadow: 'md' }}>
              <Card.Header pb={2}>
                <Flex justify="space-between" align="start">
                  <Heading size="md" lineClamp={1}>{evento.titulo}</Heading>
                  <Badge colorPalette="purple">Activo</Badge>
                </Flex>
                <Text fontSize="sm" color={{ _light: "gray.600", _dark: "gray.400" }}>
                  {new Date(evento.fecha).toLocaleDateString()}
                </Text>
              </Card.Header>
              <Card.Body py={2}>
                <Text lineClamp={2} fontSize="sm">
                  {evento.descripcion || 'Sin descripción'}
                </Text>
                <Text mt={2} fontSize="xs" fontWeight="bold" color={{ _light: "gray.600", _dark: "gray.400" }}>
                  📍 {evento.lugar}
                </Text>
              </Card.Body>
              <Card.Footer pt={2}>
                <Flex width="100%" justify="flex-end" gap={2}>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    colorPalette="purple"
                    asChild
                  >
                    <RouterLink to={`/admin/evento/${evento.id}/tickets`}>
                      Ver Entradas
                    </RouterLink>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    colorPalette="blue"
                    asChild
                  >
                    <RouterLink to={`/admin/editar-evento/${evento.id}`}>
                      Editar
                    </RouterLink>
                  </Button>
                  <IconButton
                    aria-label="Eliminar evento"
                    size="sm"
                    colorPalette="red"
                    variant="ghost"
                    onClick={() => handleDelete(evento.id)}
                  >
                    <LuTrash />
                  </IconButton>
                </Flex>
              </Card.Footer>
            </Card.Root>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
