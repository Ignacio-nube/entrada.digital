import { useLocation, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Heading, Text, Button, SimpleGrid, Flex, VStack, Card } from '@chakra-ui/react';
import { Alert } from '@/components/ui/alert';
import QRCode from 'react-qr-code';

interface TicketData {
  codigo_qr: string;
}

interface CompraData {
  cliente: {
    nombre: string;
    email: string;
  };
  tickets: TicketData[];
}

const ExitoCompra = () => {
  const location = useLocation();
  const datos = location.state?.datos as CompraData | undefined;

  if (!datos) {
    return (
      <Container py={20}>
        <VStack gap={6}>
          <Alert 
            status="error" 
            title="¡Ups! Algo salió mal"
            variant="subtle"
          >
            No encontramos información de tu compra reciente.
          </Alert>
          <Button asChild colorPalette="purple" size="lg">
            <RouterLink to="/">Volver al Inicio</RouterLink>
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Box minH="calc(100vh - 72px)" py={12} bg="bg.subtle">
      <Container maxW="900px">
        <VStack gap={8} align="stretch">
          
          {/* Mensaje de Éxito */}
          <Card.Root variant="elevated">
            <Card.Body textAlign="center" p={8}>
              <Heading color="purple.fg" mb={4} size="3xl">🎉 ¡Compra Exitosa!</Heading>
              <Text fontSize="xl">
                Gracias por tu compra, <strong>{datos.cliente.nombre}</strong>.
              </Text>
              <Text fontSize="md" color="fg.muted" mt={2}>
                Hemos enviado un respaldo a <strong>{datos.cliente.email}</strong>.
              </Text>
            </Card.Body>
          </Card.Root>

          <Heading size="xl" textAlign="center">Tus Entradas</Heading>
          
          {/* Grid de Tickets */}
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
            {datos.tickets.map((ticket, index) => (
              <Card.Root 
                key={index} 
                variant="elevated"
                textAlign="center"
                _hover={{ transform: 'translateY(-5px)' }}
                transition="transform 0.2s"
              >
                <Card.Body p={6}>
                  <Box
                    borderTopWidth="4px"
                    borderColor="purple.solid"
                    pt={4}
                    mb={4}
                    mx={-6}
                    mt={-6}
                  />
                  <Text 
                    mb={6} 
                    fontWeight="bold" 
                    fontSize="lg" 
                    color="purple.fg" 
                    textTransform="uppercase" 
                    letterSpacing="wider"
                  >
                    Ticket #{index + 1}
                  </Text>
                  
                  <Flex justify="center" bg="white" p={4} borderRadius="lg" borderWidth="1px" borderStyle="dashed" borderColor="purple.muted">
                    <QRCode value={ticket.codigo_qr} size={180} />
                  </Flex>
                  
                  <Text mt={6} fontSize="sm" color="fg.muted" fontFamily="mono">
                    ID: {ticket.codigo_qr}
                  </Text>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>

          <Flex justify="center" pt={8}>
            <Button 
              asChild
              colorPalette="purple" 
              size="lg"
            >
              <RouterLink to="/">Volver al Inicio</RouterLink>
            </Button>
          </Flex>

        </VStack>
      </Container>
    </Box>
  );
};

export default ExitoCompra;
