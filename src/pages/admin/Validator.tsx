import { useState } from 'react';
import {
  Box, Heading, Input, Button, VStack, Text, useToast, Card, CardBody,
  Center, Icon
} from '@chakra-ui/react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function Validator() {
  const [qrCode, setQrCode] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const { token } = useAuth();
  const toast = useToast();

  const handleValidate = async () => {
    if (!qrCode) return;

    try {
      const response = await fetch('/api/validar-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ codigo_qr: qrCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setValidationResult({ success: true, data: data.ticket });
        toast({
          title: 'Entrada Válida',
          status: 'success',
          duration: 2000,
        });
      } else {
        setValidationResult({ success: false, message: data.message || 'Error desconocido' });
        toast({
          title: 'Entrada Inválida',
          description: data.message,
          status: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error validating:', error);
      toast({
        title: 'Error de conexión',
        status: 'error',
        duration: 3000,
      });
    }
    setQrCode(''); // Limpiar input para siguiente escaneo
  };

  return (
    <Box maxW="600px" mx="auto">
      <Heading mb={6} textAlign="center">Validación de Entradas</Heading>
      
      <Card mb={8} variant="outline">
        <CardBody>
          <VStack spacing={4}>
            <Text fontSize="lg">Escanea o ingresa el código QR</Text>
            <Input
              placeholder="Código de la entrada..."
              size="lg"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleValidate();
                }
              }}
            />
            <Button 
              colorScheme="purple" 
              size="lg" 
              width="full" 
              onClick={handleValidate}
            >
              Validar
            </Button>
          </VStack>
        </CardBody>
      </Card>

      {validationResult && (
        <Card 
          bg={validationResult.success ? 'green.50' : 'red.50'} 
          borderColor={validationResult.success ? 'green.200' : 'red.200'}
          borderWidth={1}
        >
          <CardBody>
            <Center flexDirection="column" py={4}>
              <Icon 
                as={validationResult.success ? FiCheckCircle : FiXCircle} 
                w={16} h={16} 
                color={validationResult.success ? 'green.500' : 'red.500'} 
                mb={4}
              />
              <Heading size="md" mb={2} color={validationResult.success ? 'green.700' : 'red.700'}>
                {validationResult.success ? 'ACCESO PERMITIDO' : 'ACCESO DENEGADO'}
              </Heading>
              
              {validationResult.success ? (
                <VStack spacing={1}>
                  <Text fontWeight="bold">{validationResult.data.evento}</Text>
                  <Text>Tipo: {validationResult.data.tipo_entrada}</Text>
                  <Text fontSize="sm" color="gray.600">ID: {validationResult.data.id}</Text>
                </VStack>
              ) : (
                <Text fontWeight="bold" color="red.600">
                  {validationResult.message}
                </Text>
              )}
            </Center>
          </CardBody>
        </Card>
      )}
    </Box>
  );
}
