import { useState } from 'react';
import { Box, Flex, Heading, Button, Container, IconButton, Portal, Input } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { LuChevronDown, LuSearch, LuUser, LuX } from 'react-icons/lu';
import { MenuRoot, MenuTrigger, MenuContent, MenuItem } from '@/components/ui/menu';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
}

const Navbar = ({ searchTerm = '', onSearchChange }: NavbarProps) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box 
      as="nav" 
      position="fixed" 
      top={0} 
      left={0}
      right={0}
      zIndex={100}
      bg="rgba(0, 0, 0, 0.3)"
      backdropFilter="blur(20px)"
      borderBottom="1px solid rgba(255, 255, 255, 0.1)"
      transition="all 0.3s ease"
    >
      <Container maxW="1400px">
        <Flex py={3} align="center" justify="space-between" gap={4}>
          {/* Logo */}
          <AnimatePresence mode="wait">
            {!mobileSearchOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Heading 
                  size="md" 
                  letterSpacing="tight"
                  color="white"
                  fontFamily="'Poppins', sans-serif"
                  flexShrink={0}
                >
                  <RouterLink to="/">🎟️ Entrada Digital</RouterLink>
                </Heading>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Search Bar - Desktop */}
          <Box 
            position="relative" 
            flex="1" 
            maxW="400px"
            display={{ base: 'none', md: 'block' }}
          >
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              bg="rgba(255, 255, 255, 0.1)"
              border="1px solid rgba(255, 255, 255, 0.2)"
              borderRadius="full"
              color="white"
              pl={10}
              _placeholder={{ color: 'whiteAlpha.600' }}
              _hover={{ 
                border: '1px solid rgba(255, 107, 107, 0.5)',
                bg: 'rgba(255, 255, 255, 0.15)'
              }}
              _focus={{ 
                border: '1px solid rgba(255, 107, 107, 0.8)',
                bg: 'rgba(255, 255, 255, 0.15)',
                boxShadow: '0 0 0 1px rgba(255, 107, 107, 0.3)'
              }}
            />
            <Box
              position="absolute"
              left={3}
              top="50%"
              transform="translateY(-50%)"
              color="whiteAlpha.600"
              pointerEvents="none"
            >
              <LuSearch />
            </Box>
          </Box>

          {/* Search Bar - Mobile (expandable) */}
          <AnimatePresence>
            {mobileSearchOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '100%' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3 }}
                style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Box position="relative" flex="1">
                  <Input
                    placeholder="Buscar eventos..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    bg="rgba(255, 255, 255, 0.1)"
                    border="1px solid rgba(255, 255, 255, 0.2)"
                    borderRadius="full"
                    color="white"
                    pl={10}
                    autoFocus
                    _placeholder={{ color: 'whiteAlpha.600' }}
                    _focus={{ 
                      border: '1px solid rgba(255, 107, 107, 0.8)',
                      bg: 'rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 0 0 1px rgba(255, 107, 107, 0.3)'
                    }}
                  />
                  <Box
                    position="absolute"
                    left={3}
                    top="50%"
                    transform="translateY(-50%)"
                    color="whiteAlpha.600"
                    pointerEvents="none"
                  >
                    <LuSearch />
                  </Box>
                </Box>
                <IconButton
                  aria-label="Cerrar búsqueda"
                  variant="ghost"
                  color="white"
                  size="sm"
                  onClick={() => setMobileSearchOpen(false)}
                  _hover={{ bg: 'rgba(255, 107, 107, 0.2)' }}
                >
                  <LuX />
                </IconButton>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Navigation */}
          <Flex gap={2} align="center" flexShrink={0}>
            {/* Mobile Search Button */}
            {!mobileSearchOpen && (
              <IconButton
                aria-label="Buscar"
                variant="ghost"
                color="white"
                size="sm"
                display={{ base: 'flex', md: 'none' }}
                onClick={() => setMobileSearchOpen(true)}
                _hover={{ bg: 'rgba(255, 107, 107, 0.2)' }}
              >
                <LuSearch />
              </IconButton>
            )}

            {isAuthenticated ? (
              <MenuRoot>
                <MenuTrigger asChild>
                  <Button 
                    variant="ghost"
                    color="white"
                    size="sm"
                    _hover={{ 
                      bg: 'rgba(255, 107, 107, 0.2)',
                      color: 'white'
                    }}
                  >
                    {user?.nombre}
                    <LuChevronDown />
                  </Button>
                </MenuTrigger>
                <Portal>
                  <MenuContent
                    bg="rgba(10, 10, 10, 0.95)"
                    backdropFilter="blur(20px)"
                    border="1px solid rgba(255, 107, 107, 0.3)"
                    borderRadius="12px"
                  >
                    <MenuItem 
                      value="admin" 
                      onClick={() => navigate('/admin')}
                      _hover={{ bg: 'rgba(255, 107, 107, 0.2)' }}
                    >
                      Panel Admin
                    </MenuItem>
                    <MenuItem 
                      value="logout" 
                      onClick={handleLogout}
                      _hover={{ bg: 'rgba(255, 107, 107, 0.2)' }}
                    >
                      Cerrar Sesión
                    </MenuItem>
                  </MenuContent>
                </Portal>
              </MenuRoot>
            ) : (
              <IconButton
                asChild
                aria-label="Login"
                variant="ghost"
                color="white"
                size="sm"
                _hover={{ 
                  bg: 'rgba(255, 107, 107, 0.2)',
                  color: 'white'
                }}
              >
                <RouterLink to="/login">
                  <LuUser />
                </RouterLink>
              </IconButton>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;
