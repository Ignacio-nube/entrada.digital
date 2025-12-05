import { useState } from 'react';
import {
  Box, Button, Input, VStack, Heading, Textarea,
  HStack, IconButton, Card, Text, Separator, Flex
} from '@chakra-ui/react';
import { LuPlus, LuTrash } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Field } from '../../components/ui/field';
import { NumberInputRoot, NumberInputField } from '../../components/ui/number-input';
import { toaster } from '../../components/ui/toaster';

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
      toaster.error({
        title: 'Error en entradas',
        description: 'Por favor completa todos los campos de los tipos de entrada correctamente.',
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
        toaster.success({
          title: 'Evento creado',
          description: 'El evento y sus tipos de entrada se han creado correctamente.',
        });
        navigate('/admin/eventos');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear evento');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      toaster.error({
        title: 'Error',
        description: message,
      });
    }
  };

  return (
    <Box maxW="800px" mx="auto">
      <Heading mb={6}>Crear Nuevo Evento</Heading>
      <form onSubmit={handleSubmit}>
        <VStack gap={4} align="stretch">
          <Card.Root variant="outline" bg={{ _light: "white", _dark: "gray.800" }} borderColor={{ _light: "gray.200", _dark: "gray.700" }}>
            <Card.Body>
              <VStack gap={4}>
                <Field label="Nombre del Evento" required>
                  <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </Field>

                <HStack width="100%">
                  <Field label="Fecha y Hora" required>
                    <Input type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                  </Field>
                  <Field label="Lugar" required>
                    <Input value={lugar} onChange={(e) => setLugar(e.target.value)} />
                  </Field>
                </HStack>

                <Field label="Descripción">
                  <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                </Field>

                <Field label="URL de Imagen">
                  <Input value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} placeholder="https://..." />
                </Field>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Separator />

          <Box>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Tipos de Entrada</Heading>
              <Button size="sm" colorPalette="purple" onClick={handleAddTicketType}>
                <LuPlus />
                Agregar Tipo
              </Button>
            </Flex>

            {ticketTypes.map((ticket, index) => (
              <Card.Root key={index} mb={4} variant="outline" bg={{ _light: "white", _dark: "gray.800" }} borderColor={{ _light: "purple.200", _dark: "purple.700" }}>
                <Card.Body>
                  <VStack gap={3}>
                    <Flex width="100%" justify="space-between" align="center">
                      <Text fontWeight="bold" color={{ _light: "purple.600", _dark: "purple.300" }}>Opción #{index + 1}</Text>
                      {ticketTypes.length > 1 && (
                        <IconButton
                          aria-label="Eliminar tipo"
                          size="sm"
                          colorPalette="red"
                          variant="ghost"
                          onClick={() => handleRemoveTicketType(index)}
                        >
                          <LuTrash />
                        </IconButton>
                      )}
                    </Flex>
                    
                    <Field label="Nombre (Ej: General, VIP)" required>
                      <Input 
                        value={ticket.nombre} 
                        onChange={(e) => handleTicketTypeChange(index, 'nombre', e.target.value)}
                        placeholder="Nombre de la entrada"
                      />
                    </Field>

                    <HStack width="100%">
                      <Field label="Precio ($)" required>
                        <NumberInputRoot min={0}>
                          <NumberInputField 
                            value={ticket.precio} 
                            onChange={(e) => handleTicketTypeChange(index, 'precio', e.target.value)}
                            placeholder="0.00"
                          />
                        </NumberInputRoot>
                      </Field>

                      <Field label="Stock (Cant.)" required>
                        <NumberInputRoot min={1}>
                          <NumberInputField 
                            value={ticket.stock} 
                            onChange={(e) => handleTicketTypeChange(index, 'stock', e.target.value)}
                            placeholder="100"
                          />
                        </NumberInputRoot>
                      </Field>
                    </HStack>
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))}
          </Box>

          <Button type="submit" colorPalette="purple" size="lg" mt={4}>
            Crear Evento Completo
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
