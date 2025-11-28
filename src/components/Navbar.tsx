import { Box, Flex, Heading, Spacer, Button, Container, useColorMode, useColorModeValue, IconButton, Menu, MenuButton, MenuList, MenuItem, Avatar } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { SunIcon, MoonIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const bg = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(0, 0, 0, 0.3)');
  const borderColor = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.05)');
  const menuBg = useColorModeValue('white', 'gray.800');
  const menuColor = useColorModeValue('gray.800', 'white');

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
      bg={bg} 
      backdropFilter="blur(10px)" 
      borderBottom="1px solid"
      borderColor={borderColor}
      boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
      color="white"
    >
      <Container maxW="1200px">
        <Flex py={4} align="center">
          <Heading size="md" letterSpacing="tight" textShadow="0 2px 4px rgba(0,0,0,0.2)">
            <RouterLink to="/">🎟️ Entrada Digital</RouterLink>
          </Heading>
          <Spacer />
          <Button 
            as={RouterLink} 
            to="/" 
            variant="ghost" 
            color="white" 
            mr={2}
            _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
            _active={{ bg: 'rgba(255, 255, 255, 0.3)' }}
          >
            Eventos
          </Button>

          {isAuthenticated ? (
            <Menu>
              <MenuButton 
                as={Button} 
                rightIcon={<ChevronDownIcon />} 
                variant="ghost" 
                color="white"
                _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
                _active={{ bg: 'rgba(255, 255, 255, 0.3)' }}
                mr={2}
              >
                {user?.nombre}
              </MenuButton>
              <MenuList bg={menuBg} color={menuColor}>
                <MenuItem onClick={() => navigate('/admin')}>Panel Admin</MenuItem>
                <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button 
              as={RouterLink} 
              to="/login" 
              variant="solid" 
              colorScheme="purple" 
              size="sm" 
              mr={2}
            >
              Login
            </Button>
          )}

          <IconButton
            aria-label="Toggle dark mode"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            color="white"
            _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
            _active={{ bg: 'rgba(255, 255, 255, 0.3)' }}
          />
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;
