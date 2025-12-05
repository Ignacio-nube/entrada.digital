import { type ReactNode, useState } from 'react';
import {
  Box, Flex, Text, VStack, IconButton
} from '@chakra-ui/react';
import { FiHome, FiCalendar, FiCheckSquare, FiMenu, FiLogOut, FiX, FiSun, FiMoon } from 'react-icons/fi';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useColorModeValue, useColorMode } from '../components/ui/color-mode';
import { DrawerRoot, DrawerContent, DrawerCloseTrigger, DrawerBackdrop } from '../components/ui/drawer';

interface LinkItemProps {
  name: string;
  icon: React.ElementType;
  path: string;
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'Dashboard', icon: FiHome, path: '/admin' },
  { name: 'Eventos', icon: FiCalendar, path: '/admin/eventos' },
  { name: 'Validar QR', icon: FiCheckSquare, path: '/admin/validar' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      <SidebarContent onClose={onClose} display={{ base: 'none', md: 'block' }} />
      <DrawerRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} placement="start" size="xs">
        <DrawerBackdrop />
        <DrawerContent maxW="70vw">
          <DrawerCloseTrigger />
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </DrawerRoot>
      {/* Mobile Nav */}
      <MobileNav onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  );
}

interface SidebarProps {
  onClose: () => void;
  display?: object;
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Box>
          <Text fontSize="lg" fontWeight="bold" lineHeight="1.2">
            {user?.rol === 'admin' ? 'Admin' : 'Organizador'}
          </Text>
          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} lineClamp={1}>
            {user?.nombre || user?.email}
          </Text>
        </Box>
        <Flex gap={2}>
          <IconButton
            onClick={toggleColorMode}
            variant="ghost"
            aria-label="Cambiar tema"
            size="sm"
          >
            {colorMode === 'dark' ? <FiSun /> : <FiMoon />}
          </IconButton>
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onClose}
            variant="ghost"
            aria-label="Cerrar menú"
            size="sm"
          >
            <FiX />
          </IconButton>
        </Flex>
      </Flex>
      <VStack align="stretch" gap={0}>
        {LinkItems.map((link) => (
          <NavItem key={link.name} icon={link.icon} path={link.path} onClose={onClose}>
            {link.name}
          </NavItem>
        ))}
        <NavItem icon={FiLogOut} path="#" onClick={() => { logout(); navigate('/'); }} onClose={onClose}>
          Cerrar Sesión
        </NavItem>
      </VStack>
    </Box>
  );
};

interface NavItemProps {
  icon: React.ElementType;
  children: ReactNode;
  path: string;
  onClose: () => void;
  onClick?: () => void;
}

const NavItem = ({ icon: IconComponent, children, path, onClose, onClick }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === path;
  const activeBg = useColorModeValue('purple.100', 'purple.900');
  const activeColor = useColorModeValue('purple.700', 'purple.200');

  return (
    <RouterLink 
      to={path} 
      style={{ textDecoration: 'none' }} 
      onClick={() => {
        if (onClick) onClick();
        onClose();
      }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : 'inherit'}
        _hover={{
          bg: activeBg,
          color: activeColor,
        }}
      >
        {IconComponent && (
          <Box
            mr="4"
            fontSize="16"
            _groupHover={{
              color: activeColor,
            }}
          >
            <IconComponent />
          </Box>
        )}
        {children}
      </Flex>
    </RouterLink>
  );
};

interface MobileProps {
  onOpen: () => void;
}

const MobileNav = ({ onOpen }: MobileProps) => {
  const { user } = useAuth();
  
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="16"
      alignItems="center"
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      display={{ base: 'flex', md: 'none' }}
    >
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
      >
        <FiMenu />
      </IconButton>

      <Box textAlign="center">
        <Text
          display={{ base: 'flex', md: 'none' }}
          fontSize="lg"
          fontWeight="bold"
        >
          {user?.rol === 'admin' ? 'Admin' : 'Organizador'}
        </Text>
      </Box>
      
      <Box w="40px" /> {/* Spacer para centrar */}
    </Flex>
  );
};
