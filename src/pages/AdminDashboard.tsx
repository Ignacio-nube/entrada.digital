import { useEffect, useState } from 'react';
import { 
  Box, Container, Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, 
  Tabs, TabList, TabPanels, Tab, TabPanel, Button, Table, Thead, Tbody, Tr, Th, Td, 
  useColorModeValue, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, 
  ModalHeader, ModalBody, ModalCloseButton, FormControl, FormLabel, Input, Textarea, 
  useToast, Stack 
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [eventos, setEventos] = useState<any[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Validation State
  const [qrCode, setQrCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

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

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const statsRes = await axios.get('http://localhost:3000/api/admin/stats', config);
      // Usar endpoint de mis eventos para el dashboard
      const eventosRes = await axios.get('http://localhost:3000/api/mis-eventos', config);
      setStats(statsRes.data);
      setEventos(eventosRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleCreateEvent = async () => {
    try {
      await axios.post('http://localhost:3000/api/eventos', newEvent, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Evento creado', status: 'success' });
      onClose();
      fetchData();
      setNewEvent({ titulo: '', descripcion: '', fecha: '', lugar: '', imagen_url: '' });
    } catch (error) {
      toast({ title: 'Error al crear evento', status: 'error' });
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este evento?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/eventos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Evento eliminado', status: 'success' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error al eliminar', status: 'error' });
    }
  };

  const handleValidate = async () => {
    if (!qrCode) return;
    setValidating(true);
    setValidationResult(null);
    try {
      const res = await axios.post('http://localhost:3000/api/validar-qr', { codigo_qr: qrCode });
      setValidationResult({ success: true, message: res.data.mensaje, ticket: res.data.ticket });
      toast({ title: 'Ticket Válido', status: 'success' });
    } catch (error: any) {
      setValidationResult({ 
        success: false, 
        message: error.response?.data?.error || 'Error al validar',
        ticket: error.response?.data?.ticket 
      });
      toast({ title: 'Ticket Inválido', status: 'error' });
    } finally {
      setValidating(false);
    }
  };

  return (
    <Container maxW="1200px" py={10}>
      <Heading mb={6} color="white">Panel de Administración</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
        <Stat bg={bg} p={5} borderRadius="lg" shadow="md" color={color}>
          <StatLabel>Total Tickets Vendidos</StatLabel>
          <StatNumber>{stats?.tickets?.total_tickets || 0}</StatNumber>
          <StatHelpText>Global</StatHelpText>
        </Stat>
        <Stat bg={bg} p={5} borderRadius="lg" shadow="md" color={color}>
          <StatLabel>Ingresos Totales</StatLabel>
          <StatNumber>${stats?.tickets?.total_ingresos || 0}</StatNumber>
          <StatHelpText>Estimado</StatHelpText>
        </Stat>
        <Stat bg={bg} p={5} borderRadius="lg" shadow="md" color={color}>
          <StatLabel>Eventos Activos</StatLabel>
          <StatNumber>{stats?.eventos || 0}</StatNumber>
        </Stat>
      </SimpleGrid>

      <Box bg={bg} p={6} borderRadius="xl" shadow="lg" color={color}>
        <Tabs variant="soft-rounded" colorScheme="purple">
          <TabList mb={4}>
            <Tab>Eventos</Tab>
            <Tab>Validación (Próximamente)</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Box display="flex" justifyContent="space-between" mb={4}>
                <Heading size="md">Gestión de Eventos</Heading>
                <Button leftIcon={<AddIcon />} colorScheme="purple" onClick={onOpen}>
                  Nuevo Evento
                </Button>
              </Box>
              
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Título</Th>
                    <Th>Fecha</Th>
                    <Th>Lugar</Th>
                    <Th>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {eventos.map(evento => (
                    <Tr key={evento.id}>
                      <Td>{evento.id}</Td>
                      <Td fontWeight="bold">{evento.titulo}</Td>
                      <Td>{new Date(evento.fecha).toLocaleDateString()}</Td>
                      <Td>{evento.lugar}</Td>
                      <Td>
                        {user?.rol === 'admin' && (
                          <IconButton 
                            aria-label="Eliminar" 
                            icon={<DeleteIcon />} 
                            colorScheme="red" 
                            size="sm"
                            onClick={() => handleDeleteEvent(evento.id)}
                          />
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TabPanel>
            <TabPanel>
              <Box maxW="md" mx="auto" textAlign="center" py={10}>
                <Heading size="md" mb={6}>Validar Entrada</Heading>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel>Código del Ticket (QR)</FormLabel>
                    <Input 
                      placeholder="Escanea o escribe el código UUID" 
                      value={qrCode}
                      onChange={(e) => setQrCode(e.target.value)}
                      size="lg"
                      textAlign="center"
                    />
                  </FormControl>
                  <Button 
                    colorScheme="green" 
                    size="lg" 
                    onClick={handleValidate}
                    isLoading={validating}
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
                    <Text mt={2} fontSize="lg" fontWeight="bold">
                      {validationResult.message}
                    </Text>
                    {validationResult.ticket && (
                      <Box mt={4} textAlign="left" bg="white" p={4} borderRadius="md">
                        <Text><strong>Ticket ID:</strong> {validationResult.ticket.id}</Text>
                        <Text><strong>Tipo:</strong> {validationResult.ticket.tipo_entrada_id}</Text>
                        <Text><strong>Comprador ID:</strong> {validationResult.ticket.cliente_id}</Text>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Modal Crear Evento */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Crear Nuevo Evento</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Título</FormLabel>
                <Input value={newEvent.titulo} onChange={e => setNewEvent({...newEvent, titulo: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Textarea value={newEvent.descripcion} onChange={e => setNewEvent({...newEvent, descripcion: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Fecha y Hora</FormLabel>
                <Input type="datetime-local" value={newEvent.fecha} onChange={e => setNewEvent({...newEvent, fecha: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Lugar</FormLabel>
                <Input value={newEvent.lugar} onChange={e => setNewEvent({...newEvent, lugar: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>URL Imagen</FormLabel>
                <Input value={newEvent.imagen_url} onChange={e => setNewEvent({...newEvent, imagen_url: e.target.value})} />
              </FormControl>
              <Button colorScheme="purple" onClick={handleCreateEvent}>Guardar Evento</Button>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
