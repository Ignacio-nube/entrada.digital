import { useEffect, useState, useCallback } from 'react';
import { 
  Box, Container, Heading, SimpleGrid, Button, Table, 
  IconButton, Input, Textarea, Stack 
} from '@chakra-ui/react';
import { LuPlus, LuTrash } from 'react-icons/lu';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useColorModeValue } from '../components/ui/color-mode';
import { StatRoot, StatLabel, StatValueText, StatHelpText } from '../components/ui/stat';
import { Tabs } from '@chakra-ui/react';
import { Field } from '../components/ui/field';
import { DialogRoot, DialogContent, DialogHeader, DialogBody, DialogCloseTrigger, DialogTitle } from '../components/ui/dialog';
import { toaster } from '../components/ui/toaster';

interface StatsData {
  tickets?: {
    total_tickets: number;
    total_ingresos: number;
  };
  eventos?: number;
}

interface Evento {
  id: number;
  titulo: string;
  fecha: string;
  lugar: string;
  descripcion?: string;
  imagen_url?: string;
}

interface ValidationResult {
  success: boolean;
  message: string;
  ticket?: {
    id: number;
    tipo_entrada_id: number;
    cliente_id: number;
  };
}

const AdminDashboard = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Validation State
  const [qrCode, setQrCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Form State
  const [newEvent, setNewEvent] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    lugar: '',
    imagen_url: ''
  });

  const bg = useColorModeValue('white', 'gray.800');
  const color = useColorModeValue('gray.800', 'white');

  const fetchData = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const statsRes = await axios.get('/api/admin/stats', config);
      // Usar endpoint de mis eventos para el dashboard
      const eventosRes = await axios.get('/api/mis-eventos', config);
      setStats(statsRes.data);
      if (Array.isArray(eventosRes.data)) {
        setEventos(eventosRes.data);
      } else {
        console.error('Eventos response is not an array:', eventosRes.data);
        setEventos([]);
      }
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateEvent = async () => {
    try {
      await axios.post('/api/eventos', newEvent, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toaster.success({ title: 'Evento creado' });
      setIsOpen(false);
      fetchData();
      setNewEvent({ titulo: '', descripcion: '', fecha: '', lugar: '', imagen_url: '' });
    } catch {
      toaster.error({ title: 'Error al crear evento' });
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este evento?')) return;
    try {
      await axios.delete(`/api/eventos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toaster.success({ title: 'Evento eliminado' });
      fetchData();
    } catch {
      toaster.error({ title: 'Error al eliminar' });
    }
  };

  const handleValidate = async () => {
    if (!qrCode) return;
    setValidating(true);
    setValidationResult(null);
    try {
      const res = await axios.post('/api/validar-qr', { codigo_qr: qrCode });
      setValidationResult({ success: true, message: res.data.mensaje, ticket: res.data.ticket });
      toaster.success({ title: 'Ticket Válido' });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string; ticket?: ValidationResult['ticket'] } } };
      setValidationResult({ 
        success: false, 
        message: axiosError.response?.data?.error || 'Error al validar',
        ticket: axiosError.response?.data?.ticket 
      });
      toaster.error({ title: 'Ticket Inválido' });
    } finally {
      setValidating(false);
    }
  };

  return (
    <Container maxW="1200px" py={10}>
      <Heading mb={6} color="white">Panel de Administración</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={10}>
        <Box bg={bg} p={5} borderRadius="lg" shadow="md" color={color}>
          <StatRoot>
            <StatLabel>Total Tickets Vendidos</StatLabel>
            <StatValueText>{stats?.tickets?.total_tickets || 0}</StatValueText>
            <StatHelpText>Global</StatHelpText>
          </StatRoot>
        </Box>
        <Box bg={bg} p={5} borderRadius="lg" shadow="md" color={color}>
          <StatRoot>
            <StatLabel>Ingresos Totales</StatLabel>
            <StatValueText>${stats?.tickets?.total_ingresos || 0}</StatValueText>
            <StatHelpText>Estimado</StatHelpText>
          </StatRoot>
        </Box>
        <Box bg={bg} p={5} borderRadius="lg" shadow="md" color={color}>
          <StatRoot>
            <StatLabel>Eventos Activos</StatLabel>
            <StatValueText>{stats?.eventos || 0}</StatValueText>
          </StatRoot>
        </Box>
      </SimpleGrid>

      <Box bg={bg} p={6} borderRadius="xl" shadow="lg" color={color}>
        <Tabs.Root variant="enclosed" colorPalette="purple" defaultValue="eventos">
          <Tabs.List mb={4}>
            <Tabs.Trigger value="eventos">Eventos</Tabs.Trigger>
            <Tabs.Trigger value="validacion">Validación (Próximamente)</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="eventos">
            <Box display="flex" justifyContent="space-between" mb={4}>
              <Heading size="md">Gestión de Eventos</Heading>
              <Button colorPalette="purple" onClick={() => setIsOpen(true)}>
                <LuPlus />
                Nuevo Evento
              </Button>
            </Box>
            
            <Table.Root variant="outline">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>ID</Table.ColumnHeader>
                  <Table.ColumnHeader>Título</Table.ColumnHeader>
                  <Table.ColumnHeader>Fecha</Table.ColumnHeader>
                  <Table.ColumnHeader>Lugar</Table.ColumnHeader>
                  <Table.ColumnHeader>Acciones</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {eventos.map(evento => (
                  <Table.Row key={evento.id}>
                    <Table.Cell>{evento.id}</Table.Cell>
                    <Table.Cell fontWeight="bold">{evento.titulo}</Table.Cell>
                    <Table.Cell>{new Date(evento.fecha).toLocaleDateString()}</Table.Cell>
                    <Table.Cell>{evento.lugar}</Table.Cell>
                    <Table.Cell>
                      {user?.rol === 'admin' && (
                        <IconButton 
                          aria-label="Eliminar" 
                          colorPalette="red" 
                          size="sm"
                          onClick={() => handleDeleteEvent(evento.id)}
                        >
                          <LuTrash />
                        </IconButton>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Tabs.Content>
          <Tabs.Content value="validacion">
            <Box maxW="md" mx="auto" textAlign="center" py={10}>
              <Heading size="md" mb={6}>Validar Entrada</Heading>
              <Stack gap={4}>
                <Field label="Código del Ticket (QR)">
                  <Input 
                    placeholder="Escanea o escribe el código UUID" 
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    size="lg"
                    textAlign="center"
                  />
                </Field>
                <Button 
                  colorPalette="green" 
                  size="lg" 
                  onClick={handleValidate}
                  loading={validating}
                >
                  Validar Acceso
                </Button>
              </Stack>
              
              {validationResult && (
                <Box 
                  mt={8} 
                  p={6} 
                  bg={validationResult.success ? 'green.100' : 'red.100'} 
                  borderRadius="xl"
                  border="2px solid"
                  borderColor={validationResult.success ? 'green.500' : 'red.500'}
                >
                  <Heading size="lg" color={validationResult.success ? 'green.700' : 'red.700'}>
                    {validationResult.success ? '✅ ACCESO PERMITIDO' : '⛔ ACCESO DENEGADO'}
                  </Heading>
                  <Box mt={2} fontSize="lg" fontWeight="bold">
                    {validationResult.message}
                  </Box>
                  {validationResult.ticket && (
                    <Box mt={4} textAlign="left" bg="white" p={4} borderRadius="md">
                      <Box><strong>Ticket ID:</strong> {validationResult.ticket.id}</Box>
                      <Box><strong>Tipo:</strong> {validationResult.ticket.tipo_entrada_id}</Box>
                      <Box><strong>Comprador ID:</strong> {validationResult.ticket.cliente_id}</Box>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </Box>

      {/* Dialog Crear Evento */}
      <DialogRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} size="xl">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Evento</DialogTitle>
          </DialogHeader>
          <DialogCloseTrigger />
          <DialogBody pb={6}>
            <Stack gap={4}>
              <Field label="Título">
                <Input value={newEvent.titulo} onChange={e => setNewEvent({...newEvent, titulo: e.target.value})} />
              </Field>
              <Field label="Descripción">
                <Textarea value={newEvent.descripcion} onChange={e => setNewEvent({...newEvent, descripcion: e.target.value})} />
              </Field>
              <Field label="Fecha y Hora">
                <Input type="datetime-local" value={newEvent.fecha} onChange={e => setNewEvent({...newEvent, fecha: e.target.value})} />
              </Field>
              <Field label="Lugar">
                <Input value={newEvent.lugar} onChange={e => setNewEvent({...newEvent, lugar: e.target.value})} />
              </Field>
              <Field label="URL Imagen">
                <Input value={newEvent.imagen_url} onChange={e => setNewEvent({...newEvent, imagen_url: e.target.value})} />
              </Field>
              <Button colorPalette="purple" onClick={handleCreateEvent}>Guardar Evento</Button>
            </Stack>
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </Container>
  );
};

export default AdminDashboard;
