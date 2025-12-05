import { useState } from 'react';
import { Button, Container, Heading, Input, Stack, Card } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Field } from '@/components/ui/field';
import { toaster } from '@/components/ui/toaster';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isRegistering ? '/api/register' : '/api/login';
    const payload = isRegistering ? { nombre, email, password } : { email, password };

    try {
      const res = await axios.post(endpoint, payload);
      if (res.data && res.data.token && res.data.user) {
        login(res.data.token, res.data.user);
        toaster.success({
          title: 'Bienvenido',
          description: `Hola ${res.data.user.nombre}`,
          duration: 3000,
        });
        navigate('/admin');
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || error.message 
        : 'Error en la operación';
      toaster.error({
        title: 'Error',
        description: errorMessage,
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="sm" py={20}>
      <Card.Root>
        <Card.Body>
          <Stack gap={6}>
            <Heading size="lg" textAlign="center">
              {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </Heading>
            <form onSubmit={handleSubmit}>
              <Stack gap={4}>
                {isRegistering && (
                  <Field label="Nombre Completo" required>
                    <Input 
                      type="text" 
                      value={nombre} 
                      onChange={(e) => setNombre(e.target.value)} 
                      placeholder="Tu Nombre"
                    />
                  </Field>
                )}
                <Field label="Email" required>
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="admin@entrada.digital"
                  />
                </Field>
                <Field label="Contraseña" required>
                  <Input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="********"
                  />
                </Field>
                <Button 
                  type="submit" 
                  colorPalette="purple" 
                  width="full" 
                  loading={loading}
                >
                  {isRegistering ? 'Registrarse' : 'Ingresar'}
                </Button>
              </Stack>
            </form>
            <Button 
              variant="plain" 
              colorPalette="purple" 
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering 
                ? '¿Ya tienes cuenta? Inicia sesión' 
                : '¿No tienes cuenta? Regístrate'}
            </Button>
          </Stack>
        </Card.Body>
      </Card.Root>
    </Container>
  );
};

export default Login;
