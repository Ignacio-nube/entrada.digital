import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Heading, Text, Stack, Input, Button, 
  Flex, Grid, GridItem, NativeSelect, VStack, HStack
} from '@chakra-ui/react';
import { NumberInputRoot, NumberInputField } from '@/components/ui/number-input';
import { Field } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';
import { toaster } from '@/components/ui/toaster';
import { motion, AnimatePresence } from 'framer-motion';
import { LuCalendar, LuMapPin, LuTicket, LuArrowLeft } from 'react-icons/lu';
import axios from 'axios';
import { getOptimizedUrl } from '@/components/OptimizedImage';

interface TipoEntrada {
  id: number;
  nombre: string;
  precio: string;
  stock: number;
}

interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  lugar: string;
  imagen_url: string;
  tipos_entrada: TipoEntrada[];
}

const EventoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [evento, setEvento] = useState<Evento | null>(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>('');
  const [cantidad, setCantidad] = useState(1);
  const [metodoPago, setMetodoPago] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [errors, setErrors] = useState({
    nombre: false,
    email: false,
    tipo: false,
    pago: false
  });

  useEffect(() => {
    axios.get(`/api/eventos/${id}`)
      .then(res => setEvento(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const handleCompra = async () => {
    const newErrors = {
      nombre: nombre.trim() === '',
      email: email.trim() === '' || !email.includes('@'),
      tipo: tipoSeleccionado === '',
      pago: !metodoPago
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error)) {
      toaster.error({
        title: 'Faltan datos',
        description: 'Por favor revisa los campos marcados en rojo.',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/comprar', {
        nombre,
        email,
        tipo_entrada_id: parseInt(tipoSeleccionado),
        cantidad,
        metodo_pago: 'tarjeta_simulada'
      });

      navigate('/exito', { state: { datos: res.data } });
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || 'Ocurrió un error inesperado'
        : 'Ocurrió un error inesperado';
      toaster.error({
        title: 'Error en la compra',
        description: errorMessage,
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!evento) return (
    <Box 
      minH="100vh" 
      bg="black" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <VStack gap={4}>
          <Box
            w="50px"
            h="50px"
            borderRadius="full"
            border="3px solid"
            borderColor="transparent"
            borderTopColor="#ff6b6b"
            animation="spin 1s linear infinite"
          />
          <Text color="white" fontFamily="'Poppins', sans-serif">
            Cargando evento...
          </Text>
        </VStack>
      </motion.div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );

  const tipoActual = evento.tipos_entrada?.find(t => t.id === parseInt(tipoSeleccionado));

  return (
    <Box 
      minH="100vh" 
      position="relative"
      overflow="hidden"
    >
      {/* Background Image */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundImage={`url('${getOptimizedUrl(evento.imagen_url, 1920, 1080, 'auto:eco')}')`}
        backgroundSize="cover"
        backgroundPosition="center"
        filter="blur(8px)"
        transform="scale(1.1)"
        zIndex={0}
      />
      
      {/* Dark Overlay */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(0, 0, 0, 0.7)"
        zIndex={1}
      />

      {/* Content */}
      <Box position="relative" zIndex={2} pt={{ base: 20, md: 24 }} pb={10}>
        <Container maxW="1200px">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="ghost"
              color="white"
              mb={6}
              onClick={() => navigate('/')}
              _hover={{ bg: 'rgba(255, 107, 107, 0.2)' }}
            >
              <LuArrowLeft />
              Volver a eventos
            </Button>
          </motion.div>

          <Grid templateColumns={{ base: "1fr", lg: "1.2fr 1fr" }} gap={8}>
            {/* Left Column - Event Info */}
            <GridItem>
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <VStack align="start" gap={6}>
                    {/* Event Image */}
                    <Box
                      w="100%"
                      h={{ base: '250px', md: '350px' }}
                      borderRadius="2xl"
                      overflow="hidden"
                      boxShadow="0 20px 60px rgba(0, 0, 0, 0.5)"
                    >
                      <motion.img
                        src={getOptimizedUrl(evento.imagen_url, 800, 450, 'auto:good')}
                        alt={evento.titulo}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8 }}
                      />
                    </Box>

                    {/* Event Details Glass Card */}
                    <Box
                      w="100%"
                      bg="rgba(255, 255, 255, 0.1)"
                      backdropFilter="blur(20px)"
                      border="1px solid rgba(255, 255, 255, 0.2)"
                      borderRadius="2xl"
                      p={6}
                    >
                      <VStack align="start" gap={4}>
                        <Heading 
                          as="h1" 
                          size={{ base: 'xl', md: '2xl' }}
                          color="white"
                          fontFamily="'Poppins', sans-serif"
                          fontWeight="700"
                        >
                          {evento.titulo}
                        </Heading>

                        <HStack gap={6} flexWrap="wrap">
                          <HStack color="whiteAlpha.800">
                            <LuCalendar />
                            <Text fontFamily="'Poppins', sans-serif" fontSize="sm">
                              {formatDate(evento.fecha)}
                            </Text>
                          </HStack>
                          <HStack color="whiteAlpha.800">
                            <LuMapPin />
                            <Text fontFamily="'Poppins', sans-serif" fontSize="sm">
                              {evento.lugar}
                            </Text>
                          </HStack>
                        </HStack>

                        <Text 
                          color="whiteAlpha.700" 
                          lineHeight="1.8"
                          fontFamily="'Poppins', sans-serif"
                        >
                          {evento.descripcion}
                        </Text>
                      </VStack>
                    </Box>
                  </VStack>
                </motion.div>
              </AnimatePresence>
            </GridItem>

            {/* Right Column - Purchase Form */}
            <GridItem>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Box
                  bg="rgba(255, 255, 255, 0.1)"
                  backdropFilter="blur(20px)"
                  border="1px solid rgba(255, 255, 255, 0.2)"
                  borderRadius="2xl"
                  overflow="hidden"
                >
                  {/* Header */}
                  <Box 
                    p={5}
                    bg="linear-gradient(135deg, rgba(255, 107, 107, 0.3) 0%, rgba(255, 138, 128, 0.2) 100%)"
                    borderBottom="1px solid rgba(255, 255, 255, 0.1)"
                  >
                    <HStack>
                      <LuTicket color="#ff6b6b" size={24} />
                      <Heading 
                        size="md" 
                        color="white"
                        fontFamily="'Poppins', sans-serif"
                      >
                        Compra tus entradas
                      </Heading>
                    </HStack>
                  </Box>

                  {/* Form */}
                  <Box p={6}>
                    <Stack gap={5}>
                      <Field 
                        label={<Text color="white" fontFamily="'Poppins', sans-serif" fontSize="sm">Tipo de Entrada</Text>}
                        required 
                        invalid={errors.tipo}
                        errorText="Debes seleccionar un tipo de entrada."
                      >
                        <NativeSelect.Root>
                          <NativeSelect.Field 
                            placeholder="Selecciona una opción" 
                            onChange={(e) => {
                              setTipoSeleccionado(e.target.value);
                              setErrors({...errors, tipo: false});
                            }}
                            bg="rgba(255, 255, 255, 0.1)"
                            border="1px solid rgba(255, 255, 255, 0.2)"
                            color="white"
                            borderRadius="lg"
                            _hover={{ borderColor: 'rgba(255, 107, 107, 0.5)' }}
                            _focus={{ borderColor: '#ff6b6b', boxShadow: '0 0 0 1px #ff6b6b' }}
                          >
                            {evento.tipos_entrada?.map(tipo => (
                              <option 
                                key={tipo.id} 
                                value={tipo.id} 
                                disabled={tipo.stock <= 0}
                                style={{ background: '#1a1a1a', color: 'white' }}
                              >
                                {tipo.nombre} - ${tipo.precio} {tipo.stock <= 0 ? '(Agotado)' : ''}
                              </option>
                            ))}
                          </NativeSelect.Field>
                          <NativeSelect.Indicator color="white" />
                        </NativeSelect.Root>
                      </Field>

                      <Field label={<Text color="white" fontFamily="'Poppins', sans-serif" fontSize="sm">Cantidad</Text>} required>
                        <NumberInputRoot 
                          min={1} 
                          max={10} 
                          value={cantidad.toString()} 
                          onValueChange={(details) => setCantidad(details.valueAsNumber)}
                        >
                          <NumberInputField 
                            bg="rgba(255, 255, 255, 0.1)"
                            border="1px solid rgba(255, 255, 255, 0.2)"
                            color="white"
                            borderRadius="lg"
                            _hover={{ borderColor: 'rgba(255, 107, 107, 0.5)' }}
                            _focus={{ borderColor: '#ff6b6b', boxShadow: '0 0 0 1px #ff6b6b' }}
                          />
                        </NumberInputRoot>
                      </Field>

                      {/* Total */}
                      <Box 
                        p={4} 
                        bg="linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 138, 128, 0.1) 100%)"
                        borderRadius="xl" 
                        border="1px solid rgba(255, 107, 107, 0.3)"
                      >
                        <Flex justify="space-between" align="center">
                          <Text fontWeight="500" color="white" fontFamily="'Poppins', sans-serif">
                            Total a Pagar:
                          </Text>
                          <Text 
                            fontWeight="700" 
                            fontSize="2xl" 
                            color="#ff6b6b"
                            fontFamily="'Poppins', sans-serif"
                          >
                            ${tipoActual ? (parseFloat(tipoActual.precio) * cantidad).toFixed(2) : '0.00'}
                          </Text>
                        </Flex>
                      </Box>

                      {/* Separator */}
                      <Box h="1px" bg="rgba(255, 255, 255, 0.1)" my={2} />

                      <Text 
                        fontWeight="600" 
                        color="white" 
                        fontFamily="'Poppins', sans-serif"
                        fontSize="sm"
                      >
                        Datos del Comprador
                      </Text>
                      
                      <Field 
                        label={<Text color="white" fontFamily="'Poppins', sans-serif" fontSize="sm">Nombre Completo</Text>}
                        required 
                        invalid={errors.nombre}
                        errorText="El nombre es obligatorio."
                      >
                        <Input 
                          placeholder="Ej: Juan Pérez" 
                          value={nombre} 
                          onChange={(e) => {
                            setNombre(e.target.value);
                            setErrors({...errors, nombre: false});
                          }}
                          bg="rgba(255, 255, 255, 0.1)"
                          border="1px solid rgba(255, 255, 255, 0.2)"
                          color="white"
                          borderRadius="lg"
                          _placeholder={{ color: 'whiteAlpha.500' }}
                          _hover={{ borderColor: 'rgba(255, 107, 107, 0.5)' }}
                          _focus={{ borderColor: '#ff6b6b', boxShadow: '0 0 0 1px #ff6b6b' }}
                        />
                      </Field>

                      <Field 
                        label={<Text color="white" fontFamily="'Poppins', sans-serif" fontSize="sm">Correo Electrónico</Text>}
                        required 
                        invalid={errors.email}
                        errorText="Ingresa un correo válido."
                      >
                        <Input 
                          type="email" 
                          placeholder="Ej: juan@example.com" 
                          value={email} 
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setErrors({...errors, email: false});
                          }}
                          bg="rgba(255, 255, 255, 0.1)"
                          border="1px solid rgba(255, 255, 255, 0.2)"
                          color="white"
                          borderRadius="lg"
                          _placeholder={{ color: 'whiteAlpha.500' }}
                          _hover={{ borderColor: 'rgba(255, 107, 107, 0.5)' }}
                          _focus={{ borderColor: '#ff6b6b', boxShadow: '0 0 0 1px #ff6b6b' }}
                        />
                      </Field>

                      <Field invalid={errors.pago} errorText="Debes aceptar el método de pago.">
                        <Checkbox 
                          checked={metodoPago} 
                          onCheckedChange={(e) => {
                            setMetodoPago(!!e.checked);
                            setErrors({...errors, pago: false});
                          }}
                          colorPalette="red"
                        >
                          <Text color="whiteAlpha.800" fontSize="sm" fontFamily="'Poppins', sans-serif">
                            Acepto pagar con Tarjeta (Simulado)
                          </Text>
                        </Checkbox>
                      </Field>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          size="lg" 
                          onClick={handleCompra} 
                          loading={loading} 
                          disabled={!tipoActual}
                          w="full"
                          mt={2}
                          bg="linear-gradient(135deg, #ff6b6b 0%, #ff8a80 50%, #ffab40 100%)"
                          color="white"
                          fontFamily="'Poppins', sans-serif"
                          fontWeight="600"
                          borderRadius="xl"
                          _hover={{
                            boxShadow: '0 10px 30px rgba(255, 107, 107, 0.4)',
                          }}
                          _disabled={{
                            opacity: 0.5,
                            cursor: 'not-allowed',
                          }}
                        >
                          Confirmar Compra
                        </Button>
                      </motion.div>
                    </Stack>
                  </Box>
                </Box>
              </motion.div>
            </GridItem>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default EventoDetalle;
