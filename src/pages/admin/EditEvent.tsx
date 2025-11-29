import { useState, useEffect } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, VStack, Heading, Textarea,
  useToast, Card, CardBody, Spinner, Center, HStack, Flex, Text, IconButton,
  NumberInput, NumberInputField, Divider
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

interface TicketType {
  id?: number;
  nombre: string;
  precio: string;
  stock: string;
}

export default function EditEvent() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [lugar, setLugar] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);

  const { token } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/eventos/${id}`);
        if (response.ok) {
          const data = await response.json();
          setNombre(data.titulo);
          
          const dateObj = new Date(data.fecha);
          dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset());
          setFecha(dateObj.toISOString().slice(0, 16));
          
          setLugar(data.lugar);
          setDescripcion(data.descripcion);
          setImagenUrl(data.imagen_url);
          
          // Cargar tipos de entrada
          if (data.tipos_entrada) {
            setTicketTypes(data.tipos_entrada.map((t: any) => ({
              id: t.id,
              nombre: t.nombre,
              precio: t.precio.toString(),
              stock: t.stock.toString()
            })));
          }
        } else {
          toast({ title: 'Error al cargar evento', status: 'error' });
          navigate('/admin/eventos');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate, toast]);

  const handleAddTicketType = () => {
    setTicketTypes([...ticketTypes, { nombre: '', precio: '', stock: '' }]);
  };

  // Nota: Por ahora solo removemos de la vista (no se borra de BD para evitar conflictos con ventas)
  // Si es un tipo nuevo (sin ID), sí lo borramos del array.
  const handleRemoveTicketType = (index: number) => {
    const typeToRemove = ticketTypes[index];
    if (typeToRemove.id) {
      toast({
        title: 'No se puede eliminar',
        description: 'Por seguridad, no se pueden eliminar tipos de entrada existentes que podrían tener ventas asociadas. Puedes poner el stock en 0.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    const newTypes = ticketTypes.filter((_, i) => i !== index);
    setTicketTypes(newTypes);
  };

  const handleTicketTypeChange = (index: number, field: keyof TicketType, value: string) => {
    const newTypes = [...ticketTypes];
    // @ts-ignore
    newTypes[index][field] = value;
    setTicketTypes(newTypes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validTicketTypes = ticketTypes.map(t => ({
      id: t.id,
      nombre: t.nombre,
      precio: parseFloat(t.precio),
      stock: parseInt(t.stock)
    }));

    if (validTicketTypes.some(t => !t.nombre || isNaN(t.precio) || isNaN(t.stock))) {
      toast({
        title: 'Error en entradas',
        description: 'Completa todos los campos de las entradas correctamente.',
        status: 'error'
      });
      return;
    }

    try {
      const response = await fetch(`/api/eventos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo: nombre,
          fecha,
          lugar,
          descripcion,
          imagen_url: imagenUrl,
          tipos_entrada: validTicketTypes
        }),
      });

      if (response.ok) {
        toast({
          title: 'Evento actualizado',
          status: 'success',
          duration: 3000,
        });
        navigate('/admin/eventos');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  if (loading) return <Center h="50vh"><Spinner /></Center>;

  return (
    <Box maxW="800px" mx="auto">
      <Heading mb={6}>Editar Evento</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <Card variant="outline">
            <CardBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nombre del Evento</FormLabel>
                  <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </FormControl>

                <HStack width="100%">
                  <FormControl isRequired>
                    <FormLabel>Fecha y Hora</FormLabel>
                    <Input type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Lugar</FormLabel>
                    <Input value={lugar} onChange={(e) => setLugar(e.target.value)} />
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Descripción</FormLabel>
                  <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                </FormControl>

                <FormControl>
                  <FormLabel>URL de Imagen</FormLabel>
                  <Input value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} />
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          <Divider />

          <Box>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Tipos de Entrada</Heading>
              <Button leftIcon={<AddIcon />} size="sm" colorScheme="purple" onClick={handleAddTicketType}>
                Agregar Tipo
              </Button>
            </Flex>

            {ticketTypes.map((ticket, index) => (
              <Card key={index} mb={4} variant="outline" borderColor="purple.200">
                <CardBody>
                  <VStack spacing={3}>
                    <Flex width="100%" justify="space-between" align="center">
                      <Text fontWeight="bold" color="purple.600">
                        {ticket.id ? `Editar: ${ticket.nombre}` : 'Nuevo Tipo de Entrada'}
                      </Text>
                      <IconButton
                        aria-label="Eliminar tipo"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleRemoveTicketType(index)}
                        isDisabled={!!ticket.id} // Deshabilitar si ya existe en BD
                        title={ticket.id ? "No se pueden eliminar entradas existentes" : "Eliminar"}
                      />
                    </Flex>
                    
                    <FormControl isRequired>
                      <FormLabel fontSize="sm">Nombre</FormLabel>
                      <Input 
                        value={ticket.nombre} 
                        onChange={(e) => handleTicketTypeChange(index, 'nombre', e.target.value)}
                      />
                    </FormControl>

                    <HStack width="100%">
                      <FormControl isRequired>
                        <FormLabel fontSize="sm">Precio ($)</FormLabel>
                        <NumberInput min={0}>
                          <NumberInputField 
                            value={ticket.precio} 
                            onChange={(e) => handleTicketTypeChange(index, 'precio', e.target.value)}
                          />
                        </NumberInput>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontSize="sm">Stock</FormLabel>
                        <NumberInput min={0}>
                          <NumberInputField 
                            value={ticket.stock} 
                            onChange={(e) => handleTicketTypeChange(index, 'stock', e.target.value)}
                          />
                        </NumberInput>
                      </FormControl>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </Box>

          <Button type="submit" colorScheme="purple" size="lg" mt={4}>
            Guardar Cambios
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
