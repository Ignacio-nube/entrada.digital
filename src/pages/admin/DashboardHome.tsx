import { Box, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Card, CardBody, Heading } from '@chakra-ui/react';

export default function DashboardHome() {
  // En el futuro, estos datos vendrían de una API
  return (
    <Box>
      <Heading mb={6}>Resumen</Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Eventos Activos</StatLabel>
              <StatNumber>3</StatNumber>
              <StatHelpText>2 próximos</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Entradas Vendidas</StatLabel>
              <StatNumber>1,205</StatNumber>
              <StatHelpText>↗︎ 23% esta semana</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Ingresos Totales</StatLabel>
              <StatNumber>$45,000</StatNumber>
              <StatHelpText>Feb 2024</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
