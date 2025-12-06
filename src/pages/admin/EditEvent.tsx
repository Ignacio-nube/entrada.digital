import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Input, VStack, Heading, Textarea,
  Spinner, Center, HStack, Flex, Text, IconButton
} from '@chakra-ui/react';
import { LuPlus, LuTrash2, LuArrowLeft, LuLock } from 'react-icons/lu';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { Field } from '../../components/ui/field';
import { NumberInputRoot, NumberInputField } from '../../components/ui/number-input';
import { toaster } from '../../components/ui/toaster';
import CloudinaryUpload from '../../components/CloudinaryUpload';

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

// Glass card style
const glassCard = {
  bg: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '2xl',
};

// Input style
const inputStyle = {
  bg: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: 'white',
  borderRadius: 'xl',
  _placeholder: { color: 'whiteAlpha.400' },
  _hover: { borderColor: 'rgba(255, 107, 107, 0.5)' },
  _focus: { borderColor: '#ff6b6b', boxShadow: '0 0 0 1px #ff6b6b' },
};

export default function EditEvent() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
      toaster.error({ title: 'Error de conexión' });
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

  const handleRemoveTicketType = (index: number) => {
    const typeToRemove = ticketTypes[index];
    if (typeToRemove.id) {
      toaster.warning({
        title: 'No se puede eliminar',
        description: 'Los tipos existentes no se pueden eliminar. Puedes poner stock en 0.',
      });
      return;
    }
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
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
        description: 'Completa todos los campos correctamente.',
      });
      return;
    }

    setSubmitting(true);
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
        toaster.success({ title: 'Evento actualizado' });
        navigate('/admin/eventos');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      toaster.error({ title: 'Error', description: message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="#ff6b6b" />
      </Center>
    );
  }

  return (
    <Box maxW="600px" mx="auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Flex align="center" gap={3} mb={6}>
          <IconButton
            aria-label="Volver"
            variant="ghost"
            color="white"
            _hover={{ bg: 'whiteAlpha.100' }}
            asChild
          >
            <RouterLink to="/admin/eventos">
              <LuArrowLeft size={20} />
            </RouterLink>
          </IconButton>
          <Heading size="lg" color="white" fontFamily="'Poppins', sans-serif">
            Editar Evento
          </Heading>
        </Flex>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <VStack gap={4} align="stretch">
          {/* Event Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Box {...glassCard} p={5}>
              <VStack gap={4}>
                <Field label={<Text color="whiteAlpha.800" fontSize="sm">Nombre del Evento</Text>} required>
                  <Input 
                    value={nombre} 
                    onChange={(e) => setNombre(e.target.value)} 
                    placeholder="Ej: Concierto Rock 2025"
                    {...inputStyle}
                  />
                </Field>

                <HStack width="100%" gap={3}>
                  <Field label={<Text color="whiteAlpha.800" fontSize="sm">Fecha y Hora</Text>} required>
                    <Input 
                      type="datetime-local" 
                      value={fecha} 
                      onChange={(e) => setFecha(e.target.value)} 
                      {...inputStyle}
                    />
                  </Field>
                  <Field label={<Text color="whiteAlpha.800" fontSize="sm">Lugar</Text>} required>
                    <Input 
                      value={lugar} 
                      onChange={(e) => setLugar(e.target.value)} 
                      placeholder="Ej: Teatro Central"
                      {...inputStyle}
                    />
                  </Field>
                </HStack>

                <Field label={<Text color="whiteAlpha.800" fontSize="sm">Descripción</Text>}>
                  <Textarea 
                    value={descripcion} 
                    onChange={(e) => setDescripcion(e.target.value)} 
                    placeholder="Describe tu evento..."
                    rows={3}
                    {...inputStyle}
                  />
                </Field>

                <Field label={<Text color="whiteAlpha.800" fontSize="sm">Imagen del Evento</Text>}>
                  <CloudinaryUpload 
                    value={imagenUrl} 
                    onChange={(url) => setImagenUrl(url)} 
                    folder="eventos"
                  />
                </Field>
              </VStack>
            </Box>
          </motion.div>

          {/* Ticket Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Box {...glassCard} p={5}>
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontWeight="600" color="white" fontFamily="'Poppins', sans-serif">
                  Tipos de Entrada
                </Text>
                <Button 
                  size="xs" 
                  onClick={handleAddTicketType}
                  bg="rgba(255, 107, 107, 0.2)"
                  color="#ff6b6b"
                  _hover={{ bg: 'rgba(255, 107, 107, 0.3)' }}
                  borderRadius="lg"
                >
                  <LuPlus size={14} />
                  Agregar
                </Button>
              </Flex>

              <VStack gap={3}>
                {ticketTypes.map((ticket, index) => (
                  <Box 
                    key={ticket.id || `new-${index}`}
                    w="100%"
                    p={4}
                    bg={ticket.id ? 'rgba(255, 107, 107, 0.05)' : 'rgba(255, 255, 255, 0.03)'}
                    borderRadius="xl"
                    border={ticket.id ? '1px solid rgba(255, 107, 107, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)'}
                  >
                    <Flex justify="space-between" align="center" mb={3}>
                      <HStack gap={2}>
                        {ticket.id && <LuLock size={12} color="rgba(255,255,255,0.4)" />}
                        <Text fontSize="sm" fontWeight="500" color={ticket.id ? '#ff6b6b' : 'whiteAlpha.600'}>
                          {ticket.id ? ticket.nombre : `Nuevo Tipo #${index + 1}`}
                        </Text>
                      </HStack>
                      <IconButton
                        aria-label="Eliminar"
                        size="xs"
                        variant="ghost"
                        color={ticket.id ? 'whiteAlpha.400' : 'red.400'}
                        onClick={() => handleRemoveTicketType(index)}
                        disabled={!!ticket.id}
                      >
                        <LuTrash2 size={14} />
                      </IconButton>
                    </Flex>
                    
                    <VStack gap={3}>
                      <Input 
                        value={ticket.nombre} 
                        onChange={(e) => handleTicketTypeChange(index, 'nombre', e.target.value)}
                        placeholder="Nombre (Ej: VIP)"
                        size="sm"
                        {...inputStyle}
                      />
                      <HStack width="100%" gap={3}>
                        <NumberInputRoot min={0} flex={1} size="sm">
                          <NumberInputField 
                            value={ticket.precio} 
                            onChange={(e) => handleTicketTypeChange(index, 'precio', e.target.value)}
                            placeholder="Precio $"
                            {...inputStyle}
                          />
                        </NumberInputRoot>
                        <NumberInputRoot min={0} flex={1} size="sm">
                          <NumberInputField 
                            value={ticket.stock} 
                            onChange={(e) => handleTicketTypeChange(index, 'stock', e.target.value)}
                            placeholder="Stock"
                            {...inputStyle}
                          />
                        </NumberInputRoot>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Button 
              type="submit" 
              size="lg" 
              w="full"
              loading={submitting}
              bg="linear-gradient(135deg, #ff6b6b 0%, #ff8a80 50%, #ffab40 100%)"
              color="white"
              fontFamily="'Poppins', sans-serif"
              fontWeight="600"
              borderRadius="xl"
              _hover={{ opacity: 0.9 }}
            >
              Guardar Cambios
            </Button>
          </motion.div>
        </VStack>
      </form>
    </Box>
  );
}
