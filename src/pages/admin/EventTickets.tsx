import { useEffect, useState } from 'react';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Badge,
  Spinner, Center, Input, Select, Flex, Stat, StatLabel, StatNumber,
  SimpleGrid, Card, CardBody, Text
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Ticket {
  id: number;
  codigo_qr: string;
  usado: number; // 0 or 1
  metodo_pago: string;
  tipo_entrada: string;
  precio: string;
  cliente_nombre: string;
  cliente_email: string;
}

export default function EventTickets() {
  const { id } = useParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, used, pending
  const [search, setSearch] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(`/api/eventos/${id}/tickets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setTickets(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [id, token]);

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.cliente_nombre.toLowerCase().includes(search.toLowerCase()) || 
                          t.cliente_email.toLowerCase().includes(search.toLowerCase()) ||
                          t.codigo_qr.includes(search);
    
    if (filter === 'used') return matchesSearch && t.usado === 1;
    if (filter === 'pending') return matchesSearch && t.usado === 0;
    return matchesSearch;
  });

  const stats = {
    total: tickets.length,
    used: tickets.filter(t => t.usado === 1).length,
    pending: tickets.filter(t => t.usado === 0).length,
    revenue: tickets.reduce((acc, t) => acc + parseFloat(t.precio), 0)
  };

  if (loading) return <Center h="50vh"><Spinner /></Center>;

  return (
    <Box>
      <Heading mb={6}>Gestión de Entradas</Heading>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Vendidas</StatLabel>
              <StatNumber>{stats.total}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Validada (Ingresaron)</StatLabel>
              <StatNumber color="green.500">{stats.used}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Pendientes</StatLabel>
              <StatNumber color="orange.500">{stats.pending}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Recaudación</StatLabel>
              <StatNumber>${stats.revenue.toLocaleString()}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Flex gap={4} mb={4} direction={{ base: 'column', md: 'row' }}>
        <Input 
          placeholder="Buscar por nombre, email o QR..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select w={{ base: 'full', md: '200px' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Todas</option>
          <option value="used">Ingresaron</option>
          <option value="pending">Pendientes</option>
        </Select>
      </Flex>

      <Box overflowX="auto" borderWidth="1px" borderRadius="lg">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Cliente</Th>
              <Th>Tipo Entrada</Th>
              <Th>Estado</Th>
              <Th>QR (ID)</Th>
              <Th>Pago</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredTickets.map((ticket) => (
              <Tr key={ticket.id}>
                <Td>
                  <Text fontWeight="bold">{ticket.cliente_nombre}</Text>
                  <Text fontSize="sm" color="gray.500">{ticket.cliente_email}</Text>
                </Td>
                <Td>{ticket.tipo_entrada} (${ticket.precio})</Td>
                <Td>
                  <Badge colorScheme={ticket.usado ? 'green' : 'orange'}>
                    {ticket.usado ? 'INGRESÓ' : 'PENDIENTE'}
                  </Badge>
                </Td>
                <Td fontSize="xs" fontFamily="monospace">{ticket.codigo_qr.substring(0, 8)}...</Td>
                <Td>{ticket.metodo_pago}</Td>
              </Tr>
            ))}
            {filteredTickets.length === 0 && (
              <Tr>
                <Td colSpan={5} textAlign="center" py={4}>No se encontraron entradas</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
