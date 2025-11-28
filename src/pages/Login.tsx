import { useState } from 'react';
import { Box, Button, Container, FormControl, FormLabel, Heading, Input, Stack, useToast, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
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
    try {
      const res = await axios.post('http://localhost:3000/api/login', { email, password });
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
        description: error.response?.data?.error || 'Credenciales incorrectas',
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
          <Heading size="lg" textAlign="center">Iniciar Sesión</Heading>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
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
                Ingresar
              </Button>
            </Stack>
          </form>
        </Stack>
      </Box>
    </Container>
  );
};

export default Login;
