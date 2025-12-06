import { useState, useEffect, useRef } from 'react';
import { 
  Box, Heading, VStack, Text, Center, Flex, IconButton, Badge
} from '@chakra-ui/react';
import { LuCamera, LuX, LuCheck, LuCircleCheck, LuCircleX } from 'react-icons/lu';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { toaster } from '@/components/ui/toaster';
import { Html5Qrcode } from 'html5-qrcode';

interface ValidationResult {
  success: boolean;
  data?: {
    id: number;
    evento: string;
    tipo_entrada: string;
    cliente_nombre: string;
    cliente_email: string;
    precio: number;
  };
  message?: string;
}

// Glass card style
const glassCard = {
  bg: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '2xl',
};

export default function Validator() {
  const [isScanning, setIsScanning] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const { token } = useAuth();
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      setValidationResult(null);
      setPendingCode(null);
      
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          html5QrCode.pause();
          setPendingCode(decodedText);
          setIsScanning(false);
        },
        () => {}
      );
      
      setIsScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      toaster.error({
        title: 'Error de cámara',
        description: 'No se pudo acceder a la cámara.',
      });
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
    setPendingCode(null);
  };

  const handleValidate = async (confirm: boolean) => {
    if (!pendingCode) return;

    if (!confirm) {
      setPendingCode(null);
      if (scannerRef.current) {
        scannerRef.current.resume();
        setIsScanning(true);
      }
      return;
    }

    try {
      const response = await fetch('/api/validar-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ codigo_qr: pendingCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setValidationResult({ success: true, data: data.ticket });
        toaster.success({
          title: '✅ Entrada Válida',
          description: 'El acceso ha sido registrado',
          duration: 2000,
        });
      } else {
        setValidationResult({ success: false, message: data.message || 'Entrada no válida' });
        toaster.error({
          title: '❌ Entrada Inválida',
          description: data.message,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error validating:', error);
      setValidationResult({ success: false, message: 'Error de conexión' });
      toaster.error({ title: 'Error de conexión', duration: 3000 });
    }

    setPendingCode(null);
    if (scannerRef.current) {
      await scannerRef.current.stop();
      scannerRef.current = null;
    }
  };

  const resetAndScan = () => {
    setValidationResult(null);
    setPendingCode(null);
    startScanner();
  };

  return (
    <Box maxW="500px" mx="auto" pb={8}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Heading mb={6} textAlign="center" size="lg" color="white" fontFamily="'Poppins', sans-serif">
          Validar Entradas
        </Heading>
      </motion.div>
      
      {/* Estado inicial - Botón para escanear */}
      {!isScanning && !pendingCode && !validationResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Center flexDirection="column" py={10}>
            <Box
              as="button"
              onClick={startScanner}
              w="160px"
              h="160px"
              borderRadius="full"
              bg="linear-gradient(135deg, #ff6b6b 0%, #ff8a80 50%, #ffab40 100%)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={6}
              boxShadow="0 10px 40px rgba(255, 107, 107, 0.4)"
              _hover={{ transform: 'scale(1.05)' }}
              _active={{ transform: 'scale(0.95)' }}
              transition="transform 0.2s"
            >
              <LuCamera size={60} color="white" />
            </Box>
            <Text fontSize="lg" color="white" textAlign="center" fontWeight="600">
              Toca para escanear
            </Text>
            <Text fontSize="sm" color="whiteAlpha.600" textAlign="center" mt={2}>
              Apunta la cámara al código QR de la entrada
            </Text>
          </Center>
        </motion.div>
      )}

      {/* Scanner activo */}
      {isScanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Box position="relative">
            <Box 
              id="qr-reader" 
              w="100%" 
              borderRadius="2xl" 
              overflow="hidden"
              border="3px solid #ff6b6b"
            />
            <IconButton
              aria-label="Cancelar"
              onClick={stopScanner}
              position="absolute"
              top={3}
              right={3}
              bg="rgba(239, 68, 68, 0.9)"
              color="white"
              size="lg"
              borderRadius="full"
              _hover={{ bg: 'rgba(239, 68, 68, 1)' }}
            >
              <LuX size={20} />
            </IconButton>
            <Text textAlign="center" mt={4} color="whiteAlpha.800">
              Buscando código QR...
            </Text>
          </Box>
        </motion.div>
      )}

      {/* QR Detectado - Confirmar */}
      {pendingCode && !validationResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box {...glassCard} p={6} mb={6}>
            <VStack gap={4}>
              <Badge 
                px={4} 
                py={2} 
                borderRadius="full"
                bg="rgba(255, 107, 107, 0.2)"
                color="#ff6b6b"
                fontSize="sm"
                fontWeight="600"
              >
                QR DETECTADO
              </Badge>
              
              <Text fontSize="xs" fontFamily="mono" color="whiteAlpha.500" textAlign="center">
                {pendingCode.substring(0, 20)}...
              </Text>

              <Text fontSize="lg" fontWeight="bold" textAlign="center" color="white">
                ¿Validar esta entrada?
              </Text>
              
              <Text fontSize="sm" color="whiteAlpha.500" textAlign="center">
                Al confirmar, la entrada quedará marcada como usada
              </Text>
            </VStack>
          </Box>

          {/* Botones estilo Tinder */}
          <Flex justify="center" gap={10}>
            <VStack gap={2}>
              <IconButton
                aria-label="Rechazar"
                onClick={() => handleValidate(false)}
                w="80px"
                h="80px"
                borderRadius="full"
                bg="rgba(239, 68, 68, 0.2)"
                color="#ef4444"
                border="2px solid rgba(239, 68, 68, 0.3)"
                _hover={{ bg: 'rgba(239, 68, 68, 0.3)', transform: 'scale(1.1)' }}
                _active={{ transform: 'scale(0.95)' }}
                transition="all 0.2s"
              >
                <LuX size={36} />
              </IconButton>
              <Text fontSize="sm" color="red.400" fontWeight="600">Cancelar</Text>
            </VStack>
            
            <VStack gap={2}>
              <IconButton
                aria-label="Aceptar"
                onClick={() => handleValidate(true)}
                w="80px"
                h="80px"
                borderRadius="full"
                bg="rgba(34, 197, 94, 0.2)"
                color="#22c55e"
                border="2px solid rgba(34, 197, 94, 0.3)"
                _hover={{ bg: 'rgba(34, 197, 94, 0.3)', transform: 'scale(1.1)' }}
                _active={{ transform: 'scale(0.95)' }}
                transition="all 0.2s"
              >
                <LuCheck size={36} />
              </IconButton>
              <Text fontSize="sm" color="green.400" fontWeight="600">Validar</Text>
            </VStack>
          </Flex>
        </motion.div>
      )}

      {/* Resultado de validación */}
      {validationResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Box 
            {...glassCard}
            p={6}
            mb={6}
            borderColor={validationResult.success ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}
            bg={validationResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
          >
            <Center flexDirection="column" py={4}>
              <Box
                mb={4}
                color={validationResult.success ? '#22c55e' : '#ef4444'}
              >
                {validationResult.success ? <LuCircleCheck size={64} /> : <LuCircleX size={64} />}
              </Box>
              
              <Heading 
                size="lg" 
                mb={4} 
                color={validationResult.success ? '#22c55e' : '#ef4444'}
                textAlign="center"
                fontFamily="'Poppins', sans-serif"
              >
                {validationResult.success ? '¡ACCESO PERMITIDO!' : 'ACCESO DENEGADO'}
              </Heading>
              
              {validationResult.success && validationResult.data ? (
                <VStack gap={3} w="100%">
                  <Badge 
                    px={4} 
                    py={2}
                    borderRadius="full"
                    bg="rgba(34, 197, 94, 0.2)"
                    color="#22c55e"
                    fontSize="sm"
                  >
                    {validationResult.data.evento}
                  </Badge>
                  <Text fontWeight="bold" fontSize="lg" color="white">
                    {validationResult.data.cliente_nombre}
                  </Text>
                  <Text color="whiteAlpha.600" fontSize="sm">
                    {validationResult.data.cliente_email}
                  </Text>
                  <Text fontSize="sm" color="whiteAlpha.800">
                    <Box as="span" color="#ff6b6b">{validationResult.data.tipo_entrada}</Box>
                  </Text>
                </VStack>
              ) : (
                <Text fontWeight="bold" color="#ef4444" textAlign="center" fontSize="lg">
                  {validationResult.message}
                </Text>
              )}
            </Center>
          </Box>

          {/* Botón para escanear otro */}
          <Center flexDirection="column">
            <Box
              as="button"
              onClick={resetAndScan}
              w="100px"
              h="100px"
              borderRadius="full"
              bg="linear-gradient(135deg, #ff6b6b 0%, #ff8a80 50%, #ffab40 100%)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 10px 40px rgba(255, 107, 107, 0.3)"
              _hover={{ transform: 'scale(1.05)' }}
              _active={{ transform: 'scale(0.95)' }}
              transition="transform 0.2s"
            >
              <LuCamera size={40} color="white" />
            </Box>
            <Text textAlign="center" mt={3} color="whiteAlpha.700" fontSize="sm">
              Escanear otra entrada
            </Text>
          </Center>
        </motion.div>
      )}
    </Box>
  );
}
