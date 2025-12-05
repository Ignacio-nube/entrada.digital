import { useEffect, useState, useCallback } from 'react';
import { Box, SimpleGrid, Card, Heading, Text } from '@chakra-ui/react';
import { StatRoot, StatLabel, StatValueText, StatHelpText } from '@/components/ui/stat';
import { useAuth } from '../../context/AuthContext';

interface Stats {
  eventos: number;
  tickets: {
    total_tickets: number;
    tickets_usados: number;
    total_ingresos: number;
  };
}

export default function DashboardHome() {
  const [stats, setStats] = useState<Stats>({ eventos: 0, tickets: { total_tickets: 0, tickets_usados: 0, total_ingresos: 0 } });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === 'object') {
          setStats(data);
        } else {
          console.error('Invalid stats data:', data);
        }
      } else {
        console.error('Stats fetch failed:', response.status);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" h="200px">
      <Text>Cargando...</Text>
    </Box>
  );

  return (
    <Box>
      <Heading mb={6}>Resumen</Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
        <Card.Root bg={{ _light: "white", _dark: "gray.800" }} borderColor={{ _light: "gray.200", _dark: "gray.700" }}>
          <Card.Body>
            <StatRoot>
              <StatLabel color={{ _light: "gray.600", _dark: "gray.400" }}>Eventos Activos</StatLabel>
              <StatValueText>{stats.eventos}</StatValueText>
              <StatHelpText color={{ _light: "gray.500", _dark: "gray.500" }}>Total registrados</StatHelpText>
            </StatRoot>
          </Card.Body>
        </Card.Root>
        <Card.Root bg={{ _light: "white", _dark: "gray.800" }} borderColor={{ _light: "gray.200", _dark: "gray.700" }}>
          <Card.Body>
            <StatRoot>
              <StatLabel color={{ _light: "gray.600", _dark: "gray.400" }}>Entradas Vendidas</StatLabel>
              <StatValueText>{stats.tickets?.total_tickets || 0}</StatValueText>
              <StatHelpText color={{ _light: "gray.500", _dark: "gray.500" }}>{stats.tickets?.tickets_usados || 0} usadas</StatHelpText>
            </StatRoot>
          </Card.Body>
        </Card.Root>
        <Card.Root bg={{ _light: "white", _dark: "gray.800" }} borderColor={{ _light: "gray.200", _dark: "gray.700" }}>
          <Card.Body>
            <StatRoot>
              <StatLabel color={{ _light: "gray.600", _dark: "gray.400" }}>Ingresos Totales</StatLabel>
              <StatValueText>${stats.tickets?.total_ingresos || 0}</StatValueText>
              <StatHelpText color={{ _light: "gray.500", _dark: "gray.500" }}>Acumulado</StatHelpText>
            </StatRoot>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </Box>
  );
}
