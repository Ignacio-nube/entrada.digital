import { useEffect, useState } from 'react';
import { Box, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Card, CardBody, Heading, Spinner, Center } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardHome() {
  const [stats, setStats] = useState({ eventos: 0, tickets: { total_tickets: 0, tickets_usados: 0, total_ingresos: 0 } });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) return <Center h="200px"><Spinner /></Center>;

  return (
    <Box>
      <Heading mb={6}>Resumen</Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Eventos Activos</StatLabel>
              <StatNumber>{stats.eventos}</StatNumber>
              <StatHelpText>Total registrados</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Entradas Vendidas</StatLabel>
              <StatNumber>{stats.tickets?.total_tickets || 0}</StatNumber>
              <StatHelpText>{stats.tickets?.tickets_usados || 0} usadas</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Ingresos Totales</StatLabel>
              <StatNumber>${stats.tickets?.total_ingresos || 0}</StatNumber>
              <StatHelpText>Acumulado</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
