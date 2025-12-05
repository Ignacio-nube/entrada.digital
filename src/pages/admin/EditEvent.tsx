import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Input, VStack, Heading, Textarea,
  Card, Spinner, Center, HStack, Flex, Text, IconButton, Separator
} from '@chakra-ui/react';
import { LuPlus, LuTrash } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Field } from '../../components/ui/field';
import { NumberInputRoot, NumberInputField } from '../../components/ui/number-input';
import { toaster } from '../../components/ui/toaster';

interface TicketType {
  id?: number;
  nombre: string;
  precio: string;
  stock: string;
}

interface EventoData {
  titulo: string;
  fecha: string;
  lugar: string;
  descripcion: string;
  imagen_url: string;
  tipos_entrada?: Array<{
    id: number;
    nombre: string;
    precio: number;
    stock: number;
  }>;
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
  const navigate = useNavigate();

  const fetchEvent = useCallback(async () => {
    try {
      const response = await fetch(`/api/eventos/${id}`);
      if (response.ok) {
        const data: EventoData = await response.json();
        setNombre(data.titulo);
        
        const dateObj = new Date(data.fecha);
        dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset());
        setFecha(dateObj.toISOString().slice(0, 16));
        
        setLugar(data.lugar);
        setDescripcion(data.descripcion);
        setImagenUrl(data.imagen_url);
        
        // Cargar tipos de entrada
        if (data.tipos_entrada) {
          setTicketTypes(data.tipos_entrada.map((t) => ({
            id: t.id,
            nombre: t.nombre,
            precio: t.precio.toString(),
            stock: t.stock.toString()
          })));
        }
      } else {
        toaster.error({ title: 'Error al cargar evento' });
        navigate('/admin/eventos');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleAddTicketType = () => {
    setTicketTypes([...ticketTypes, { nombre: '', precio: '', stock: '' }]);
  };

  // Nota: Por ahora solo removemos de la vista (no se borra de BD para evitar conflictos con ventas)
  // Si es un tipo nuevo (sin ID), sí lo borramos del array.
  const handleRemoveTicketType = (index: number) => {
    const typeToRemove = ticketTypes[index];
    if (typeToRemove.id) {
      toaster.warning({
        title: 'No se puede eliminar',
        description: 'Por seguridad, no se pueden eliminar tipos de entrada existentes que podrían tener ventas asociadas. Puedes poner el stock en 0.',
      });
      return;
    }
    
    const newTypes = ticketTypes.filter((_, i) => i !== index);
    setTicketTypes(newTypes);
  };

  const handleTicketTypeChange = (index: number, field: keyof Omit<TicketType, 'id'>, value: string) => {
    const newTypes = [...ticketTypes];
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
      toaster.error({
        title: 'Error en entradas',
        description: 'Completa todos los campos de las entradas correctamente.',
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
        toaster.success({
          title: 'Evento actualizado',
        });
        navigate('/admin/eventos');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      toaster.error({
        title: 'Error',
        description: message,
      });
    }
  };

  if (loading) return <Center h="50vh"><Spinner /></Center>;

  return (
    <Box maxW="800px" mx="auto">
      <Heading mb={6}>Editar Evento</Heading>
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
                  <Input value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} />
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
                      <Text fontWeight="bold" color={{ _light: "purple.600", _dark: "purple.300" }}>
                        {ticket.id ? `Editar: ${ticket.nombre}` : 'Nuevo Tipo de Entrada'}
                      </Text>
                      <IconButton
                        aria-label="Eliminar tipo"
                        size="sm"
                        colorPalette="red"
                        variant="ghost"
                        onClick={() => handleRemoveTicketType(index)}
                        disabled={!!ticket.id} // Deshabilitar si ya existe en BD
                        title={ticket.id ? "No se pueden eliminar entradas existentes" : "Eliminar"}
                      >
                        <LuTrash />
                      </IconButton>
                    </Flex>
                    
                    <Field label="Nombre" required>
                      <Input 
                        value={ticket.nombre} 
                        onChange={(e) => handleTicketTypeChange(index, 'nombre', e.target.value)}
                      />
                    </Field>

                    <HStack width="100%">
                      <Field label="Precio ($)" required>
                        <NumberInputRoot min={0}>
                          <NumberInputField 
                            value={ticket.precio} 
                            onChange={(e) => handleTicketTypeChange(index, 'precio', e.target.value)}
                          />
                        </NumberInputRoot>
                      </Field>

                      <Field label="Stock" required>
                        <NumberInputRoot min={0}>
                          <NumberInputField 
                            value={ticket.stock} 
                            onChange={(e) => handleTicketTypeChange(index, 'stock', e.target.value)}
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
            Guardar Cambios
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
