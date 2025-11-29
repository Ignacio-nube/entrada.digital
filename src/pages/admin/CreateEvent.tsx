import { useState } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, VStack, Heading, Textarea,
  useToast, HStack, IconButton,
  NumberInput, NumberInputField, Card, CardBody, Text, Divider, Flex
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TicketType {
  nombre: string;
  precio: string;
  stock: string;
}

export default function CreateEvent() {
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [lugar, setLugar] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  
  // Estado para tipos de entrada
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { nombre: 'General', precio: '', stock: '' }
  ]);

  const { token } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleAddTicketType = () => {
    setTicketTypes([...ticketTypes, { nombre: '', precio: '', stock: '' }]);
  };

  const handleRemoveTicketType = (index: number) => {
    if (ticketTypes.length > 1) {
      const newTypes = ticketTypes.filter((_, i) => i !== index);
      setTicketTypes(newTypes);
    }
  };

  const handleTicketTypeChange = (index: number, field: keyof TicketType, value: string) => {
    const newTypes = [...ticketTypes];
    newTypes[index][field] = value;
    setTicketTypes(newTypes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que los tipos de entrada tengan datos correctos
    const validTicketTypes = ticketTypes.map(t => ({
      nombre: t.nombre,
      precio: parseFloat(t.precio),
      stock: parseInt(t.stock)
    }));

    if (validTicketTypes.some(t => !t.nombre || isNaN(t.precio) || isNaN(t.stock))) {
      toast({
        title: 'Error en entradas',
        description: 'Por favor completa todos los campos de los tipos de entrada correctamente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch('/api/eventos', {
        method: 'POST',
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
          title: 'Evento creado',
          description: 'El evento y sus tipos de entrada se han creado correctamente.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/admin/eventos');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear evento');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="800px" mx="auto">
      <Heading mb={6}>Crear Nuevo Evento</Heading>
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
                  <Input value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} placeholder="https://..." />
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
                      <Text fontWeight="bold" color="purple.600">Opción #{index + 1}</Text>
                      {ticketTypes.length > 1 && (
                        <IconButton
                          aria-label="Eliminar tipo"
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleRemoveTicketType(index)}
                        />
                      )}
                    </Flex>
                    
                    <FormControl isRequired>
                      <FormLabel fontSize="sm">Nombre (Ej: General, VIP)</FormLabel>
                      <Input 
                        value={ticket.nombre} 
                        onChange={(e) => handleTicketTypeChange(index, 'nombre', e.target.value)}
                        placeholder="Nombre de la entrada"
                      />
                    </FormControl>

                    <HStack width="100%">
                      <FormControl isRequired>
                        <FormLabel fontSize="sm">Precio ($)</FormLabel>
                        <NumberInput min={0}>
                          <NumberInputField 
                            value={ticket.precio} 
                            onChange={(e) => handleTicketTypeChange(index, 'precio', e.target.value)}
                            placeholder="0.00"
                          />
                        </NumberInput>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontSize="sm">Stock (Cant.)</FormLabel>
                        <NumberInput min={1}>
                          <NumberInputField 
                            value={ticket.stock} 
                            onChange={(e) => handleTicketTypeChange(index, 'stock', e.target.value)}
                            placeholder="100"
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
            Crear Evento Completo
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
