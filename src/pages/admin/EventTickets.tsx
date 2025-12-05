import { useEffect, useState, useCallback } from 'react';
import {
  Box, Heading, Table, Badge, Spinner, Center, Input, Flex, SimpleGrid, Card, Text
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatRoot, StatLabel, StatValueText } from '../../components/ui/stat';
import { NativeSelectRoot, NativeSelectField } from '../../components/ui/native-select';

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

  const fetchTickets = useCallback(async () => {
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
  }, [id, token]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

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

      <SimpleGrid columns={{ base: 1, md: 4 }} gap={4} mb={8}>
        <Card.Root bg={{ _light: "white", _dark: "gray.800" }} borderColor={{ _light: "gray.200", _dark: "gray.700" }}>
          <Card.Body>
            <StatRoot>
              <StatLabel color={{ _light: "gray.600", _dark: "gray.400" }}>Total Vendidas</StatLabel>
              <StatValueText>{stats.total}</StatValueText>
            </StatRoot>
          </Card.Body>
        </Card.Root>
        <Card.Root bg={{ _light: "white", _dark: "gray.800" }} borderColor={{ _light: "gray.200", _dark: "gray.700" }}>
          <Card.Body>
            <StatRoot>
              <StatLabel color={{ _light: "gray.600", _dark: "gray.400" }}>Validada (Ingresaron)</StatLabel>
              <StatValueText color="green.500">{stats.used}</StatValueText>
            </StatRoot>
          </Card.Body>
        </Card.Root>
        <Card.Root bg={{ _light: "white", _dark: "gray.800" }} borderColor={{ _light: "gray.200", _dark: "gray.700" }}>
          <Card.Body>
            <StatRoot>
              <StatLabel color={{ _light: "gray.600", _dark: "gray.400" }}>Pendientes</StatLabel>
              <StatValueText color="orange.500">{stats.pending}</StatValueText>
            </StatRoot>
          </Card.Body>
        </Card.Root>
        <Card.Root bg={{ _light: "white", _dark: "gray.800" }} borderColor={{ _light: "gray.200", _dark: "gray.700" }}>
          <Card.Body>
            <StatRoot>
              <StatLabel color={{ _light: "gray.600", _dark: "gray.400" }}>Recaudación</StatLabel>
              <StatValueText>${stats.revenue.toLocaleString()}</StatValueText>
            </StatRoot>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      <Flex gap={4} mb={4} direction={{ base: 'column', md: 'row' }}>
        <Input 
          placeholder="Buscar por nombre, email o QR..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <NativeSelectRoot w={{ base: 'full', md: '200px' }}>
          <NativeSelectField value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Todas</option>
            <option value="used">Ingresaron</option>
            <option value="pending">Pendientes</option>
          </NativeSelectField>
        </NativeSelectRoot>
      </Flex>

      <Box overflowX="auto" borderWidth="1px" borderRadius="lg" borderColor={{ _light: "gray.200", _dark: "gray.700" }}>
        <Table.Root variant="outline">
          <Table.Header>
            <Table.Row bg={{ _light: "gray.100", _dark: "gray.800" }}>
              <Table.ColumnHeader color={{ _light: "gray.700", _dark: "gray.200" }}>Cliente</Table.ColumnHeader>
              <Table.ColumnHeader color={{ _light: "gray.700", _dark: "gray.200" }}>Tipo Entrada</Table.ColumnHeader>
              <Table.ColumnHeader color={{ _light: "gray.700", _dark: "gray.200" }}>Estado</Table.ColumnHeader>
              <Table.ColumnHeader color={{ _light: "gray.700", _dark: "gray.200" }}>QR (ID)</Table.ColumnHeader>
              <Table.ColumnHeader color={{ _light: "gray.700", _dark: "gray.200" }}>Pago</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredTickets.map((ticket) => (
              <Table.Row key={ticket.id}>
                <Table.Cell>
                  <Text fontWeight="bold">{ticket.cliente_nombre}</Text>
                  <Text fontSize="sm" color={{ _light: "gray.600", _dark: "gray.400" }}>{ticket.cliente_email}</Text>
                </Table.Cell>
                <Table.Cell>{ticket.tipo_entrada} (${ticket.precio})</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={ticket.usado ? 'green' : 'orange'}>
                    {ticket.usado ? 'INGRESÓ' : 'PENDIENTE'}
                  </Badge>
                </Table.Cell>
                <Table.Cell fontSize="xs" fontFamily="monospace">{ticket.codigo_qr.substring(0, 8)}...</Table.Cell>
                <Table.Cell>{ticket.metodo_pago}</Table.Cell>
              </Table.Row>
            ))}
            {filteredTickets.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={5} textAlign="center" py={4}>No se encontraron entradas</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  );
}
