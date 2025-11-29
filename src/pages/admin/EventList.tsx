import { useEffect, useState } from 'react';
import {
  Box, Heading, SimpleGrid, Card, CardHeader, CardBody, CardFooter,
  Text, Button, useToast, Badge, Flex, IconButton, Spinner, Center
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
  const toast = useToast();

  const fetchEventos = async () => {
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
  };

  useEffect(() => {
    fetchEventos();
  }, [token]);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;

    try {
      const response = await fetch(`/api/eventos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast({
          title: 'Evento eliminado',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setEventos(eventos.filter(e => e.id !== id));
      } else {
        toast({
          title: 'Error al eliminar',
          status: 'error',
          duration: 3000,
          isClosable: true,
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
        <Button
          as={RouterLink}
          to="/admin/crear-evento"
          leftIcon={<AddIcon />}
          colorScheme="purple"
        >
          Nuevo Evento
        </Button>
      </Flex>

      {eventos.length === 0 ? (
        <Box textAlign="center" py={10} px={6} borderWidth={1} borderRadius="lg" borderStyle="dashed">
          <Heading size="md" mb={2} color="gray.500">No tienes eventos creados</Heading>
          <Text color="gray.500" mb={6}>Comienza creando tu primer evento para vender entradas.</Text>
          <Button as={RouterLink} to="/admin/crear-evento" colorScheme="purple">
            Crear Evento
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {eventos.map((evento) => (
            <Card key={evento.id} variant="outline" _hover={{ shadow: 'md' }}>
              <CardHeader pb={2}>
                <Flex justify="space-between" align="start">
                  <Heading size="md" noOfLines={1}>{evento.titulo}</Heading>
                  <Badge colorScheme="purple">Activo</Badge>
                </Flex>
                <Text fontSize="sm" color="gray.500">
                  {new Date(evento.fecha).toLocaleDateString()}
                </Text>
              </CardHeader>
              <CardBody py={2}>
                <Text noOfLines={2} fontSize="sm">
                  {evento.descripcion || 'Sin descripción'}
                </Text>
                <Text mt={2} fontSize="xs" fontWeight="bold" color="gray.600">
                  📍 {evento.lugar}
                </Text>
              </CardBody>
              <CardFooter pt={2}>
                <Flex width="100%" justify="flex-end" gap={2}>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    colorScheme="purple"
                    as={RouterLink}
                    to={`/admin/evento/${evento.id}/tickets`}
                  >
                    Ver Entradas
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    colorScheme="blue"
                    as={RouterLink}
                    to={`/admin/editar-evento/${evento.id}`}
                  >
                    Editar
                  </Button>
                  <IconButton
                    aria-label="Eliminar evento"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDelete(evento.id)}
                  />
                </Flex>
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
