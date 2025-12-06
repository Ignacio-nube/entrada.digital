import { useLocation, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Heading, Text, Button, SimpleGrid, Flex, VStack } from '@chakra-ui/react';
import { Alert } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { LuCircleCheck, LuMail, LuHouse } from 'react-icons/lu';
import QRCode from 'react-qr-code';
import { getOptimizedUrl } from '@/components/OptimizedImage';

interface TicketData {
  codigo_qr: string;
}

interface CompraData {
  cliente: {
    nombre: string;
    email: string;
  };
  evento?: {
    titulo: string;
    imagen_url: string;
    fecha: string;
    lugar: string;
  };
  tickets: TicketData[];
}

const ExitoCompra = () => {
  const location = useLocation();
  const datos = location.state?.datos as CompraData | undefined;

  if (!datos) {
    return (
      <Box 
        minH="100vh" 
        bg="black"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Container py={20}>
          <VStack gap={6}>
            <Alert 
              status="error" 
              title="¡Ups! Algo salió mal"
              variant="subtle"
            >
              No encontramos información de tu compra reciente.
            </Alert>
            <Button 
              asChild 
              size="lg"
              bg="linear-gradient(135deg, #ff6b6b 0%, #ff8a80 50%, #ffab40 100%)"
              color="white"
              _hover={{ boxShadow: '0 10px 30px rgba(255, 107, 107, 0.4)' }}
            >
              <RouterLink to="/">Volver al Inicio</RouterLink>
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  // Default background if no event image
  const backgroundImage = datos.evento?.imagen_url 
    ? getOptimizedUrl(datos.evento.imagen_url, 1920, 1080, 'auto:eco')
    : 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920';

  return (
    <Box minH="100vh" position="relative" overflow="hidden">
      {/* Background Image */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundImage={`url('${backgroundImage}')`}
        backgroundSize="cover"
        backgroundPosition="center"
        filter="blur(8px)"
        transform="scale(1.1)"
        zIndex={0}
      />
      
      {/* Dark Overlay */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(0, 0, 0, 0.75)"
        zIndex={1}
      />

      {/* Content */}
      <Box position="relative" zIndex={2} py={12} pt={{ base: 24, md: 12 }}>
        <Container maxW="900px">
          <VStack gap={8} align="stretch">
            
            {/* Success Message Card */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box
                bg="rgba(255, 255, 255, 0.1)"
                backdropFilter="blur(20px)"
                border="1px solid rgba(255, 255, 255, 0.2)"
                borderRadius="2xl"
                textAlign="center"
                p={8}
                position="relative"
                overflow="hidden"
              >
                {/* Success gradient line */}
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  h="4px"
                  bg="linear-gradient(90deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)"
                />
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <Box 
                    display="inline-flex"
                    p={4}
                    borderRadius="full"
                    bg="rgba(74, 222, 128, 0.2)"
                    mb={4}
                  >
                    <LuCircleCheck size={48} color="#4ade80" />
                  </Box>
                </motion.div>

                <Heading 
                  color="white" 
                  mb={4} 
                  size={{ base: "2xl", md: "3xl" }}
                  fontFamily="'Poppins', sans-serif"
                  fontWeight="700"
                >
                  ¡Compra Exitosa!
                </Heading>
                <Text fontSize="xl" color="white" fontFamily="'Poppins', sans-serif">
                  Gracias por tu compra, <Text as="span" fontWeight="700" color="#ff6b6b">{datos.cliente.nombre}</Text>
                </Text>
                <Flex 
                  align="center" 
                  justify="center" 
                  gap={2} 
                  mt={3}
                  color="whiteAlpha.700"
                >
                  <LuMail size={18} />
                  <Text fontSize="md" fontFamily="'Poppins', sans-serif">
                    Respaldo enviado a <Text as="span" fontWeight="600">{datos.cliente.email}</Text>
                  </Text>
                </Flex>

                {/* Event info if available */}
                {datos.evento && (
                  <Box 
                    mt={6} 
                    p={4} 
                    bg="rgba(255, 107, 107, 0.1)" 
                    borderRadius="xl"
                    border="1px solid rgba(255, 107, 107, 0.2)"
                  >
                    <Text color="whiteAlpha.800" fontFamily="'Poppins', sans-serif" fontSize="sm">
                      Evento: <Text as="span" fontWeight="600" color="white">{datos.evento.titulo}</Text>
                    </Text>
                  </Box>
                )}
              </Box>
            </motion.div>

            {/* Tickets Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Heading 
                size="xl" 
                textAlign="center" 
                color="white"
                fontFamily="'Poppins', sans-serif"
              >
                Tus Entradas
              </Heading>
            </motion.div>
            
            {/* Tickets Grid */}
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
              {datos.tickets.map((ticket, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -5 }}
                >
                  <Box
                    bg="rgba(255, 255, 255, 0.1)"
                    backdropFilter="blur(20px)"
                    border="1px solid rgba(255, 255, 255, 0.2)"
                    borderRadius="2xl"
                    textAlign="center"
                    overflow="hidden"
                    transition="all 0.3s"
                    _hover={{
                      boxShadow: '0 20px 40px rgba(255, 107, 107, 0.2)',
                      borderColor: 'rgba(255, 107, 107, 0.4)',
                    }}
                  >
                    {/* Ticket header */}
                    <Box
                      bg="linear-gradient(135deg, rgba(255, 107, 107, 0.3) 0%, rgba(255, 138, 128, 0.2) 100%)"
                      py={3}
                      borderBottom="1px solid rgba(255, 255, 255, 0.1)"
                    >
                      <Text 
                        fontWeight="700" 
                        fontSize="lg" 
                        color="white" 
                        textTransform="uppercase" 
                        letterSpacing="wider"
                        fontFamily="'Poppins', sans-serif"
                      >
                        Ticket #{index + 1}
                      </Text>
                    </Box>

                    <Box p={6}>
                      {/* QR Code Container */}
                      <Flex 
                        justify="center" 
                        bg="white" 
                        p={4} 
                        borderRadius="xl" 
                        border="2px dashed"
                        borderColor="rgba(255, 107, 107, 0.3)"
                        mx="auto"
                        maxW="220px"
                      >
                        <QRCode value={ticket.codigo_qr} size={180} />
                      </Flex>
                      
                      <Text 
                        mt={5} 
                        fontSize="xs" 
                        color="whiteAlpha.600" 
                        fontFamily="monospace"
                        wordBreak="break-all"
                      >
                        ID: {ticket.codigo_qr}
                      </Text>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </SimpleGrid>

            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Flex justify="center" pt={4}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    asChild
                    size="lg"
                    bg="linear-gradient(135deg, #ff6b6b 0%, #ff8a80 50%, #ffab40 100%)"
                    color="white"
                    fontFamily="'Poppins', sans-serif"
                    fontWeight="600"
                    borderRadius="xl"
                    px={8}
                    _hover={{
                      boxShadow: '0 10px 30px rgba(255, 107, 107, 0.4)',
                    }}
                  >
                    <RouterLink to="/">
                      <LuHouse />
                      Volver al Inicio
                    </RouterLink>
                  </Button>
                </motion.div>
              </Flex>
            </motion.div>

          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default ExitoCompra;
