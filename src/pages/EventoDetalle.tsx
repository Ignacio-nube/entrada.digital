import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Heading, Text, Image, Stack, Input, Button, 
  Flex, Card, Grid, GridItem, Separator, NativeSelect 
} from '@chakra-ui/react';
import { NumberInputRoot, NumberInputField } from '@/components/ui/number-input';
import { Field } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';
import { toaster } from '@/components/ui/toaster';
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

  if (!evento) return (
    <Flex justify="center" align="center" h="50vh">
      <Button loading variant="ghost" loadingText="Cargando evento...">Cargando</Button>
    </Flex>
  );

  const tipoActual = evento.tipos_entrada?.find(t => t.id === parseInt(tipoSeleccionado));

  return (
    <Box minH="calc(100vh - 72px)" py={10} bg="bg.subtle">
      <Container maxW="1000px">
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
          {/* Columna Izquierda: Info Evento */}
          <GridItem>
            <Stack gap={6}>
              <Image 
                src={evento.imagen_url} 
                borderRadius="xl" 
                objectFit="cover" 
                w="100%" 
                h="400px" 
                shadow="lg" 
              />
              <Card.Root>
                <Card.Body gap={3}>
                  <Heading size="xl">{evento.titulo}</Heading>
                  <Text fontSize="lg" fontWeight="bold" color="purple.fg">
                    📅 {new Date(evento.fecha).toLocaleString()} <br/>
                    📍 {evento.lugar}
                  </Text>
                  <Text color="fg.muted" lineHeight="tall">
                    {evento.descripcion}
                  </Text>
                </Card.Body>
              </Card.Root>
            </Stack>
          </GridItem>

          {/* Columna Derecha: Formulario Compra */}
          <GridItem>
            <Card.Root>
              <Card.Header bg="purple.subtle" borderTopRadius="lg">
                <Heading size="md">🎟️ Compra tus entradas</Heading>
              </Card.Header>
              <Card.Body>
                <Stack gap={5}>
                  <Field 
                    label="Tipo de Entrada" 
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
                      >
                        {evento.tipos_entrada?.map(tipo => (
                          <option key={tipo.id} value={tipo.id} disabled={tipo.stock <= 0}>
                            {tipo.nombre} - ${tipo.precio} {tipo.stock <= 0 ? '(Agotado)' : ''}
                          </option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field>

                  <Field label="Cantidad" required>
                    <NumberInputRoot 
                      min={1} 
                      max={10} 
                      value={cantidad.toString()} 
                      onValueChange={(details) => setCantidad(details.valueAsNumber)}
                    >
                      <NumberInputField />
                    </NumberInputRoot>
                  </Field>

                  <Box 
                    p={4} 
                    bg="purple.subtle" 
                    borderRadius="md" 
                    borderLeftWidth="4px"
                    borderColor="purple.solid"
                  >
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="bold">Total a Pagar:</Text>
                      <Text fontWeight="extrabold" fontSize="2xl" color="purple.fg">
                        ${tipoActual ? (parseFloat(tipoActual.precio) * cantidad).toFixed(2) : '0.00'}
                      </Text>
                    </Flex>
                  </Box>

                  <Separator />

                  <Heading size="sm">Datos del Comprador</Heading>
                  
                  <Field 
                    label="Nombre Completo" 
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
                    />
                  </Field>

                  <Field 
                    label="Correo Electrónico" 
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
                    />
                  </Field>

                  <Field invalid={errors.pago} errorText="Debes aceptar el método de pago.">
                    <Checkbox 
                      checked={metodoPago} 
                      onCheckedChange={(e) => {
                        setMetodoPago(!!e.checked);
                        setErrors({...errors, pago: false});
                      }}
                      colorPalette="purple"
                    >
                      Acepto pagar con Tarjeta (Simulado)
                    </Checkbox>
                  </Field>

                  <Button 
                    colorPalette="purple" 
                    size="lg" 
                    onClick={handleCompra} 
                    loading={loading} 
                    disabled={!tipoActual}
                    w="full"
                    mt={2}
                  >
                    Confirmar Compra
                  </Button>
                </Stack>
              </Card.Body>
            </Card.Root>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default EventoDetalle;
