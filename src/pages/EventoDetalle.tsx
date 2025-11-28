import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Heading, Text, Image, Stack, Select, 
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Input, Button, Checkbox, FormControl, FormLabel, useToast, Divider, Flex, Card, CardBody, CardHeader, Grid, GridItem, FormErrorMessage, useColorModeValue
} from '@chakra-ui/react';
import axios from 'axios';

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
  const toast = useToast();
  
  const [evento, setEvento] = useState<Evento | null>(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>('');
  const [cantidad, setCantidad] = useState(1);
  const [metodoPago, setMetodoPago] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Estados de error para validación
  const [errors, setErrors] = useState({
    nombre: false,
    email: false,
    tipo: false,
    pago: false
  });

  // Dynamic Colors
  const infoBoxBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)');
  const headerBg = useColorModeValue('purple.50', 'purple.900');
  const inputBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const headingColor = useColorModeValue('purple.800', 'purple.200');
  const subHeadingColor = useColorModeValue('purple.600', 'purple.300');
  const totalBoxBg = useColorModeValue('purple.50', 'whiteAlpha.100');
  const borderColor = useColorModeValue('purple.100', 'purple.700');

  useEffect(() => {
    axios.get(`http://localhost:3000/api/eventos/${id}`)
      .then(res => setEvento(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const handleCompra = async () => {
    // Validaciones individuales
    const newErrors = {
      nombre: nombre.trim() === '',
      email: email.trim() === '' || !email.includes('@'),
      tipo: tipoSeleccionado === '',
      pago: !metodoPago
    };

    setErrors(newErrors);

    // Si hay algún error, detenemos el proceso
    if (Object.values(newErrors).some(error => error)) {
      toast({
        title: 'Faltan datos',
        description: 'Por favor revisa los campos marcados en rojo.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/comprar', {
        nombre,
        email,
        tipo_entrada_id: parseInt(tipoSeleccionado),
        cantidad,
        metodo_pago: 'tarjeta_simulada'
      });

      navigate('/exito', { state: { datos: res.data } });
    } catch (error: any) {
      toast({
        title: 'Error en la compra',
        description: error.response?.data?.error || 'Ocurrió un error inesperado',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!evento) return (
    <Flex justify="center" align="center" h="50vh">
      <Button isLoading variant="ghost" loadingText="Cargando evento..." color="white" _hover={{ bg: 'whiteAlpha.200' }}>Cargando</Button>
    </Flex>
  );

  const tipoActual = evento.tipos_entrada?.find(t => t.id === parseInt(tipoSeleccionado));

  return (
    <Box minH="calc(100vh - 72px)" py={10}>
      <Container maxW="1000px">
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
          {/* Columna Izquierda: Info Evento */}
          <GridItem>
            <Stack spacing={6}>
              <Image 
                src={evento.imagen_url} 
                borderRadius="xl" 
                objectFit="cover" 
                w="100%" 
                h="400px" 
                shadow="2xl" 
                border="1px solid"
                borderColor="whiteAlpha.300"
              />
              <Box 
                bg={infoBoxBg} 
                backdropFilter="blur(12px)" 
                p={6} 
                borderRadius="xl" 
                shadow="lg"
              >
                <Heading size="xl" mb={2} color={headingColor}>{evento.titulo}</Heading>
                <Text fontSize="lg" fontWeight="bold" color={subHeadingColor} mb={4}>
                  📅 {new Date(evento.fecha).toLocaleString()} <br/>
                  📍 {evento.lugar}
                </Text>
                <Text fontSize="md" color={textColor} lineHeight="tall">
                  {evento.descripcion}
                </Text>
              </Box>
            </Stack>
          </GridItem>

          {/* Columna Derecha: Formulario Compra */}
          <GridItem>
            <Card 
              shadow="2xl" 
              borderRadius="xl" 
              bg={cardBg} 
              backdropFilter="blur(16px)"
              border="1px solid"
              borderColor="whiteAlpha.500"
            >
              <CardHeader bg={headerBg} borderTopRadius="xl" py={4} borderBottom="1px solid" borderColor={borderColor}>
                <Heading size="md" color={headingColor}>🎟️ Compra tus entradas</Heading>
              </CardHeader>
              <CardBody>
                <Stack spacing={5}>
                  <FormControl isRequired isInvalid={errors.tipo}>
                    <FormLabel fontWeight="bold">Tipo de Entrada</FormLabel>
                    <Select 
                      placeholder="Selecciona una opción" 
                      onChange={(e) => {
                        setTipoSeleccionado(e.target.value);
                        setErrors({...errors, tipo: false});
                      }}
                      focusBorderColor="purple.500"
                      bg={inputBg}
                    >
                      {evento.tipos_entrada?.map(tipo => (
                        <option key={tipo.id} value={tipo.id} disabled={tipo.stock <= 0}>
                          {tipo.nombre} - ${tipo.precio} {tipo.stock <= 0 ? '(Agotado)' : ''}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>Debes seleccionar un tipo de entrada.</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="bold">Cantidad</FormLabel>
                    <NumberInput 
                      min={1} 
                      max={10} 
                      value={cantidad} 
                      onChange={(_, val) => setCantidad(val)}
                      focusBorderColor="purple.500"
                      bg={inputBg}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <Box 
                    p={4} 
                    bg={totalBoxBg} 
                    borderRadius="md" 
                    borderLeft="4px solid" 
                    borderColor="purple.500"
                  >
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="bold" color={textColor}>Total a Pagar:</Text>
                      <Text fontWeight="extrabold" fontSize="2xl" color={subHeadingColor}>
                        ${tipoActual ? (parseFloat(tipoActual.precio) * cantidad).toFixed(2) : '0.00'}
                      </Text>
                    </Flex>
                  </Box>

                  <Divider />

                  <Heading size="sm" color={textColor}>Datos del Comprador</Heading>
                  
                  <FormControl isRequired isInvalid={errors.nombre}>
                    <FormLabel>Nombre Completo</FormLabel>
                    <Input 
                      placeholder="Ej: Juan Pérez" 
                      value={nombre} 
                      onChange={(e) => {
                        setNombre(e.target.value);
                        setErrors({...errors, nombre: false});
                      }} 
                      focusBorderColor="purple.500"
                      bg={inputBg}
                    />
                    <FormErrorMessage>El nombre es obligatorio.</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={errors.email}>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <Input 
                      type="email" 
                      placeholder="Ej: juan@example.com" 
                      value={email} 
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors({...errors, email: false});
                      }} 
                      focusBorderColor="purple.500"
                      bg={inputBg}
                    />
                    <FormErrorMessage>Ingresa un correo válido.</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.pago}>
                    <Checkbox 
                      isChecked={metodoPago} 
                      onChange={(e) => {
                        setMetodoPago(e.target.checked);
                        setErrors({...errors, pago: false});
                      }}
                      colorScheme="purple"
                    >
                      Acepto pagar con Tarjeta (Simulado)
                    </Checkbox>
                    <FormErrorMessage>Debes aceptar el método de pago.</FormErrorMessage>
                  </FormControl>

                  <Button 
                    colorScheme="purple" 
                    size="lg" 
                    onClick={handleCompra} 
                    isLoading={loading} 
                    isDisabled={!tipoActual}
                    w="full"
                    mt={2}
                    shadow="md"
                    _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                  >
                    Confirmar Compra
                  </Button>
                </Stack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default EventoDetalle;
