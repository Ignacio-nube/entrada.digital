import { Box, Flex, Heading, Button, Container, IconButton, Portal } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { LuSun, LuMoon, LuChevronDown } from 'react-icons/lu';
import { useColorMode } from '@/components/ui/color-mode';
import { MenuRoot, MenuTrigger, MenuContent, MenuItem } from '@/components/ui/menu';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box 
      as="nav" 
      position="sticky" 
      top={0} 
      zIndex={100}
      bg="bg/80" 
      backdropFilter="blur(10px)" 
      borderBottomWidth="1px"
      borderColor="border.muted"
      boxShadow="sm"
    >
      <Container maxW="1200px">
        <Flex py={4} align="center" justify="space-between">
          <Heading size="md" letterSpacing="tight">
            <RouterLink to="/">🎟️ Entrada Digital</RouterLink>
          </Heading>
          
          <Flex gap={2} align="center">
            <Button 
              asChild
              variant="ghost" 
            >
              <RouterLink to="/">Eventos</RouterLink>
            </Button>

            {isAuthenticated ? (
              <MenuRoot>
                <MenuTrigger asChild>
                  <Button variant="ghost">
                    {user?.nombre}
                    <LuChevronDown />
                  </Button>
                </MenuTrigger>
                <Portal>
                  <MenuContent>
                    <MenuItem value="admin" onClick={() => navigate('/admin')}>
                      Panel Admin
                    </MenuItem>
                    <MenuItem value="logout" onClick={handleLogout}>
                      Cerrar Sesión
                    </MenuItem>
                  </MenuContent>
                </Portal>
              </MenuRoot>
            ) : (
              <Button 
                asChild
                colorPalette="purple" 
                size="sm" 
              >
                <RouterLink to="/login">Login</RouterLink>
              </Button>
            )}

            <IconButton
              aria-label="Toggle dark mode"
              variant="ghost"
              onClick={toggleColorMode}
            >
              {colorMode === 'light' ? <LuMoon /> : <LuSun />}
            </IconButton>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;
