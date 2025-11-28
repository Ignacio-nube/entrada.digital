import { useLocation, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Heading, Text, Button, SimpleGrid, Flex, VStack, Alert, AlertIcon, AlertTitle, AlertDescription, useColorModeValue } from '@chakra-ui/react';
import QRCode from 'react-qr-code';

const ExitoCompra = () => {
  const location = useLocation();
  const datos = location.state?.datos;

  // Dynamic Colors
  const successBoxBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');
  const ticketBoxBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('purple.600', 'purple.300');
  const ticketIdColor = useColorModeValue('gray.500', 'gray.400');
  const ticketTitleColor = useColorModeValue('purple.800', 'purple.200');
  const alertBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)');

  if (!datos) {
    return (
      <Container centerContent py={20}>
        <Alert 
          status="error" 
          variant="subtle" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          textAlign="center" 
          height="200px" 
          borderRadius="xl"
          bg={alertBg}
          backdropFilter="blur(10px)"
          shadow="xl"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            ¡Ups! Algo salió mal
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            No encontramos información de tu compra reciente.
          </AlertDescription>
        </Alert>
        <Button as={RouterLink} to="/" mt={8} colorScheme="purple" size="lg" shadow="lg">
          Volver al Inicio
        </Button>
      </Container>
    );
  }

  return (
    <Box minH="calc(100vh - 72px)" py={12}>
      <Container maxW="900px">
        <VStack spacing={8} align="stretch">
          
          {/* Mensaje de Éxito */}
          <Box 
            textAlign="center" 
            bg={successBoxBg} 
            backdropFilter="blur(12px)" 
            p={8} 
            borderRadius="xl" 
            shadow="2xl"
            border="1px solid"
            borderColor="whiteAlpha.400"
          >
            <Heading color={headingColor} mb={4} size="2xl">🎉 ¡Compra Exitosa!</Heading>
            <Text fontSize="xl" color={textColor}>
              Gracias por tu compra, <strong>{datos.cliente.nombre}</strong>.
            </Text>
            <Text fontSize="md" color={subTextColor} mt={2}>
              Hemos enviado un respaldo a <strong>{datos.cliente.email}</strong>.
            </Text>
          </Box>

          <Heading size="lg" textAlign="center" color="white" textShadow="0px 2px 4px rgba(0,0,0,0.3)">Tus Entradas</Heading>
          
          {/* Grid de Tickets */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            {datos.tickets.map((ticket: any, index: number) => (
              <Box 
                key={index} 
                bg={ticketBoxBg} 
                backdropFilter="blur(16px)"
                p={6} 
                borderRadius="xl" 
                shadow="xl" 
                borderTop="8px solid" 
                borderColor="purple.500"
                textAlign="center"
                transition="transform 0.2s"
                _hover={{ transform: 'translateY(-5px)' }}
              >
                <Text 
                  mb={6} 
                  fontWeight="bold" 
                  fontSize="lg" 
                  color={ticketTitleColor} 
                  textTransform="uppercase" 
                  letterSpacing="wider"
                >
                  Ticket #{index + 1}
                </Text>
                
                <Flex justify="center" bg="white" p={4} borderRadius="lg" border="1px dashed" borderColor="purple.200">
                  <QRCode value={ticket.codigo_qr} size={180} />
                </Flex>
                
                <Text mt={6} fontSize="sm" color={ticketIdColor} fontFamily="monospace">
                  ID: {ticket.codigo_qr}
                </Text>
              </Box>
            ))}
          </SimpleGrid>

          <Flex justify="center" pt={8}>
            <Button 
              as={RouterLink} 
              to="/" 
              colorScheme="purple" 
              size="lg" 
              px={10}
              shadow="xl"
              _hover={{ transform: 'scale(1.05)', shadow: '2xl' }}
            >
              Volver a Eventos
            </Button>
          </Flex>

        </VStack>
      </Container>
    </Box>
  );
};

export default ExitoCompra;
