import { useState } from 'react';
import { Box, Button, Container, FormControl, FormLabel, Heading, Input, Stack, useToast, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const bg = useColorModeValue('white', 'gray.800');
  const color = useColorModeValue('gray.800', 'white');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isRegistering ? '/api/register' : '/api/login';
    const payload = isRegistering ? { nombre, email, password } : { email, password };

    try {
      const res = await axios.post(endpoint, payload);
      login(res.data.token, res.data.user);
      toast({
        title: 'Bienvenido',
        description: `Hola ${res.data.user.nombre}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/admin');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Error en la operación',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="sm" py={20}>
      <Box 
        bg={bg} 
        p={8} 
        borderRadius="xl" 
        boxShadow="lg" 
        color={color}
      >
        <Stack spacing={6}>
          <Heading size="lg" textAlign="center">
            {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </Heading>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              {isRegistering && (
                <FormControl isRequired>
                  <FormLabel>Nombre Completo</FormLabel>
                  <Input 
                    type="text" 
                    value={nombre} 
                    onChange={(e) => setNombre(e.target.value)} 
                    placeholder="Tu Nombre"
                  />
                </FormControl>
              )}
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="admin@entrada.digital"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Contraseña</FormLabel>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="********"
                />
              </FormControl>
              <Button 
                type="submit" 
                colorScheme="purple" 
                width="full" 
                isLoading={loading}
              >
                {isRegistering ? 'Registrarse' : 'Ingresar'}
              </Button>
            </Stack>
          </form>
          <Button 
            variant="link" 
            colorScheme="purple" 
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering 
              ? '¿Ya tienes cuenta? Inicia sesión' 
              : '¿No tienes cuenta? Regístrate'}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default Login;
