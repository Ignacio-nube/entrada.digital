import { useEffect, useState, useCallback } from 'react';
import {
  Box, Heading, Table, Badge, Spinner, Center, Input, Flex, SimpleGrid, Text, IconButton, VStack
} from '@chakra-ui/react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { LuArrowLeft, LuSearch, LuTicket, LuCircleCheck, LuClock, LuDollarSign } from 'react-icons/lu';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { NativeSelectRoot, NativeSelectField } from '../../components/ui/native-select';

interface Ticket {
  id: number;
  codigo_qr: string;
  usado: number;
  metodo_pago: string;
  tipo_entrada: string;
  precio: string;
  cliente_nombre: string;
  cliente_email: string;
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

export default function EventTickets() {
  const { id } = useParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
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

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="#ff6b6b" />
      </Center>
    );
  }

  return (
    <Box>
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
            Gestión de Entradas
          </Heading>
        </Flex>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={3} mb={6}>
          <Box {...glassCard} p={4}>
            <Flex align="center" gap={2} mb={2}>
              <LuTicket size={16} color="#ff6b6b" />
              <Text fontSize="xs" color="whiteAlpha.600">Vendidas</Text>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color="white">{stats.total}</Text>
          </Box>
          <Box {...glassCard} p={4}>
            <Flex align="center" gap={2} mb={2}>
              <LuCircleCheck size={16} color="#22c55e" />
              <Text fontSize="xs" color="whiteAlpha.600">Ingresaron</Text>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color="#22c55e">{stats.used}</Text>
          </Box>
          <Box {...glassCard} p={4}>
            <Flex align="center" gap={2} mb={2}>
              <LuClock size={16} color="#f59e0b" />
              <Text fontSize="xs" color="whiteAlpha.600">Pendientes</Text>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color="#f59e0b">{stats.pending}</Text>
          </Box>
          <Box {...glassCard} p={4}>
            <Flex align="center" gap={2} mb={2}>
              <LuDollarSign size={16} color="#ff6b6b" />
              <Text fontSize="xs" color="whiteAlpha.600">Recaudación</Text>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color="white">${stats.revenue.toLocaleString()}</Text>
          </Box>
        </SimpleGrid>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Flex gap={3} mb={4} direction={{ base: 'column', md: 'row' }}>
          <Box position="relative" flex={1}>
            <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" zIndex={1}>
              <LuSearch size={16} color="rgba(255,255,255,0.4)" />
            </Box>
            <Input 
              placeholder="Buscar por nombre, email o QR..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              pl={10}
              {...inputStyle}
            />
          </Box>
          <NativeSelectRoot w={{ base: 'full', md: '180px' }}>
            <NativeSelectField 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                borderRadius: '12px',
              }}
            >
              <option value="all" style={{ background: '#1a1a2e' }}>Todas</option>
              <option value="used" style={{ background: '#1a1a2e' }}>Ingresaron</option>
              <option value="pending" style={{ background: '#1a1a2e' }}>Pendientes</option>
            </NativeSelectField>
          </NativeSelectRoot>
        </Flex>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Box {...glassCard} overflow="hidden">
          {/* Mobile view - Cards */}
          <Box display={{ base: 'block', md: 'none' }}>
            <VStack gap={0} align="stretch" divideY="1px" divideColor="whiteAlpha.100">
              {filteredTickets.map((ticket) => (
                <Box key={ticket.id} p={4}>
                  <Flex justify="space-between" align="start" mb={2}>
                    <Box>
                      <Text fontWeight="600" color="white" fontSize="sm">{ticket.cliente_nombre}</Text>
                      <Text fontSize="xs" color="whiteAlpha.500">{ticket.cliente_email}</Text>
                    </Box>
                    <Badge 
                      px={2} 
                      py={1} 
                      borderRadius="full"
                      fontSize="xs"
                      bg={ticket.usado ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)'}
                      color={ticket.usado ? '#22c55e' : '#f59e0b'}
                    >
                      {ticket.usado ? 'INGRESÓ' : 'PENDIENTE'}
                    </Badge>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="xs" color="#ff6b6b">{ticket.tipo_entrada} - ${ticket.precio}</Text>
                    <Text fontSize="xs" color="whiteAlpha.400">{ticket.metodo_pago}</Text>
                  </Flex>
                </Box>
              ))}
              {filteredTickets.length === 0 && (
                <Box p={8} textAlign="center">
                  <Text color="whiteAlpha.500">No se encontraron entradas</Text>
                </Box>
              )}
            </VStack>
          </Box>

          {/* Desktop view - Table */}
          <Box display={{ base: 'none', md: 'block' }} overflowX="auto">
            <Table.Root>
              <Table.Header>
                <Table.Row bg="rgba(255,255,255,0.03)">
                  <Table.ColumnHeader color="whiteAlpha.600" fontSize="xs" fontWeight="600">CLIENTE</Table.ColumnHeader>
                  <Table.ColumnHeader color="whiteAlpha.600" fontSize="xs" fontWeight="600">TIPO ENTRADA</Table.ColumnHeader>
                  <Table.ColumnHeader color="whiteAlpha.600" fontSize="xs" fontWeight="600">ESTADO</Table.ColumnHeader>
                  <Table.ColumnHeader color="whiteAlpha.600" fontSize="xs" fontWeight="600">QR (ID)</Table.ColumnHeader>
                  <Table.ColumnHeader color="whiteAlpha.600" fontSize="xs" fontWeight="600">PAGO</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredTickets.map((ticket) => (
                  <Table.Row key={ticket.id} _hover={{ bg: 'whiteAlpha.50' }}>
                    <Table.Cell borderColor="whiteAlpha.100">
                      <Text fontWeight="600" color="white" fontSize="sm">{ticket.cliente_nombre}</Text>
                      <Text fontSize="xs" color="whiteAlpha.500">{ticket.cliente_email}</Text>
                    </Table.Cell>
                    <Table.Cell color="whiteAlpha.800" borderColor="whiteAlpha.100">
                      {ticket.tipo_entrada} <Text as="span" color="#ff6b6b">(${ticket.precio})</Text>
                    </Table.Cell>
                    <Table.Cell borderColor="whiteAlpha.100">
                      <Badge 
                        px={2} 
                        py={1} 
                        borderRadius="full"
                        fontSize="xs"
                        bg={ticket.usado ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)'}
                        color={ticket.usado ? '#22c55e' : '#f59e0b'}
                      >
                        {ticket.usado ? 'INGRESÓ' : 'PENDIENTE'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell fontSize="xs" fontFamily="mono" color="whiteAlpha.500" borderColor="whiteAlpha.100">
                      {ticket.codigo_qr.substring(0, 8)}...
                    </Table.Cell>
                    <Table.Cell color="whiteAlpha.600" fontSize="sm" borderColor="whiteAlpha.100">
                      {ticket.metodo_pago}
                    </Table.Cell>
                  </Table.Row>
                ))}
                {filteredTickets.length === 0 && (
                  <Table.Row>
                    <Table.Cell colSpan={5} textAlign="center" py={8} borderColor="whiteAlpha.100">
                      <Text color="whiteAlpha.500">No se encontraron entradas</Text>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Root>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}
