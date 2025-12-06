import { useEffect, useState, useCallback } from 'react';
import { Box, SimpleGrid, Heading, Text, VStack, HStack, Spinner, Center } from '@chakra-ui/react';
import { LuCalendar, LuTicket, LuDollarSign, LuTrendingUp } from 'react-icons/lu';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

interface Stats {
  eventos: number;
  tickets: {
    total_tickets: number;
    tickets_usados: number;
    total_ingresos: number;
  };
}

// Glass card style
const glassCard = {
  bg: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '2xl',
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
  delay: number;
}

const StatCard = ({ icon: Icon, label, value, subtext, color, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
  >
    <Box {...glassCard} p={5} _hover={{ bg: 'rgba(255, 255, 255, 0.08)' }} transition="all 0.2s">
      <HStack justify="space-between" mb={3}>
        <Box
          p={2}
          borderRadius="lg"
          bg={`${color}20`}
        >
          <Icon size={20} color={color} />
        </Box>
        <LuTrendingUp size={16} color="#4ade80" />
      </HStack>
      <Text fontSize="2xl" fontWeight="700" color="white" fontFamily="'Poppins', sans-serif">
        {value}
      </Text>
      <Text fontSize="sm" color="whiteAlpha.600" fontFamily="'Poppins', sans-serif">
        {label}
      </Text>
      {subtext && (
        <Text fontSize="xs" color="whiteAlpha.500" mt={1}>
          {subtext}
        </Text>
      )}
    </Box>
  </motion.div>
);

export default function DashboardHome() {
  const [stats, setStats] = useState<Stats>({ 
    eventos: 0, 
    tickets: { total_tickets: 0, tickets_usados: 0, total_ingresos: 0 } 
  });
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === 'object') {
          setStats(data);
        }
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

  if (loading) {
    return (
      <Center h="50vh">
        <VStack gap={4}>
          <Spinner size="xl" color="#ff6b6b" />
          <Text color="whiteAlpha.600">Cargando datos...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box>
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <VStack align="start" mb={6} gap={1}>
          <Text fontSize="sm" color="whiteAlpha.600" fontFamily="'Poppins', sans-serif">
            Bienvenido de vuelta
          </Text>
          <Heading 
            size="xl" 
            color="white" 
            fontFamily="'Poppins', sans-serif"
            fontWeight="700"
          >
            {user?.nombre || 'Admin'} 👋
          </Heading>
        </VStack>
      </motion.div>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
        <StatCard
          icon={LuCalendar}
          label="Eventos Activos"
          value={stats.eventos}
          color="#ff6b6b"
          delay={0.1}
        />
        <StatCard
          icon={LuTicket}
          label="Entradas Vendidas"
          value={stats.tickets?.total_tickets || 0}
          subtext={`${stats.tickets?.tickets_usados || 0} validadas`}
          color="#4ade80"
          delay={0.2}
        />
        <StatCard
          icon={LuDollarSign}
          label="Ingresos"
          value={`$${(stats.tickets?.total_ingresos || 0).toLocaleString()}`}
          color="#ffab40"
          delay={0.3}
        />
        <StatCard
          icon={LuTrendingUp}
          label="Tasa Asistencia"
          value={stats.tickets?.total_tickets 
            ? `${Math.round((stats.tickets.tickets_usados / stats.tickets.total_tickets) * 100)}%`
            : '0%'
          }
          color="#60a5fa"
          delay={0.4}
        />
      </SimpleGrid>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <Box {...glassCard} p={5} mt={6}>
          <Text fontSize="sm" fontWeight="600" color="whiteAlpha.800" mb={3}>
            Acciones Rápidas
          </Text>
          <Text fontSize="xs" color="whiteAlpha.500">
            Usa el menú inferior para navegar entre secciones
          </Text>
        </Box>
      </motion.div>
    </Box>
  );
}
