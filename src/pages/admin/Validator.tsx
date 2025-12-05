import { useState, useEffect, useRef } from 'react';
import { 
  Box, Heading, VStack, Text, Center, Icon, Flex, IconButton, Badge
} from '@chakra-ui/react';
import { FiCheckCircle, FiXCircle, FiCamera, FiX, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { toaster } from '@/components/ui/toaster';
import { useColorModeValue } from '../../components/ui/color-mode';
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

export default function Validator() {
  const [isScanning, setIsScanning] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const { token } = useAuth();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  // Cleanup scanner on unmount
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
          // QR detectado - pausar scanner y mostrar para confirmación
          html5QrCode.pause();
          setPendingCode(decodedText);
          setIsScanning(false);
        },
        () => {
          // Error de escaneo - ignorar
        }
      );
      
      setIsScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      toaster.error({
        title: 'Error de cámara',
        description: 'No se pudo acceder a la cámara. Asegúrate de dar permisos.',
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
      // Usuario rechazó - volver a escanear
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
      toaster.error({
        title: 'Error de conexión',
        duration: 3000,
      });
    }

    // Limpiar código pendiente y detener scanner
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
    <Box maxW="500px" mx="auto" px={4} pb={8}>
      <Heading mb={4} textAlign="center" size="lg">Validar Entradas</Heading>
      
      {/* Estado inicial - Botón para escanear */}
      {!isScanning && !pendingCode && !validationResult && (
        <Center flexDirection="column" py={10}>
          <IconButton
            aria-label="Escanear QR"
            onClick={startScanner}
            colorPalette="purple"
            size="2xl"
            rounded="full"
            w="150px"
            h="150px"
            mb={4}
          >
            <FiCamera size={60} />
          </IconButton>
          <Text fontSize="lg" color={textColor} textAlign="center">
            Toca para escanear
          </Text>
          <Text fontSize="sm" color="gray.500" textAlign="center" mt={2}>
            Apunta la cámara al código QR de la entrada
          </Text>
        </Center>
      )}

      {/* Scanner activo */}
      {isScanning && (
        <Box position="relative">
          <Box 
            id="qr-reader" 
            w="100%" 
            borderRadius="xl" 
            overflow="hidden"
            border="3px solid"
            borderColor="purple.500"
          />
          <IconButton
            aria-label="Cancelar"
            onClick={stopScanner}
            position="absolute"
            top={2}
            right={2}
            colorPalette="red"
            size="lg"
            rounded="full"
          >
            <FiX />
          </IconButton>
          <Text textAlign="center" mt={4} color={textColor}>
            Buscando código QR...
          </Text>
        </Box>
      )}

      {/* QR Detectado - Confirmar tipo Tinder */}
      {pendingCode && !validationResult && (
        <Box>
          <Box 
            bg={cardBg}
            p={6}
            borderRadius="2xl"
            shadow="xl"
            border="2px solid"
            borderColor="purple.400"
            mb={6}
          >
            <VStack gap={4}>
              <Badge colorPalette="purple" fontSize="md" px={4} py={2} borderRadius="full">
                QR DETECTADO
              </Badge>
              
              <Text fontSize="sm" fontFamily="mono" color="gray.500" textAlign="center">
                {pendingCode.substring(0, 16)}...
              </Text>

              <Text fontSize="lg" fontWeight="bold" textAlign="center" color={textColor}>
                ¿Validar esta entrada?
              </Text>
              
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Al confirmar, la entrada quedará marcada como usada
              </Text>
            </VStack>
          </Box>

          {/* Botones tipo Tinder */}
          <Flex justify="center" gap={8}>
            <IconButton
              aria-label="Rechazar"
              onClick={() => handleValidate(false)}
              colorPalette="red"
              size="2xl"
              rounded="full"
              w="80px"
              h="80px"
              shadow="lg"
              _hover={{ transform: 'scale(1.1)' }}
              transition="transform 0.2s"
            >
              <FiX size={40} />
            </IconButton>
            
            <IconButton
              aria-label="Aceptar"
              onClick={() => handleValidate(true)}
              colorPalette="green"
              size="2xl"
              rounded="full"
              w="80px"
              h="80px"
              shadow="lg"
              _hover={{ transform: 'scale(1.1)' }}
              transition="transform 0.2s"
            >
              <FiCheck size={40} />
            </IconButton>
          </Flex>
          
          <Flex justify="center" gap={8} mt={2}>
            <Text fontSize="sm" color="red.500" fontWeight="bold">Cancelar</Text>
            <Text fontSize="sm" color="green.500" fontWeight="bold">Validar</Text>
          </Flex>
        </Box>
      )}

      {/* Resultado de validación */}
      {validationResult && (
        <Box>
          <Box 
            bg={validationResult.success ? 'green.subtle' : 'red.subtle'} 
            borderColor={validationResult.success ? 'green.muted' : 'red.muted'}
            borderWidth="2px"
            borderRadius="2xl"
            p={6}
            mb={6}
          >
            <Center flexDirection="column" py={4}>
              <Icon 
                fontSize="6xl"
                color={validationResult.success ? 'green.solid' : 'red.solid'} 
                mb={4}
              >
                {validationResult.success ? <FiCheckCircle /> : <FiXCircle />}
              </Icon>
              
              <Heading 
                size="lg" 
                mb={4} 
                color={validationResult.success ? 'green.fg' : 'red.fg'}
                textAlign="center"
              >
                {validationResult.success ? '¡ACCESO PERMITIDO!' : 'ACCESO DENEGADO'}
              </Heading>
              
              {validationResult.success && validationResult.data ? (
                <VStack gap={2} w="100%">
                  <Badge colorPalette="green" fontSize="md" px={4} py={1}>
                    {validationResult.data.evento}
                  </Badge>
                  <Text fontWeight="bold" fontSize="lg">{validationResult.data.cliente_nombre}</Text>
                  <Text color="gray.500">{validationResult.data.cliente_email}</Text>
                  <Text fontSize="sm">
                    <strong>Tipo:</strong> {validationResult.data.tipo_entrada}
                  </Text>
                </VStack>
              ) : (
                <Text fontWeight="bold" color="red.fg" textAlign="center" fontSize="lg">
                  {validationResult.message}
                </Text>
              )}
            </Center>
          </Box>

          {/* Botón para escanear otro */}
          <Center>
            <IconButton
              aria-label="Escanear otro"
              onClick={resetAndScan}
              colorPalette="purple"
              size="2xl"
              rounded="full"
              w="100px"
              h="100px"
            >
              <FiCamera size={40} />
            </IconButton>
          </Center>
          <Text textAlign="center" mt={2} color={textColor}>
            Escanear otra entrada
          </Text>
        </Box>
      )}
    </Box>
  );
}