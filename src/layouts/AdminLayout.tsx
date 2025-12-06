import { type ReactNode, useState } from 'react';
import {
  Box, Flex, Text, VStack, IconButton, HStack, Portal, Drawer, CloseButton
} from '@chakra-ui/react';
import { LuHouse, LuCalendar, LuScanLine, LuMenu, LuLogOut } from 'react-icons/lu';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface LinkItemProps {
  name: string;
  icon: React.ElementType;
  path: string;
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'Dashboard', icon: LuHouse, path: '/admin' },
  { name: 'Eventos', icon: LuCalendar, path: '/admin/eventos' },
  { name: 'Validar QR', icon: LuScanLine, path: '/admin/validar' },
];

// Glass effect styles
const glassStyle = {
  bg: 'rgba(0, 0, 0, 0.4)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <Box 
      minH="100vh" 
      bg="linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)"
      position="relative"
    >
      {/* Background pattern */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.03}
        backgroundImage="radial-gradient(circle at 25px 25px, white 2%, transparent 0%)"
        backgroundSize="50px 50px"
        pointerEvents="none"
        zIndex={0}
      />

      {/* Desktop Sidebar - Fixed */}
      <Box
        display={{ base: 'none', md: 'block' }}
        position="fixed"
        left={0}
        top={0}
        bottom={0}
        w="260px"
        {...glassStyle}
        zIndex={100}
      >
        <DesktopSidebar />
      </Box>

      {/* Mobile Drawer */}
      <Drawer.Root 
        open={isOpen} 
        onOpenChange={(e) => setIsOpen(e.open)} 
        placement="start"
      >
        <Portal>
          <Drawer.Backdrop bg="blackAlpha.700" />
          <Drawer.Positioner>
            <Drawer.Content 
              {...glassStyle}
              maxW="280px"
              h="100vh"
            >
              <SidebarContent onClose={() => setIsOpen(false)} />
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>

      {/* Mobile Top Bar */}
      <MobileNav onOpen={() => setIsOpen(true)} />

      {/* Main Content */}
      <Box 
        ml={{ base: 0, md: '260px' }}
        pt={{ base: '70px', md: '20px' }}
        px={{ base: 3, md: 6 }}
        pb={{ base: '90px', md: 6 }}
        position="relative"
        zIndex={1}
        minH="100vh"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </Box>
  );
}

interface SidebarProps {
  onClose: () => void;
}

// Desktop Sidebar Component
const DesktopSidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Flex direction="column" h="100%" py={6} px={4}>
      {/* Header */}
      <VStack align="start" gap={1} mb={8} px={2}>
        <HStack gap={2}>
          <Box
            w="10px"
            h="10px"
            borderRadius="full"
            bg="linear-gradient(135deg, #ff6b6b 0%, #ffab40 100%)"
          />
          <Text 
            fontSize="xl" 
            fontWeight="700" 
            color="white"
            fontFamily="'Poppins', sans-serif"
          >
            entrada.digital
          </Text>
        </HStack>
        <Text fontSize="sm" color="whiteAlpha.500" pl={5}>
          {user?.rol === 'admin' ? 'Panel Admin' : 'Panel Organizador'}
        </Text>
      </VStack>

      {/* Navigation Links */}
      <VStack align="stretch" gap={2} flex={1}>
        {LinkItems.map((link) => {
          const isActive = location.pathname === link.path || 
            (link.path !== '/admin' && location.pathname.startsWith(link.path));

          return (
            <RouterLink key={link.name} to={link.path}>
              <Flex
                align="center"
                gap={3}
                p={4}
                borderRadius="xl"
                bg={isActive ? 'rgba(255, 107, 107, 0.2)' : 'transparent'}
                color={isActive ? '#ff6b6b' : 'whiteAlpha.800'}
                border={isActive ? '1px solid rgba(255, 107, 107, 0.3)' : '1px solid transparent'}
                transition="all 0.2s"
                _hover={{
                  bg: isActive ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <link.icon size={20} />
                <Text fontWeight={isActive ? '600' : '500'}>{link.name}</Text>
              </Flex>
            </RouterLink>
          );
        })}
      </VStack>

      {/* User info & Logout */}
      <Box borderTop="1px solid rgba(255,255,255,0.1)" pt={4} mt={4}>
        <HStack mb={4} px={2}>
          <Box
            w="36px"
            h="36px"
            borderRadius="full"
            bg="linear-gradient(135deg, #ff6b6b 0%, #ffab40 100%)"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="sm" fontWeight="bold" color="white">
              {user?.nombre?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </Text>
          </Box>
          <VStack align="start" gap={0} flex={1}>
            <Text fontSize="sm" fontWeight="600" color="white" lineClamp={1}>
              {user?.nombre || 'Usuario'}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.500" lineClamp={1}>
              {user?.email}
            </Text>
          </VStack>
        </HStack>

        <Box
          as="button"
          onClick={handleLogout}
          display="flex"
          alignItems="center"
          gap={3}
          p={4}
          w="100%"
          borderRadius="xl"
          color="red.300"
          transition="all 0.2s"
          _hover={{ bg: 'rgba(239, 68, 68, 0.2)' }}
        >
          <LuLogOut size={20} />
          <Text fontWeight="500">Cerrar Sesión</Text>
        </Box>
      </Box>
    </Flex>
  );
};

const SidebarContent = ({ onClose }: SidebarProps) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

  return (
    <Flex direction="column" h="100%" py={6} px={4}>
      {/* Header */}
      <Flex align="center" justify="space-between" mb={8}>
        <VStack align="start" gap={0}>
          <Text 
            fontSize="xl" 
            fontWeight="700" 
            color="white"
            fontFamily="'Poppins', sans-serif"
          >
            {user?.rol === 'admin' ? 'Admin Panel' : 'Organizador'}
          </Text>
          <Text fontSize="sm" color="whiteAlpha.600" lineClamp={1}>
            {user?.nombre || user?.email}
          </Text>
        </VStack>
        <CloseButton 
          onClick={onClose} 
          color="white"
          size="sm"
        />
      </Flex>

      {/* Navigation Links */}
      <VStack align="stretch" gap={2} flex={1}>
        {LinkItems.map((link) => (
          <NavItem 
            key={link.name} 
            icon={link.icon} 
            path={link.path} 
            onClose={onClose}
          >
            {link.name}
          </NavItem>
        ))}
      </VStack>

      {/* Logout */}
      <Box
        as="button"
        onClick={handleLogout}
        display="flex"
        alignItems="center"
        gap={3}
        p={4}
        borderRadius="xl"
        color="red.300"
        transition="all 0.2s"
        _hover={{ bg: 'rgba(239, 68, 68, 0.2)' }}
      >
        <LuLogOut size={20} />
        <Text fontWeight="500">Cerrar Sesión</Text>
      </Box>
    </Flex>
  );
};

interface NavItemProps {
  icon: React.ElementType;
  children: ReactNode;
  path: string;
  onClose: () => void;
}

const NavItem = ({ icon: IconComponent, children, path, onClose }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === path || 
    (path !== '/admin' && location.pathname.startsWith(path));

  return (
    <RouterLink to={path} onClick={onClose}>
      <Flex
        align="center"
        gap={3}
        p={4}
        borderRadius="xl"
        bg={isActive ? 'rgba(255, 107, 107, 0.2)' : 'transparent'}
        color={isActive ? '#ff6b6b' : 'whiteAlpha.800'}
        border={isActive ? '1px solid rgba(255, 107, 107, 0.3)' : '1px solid transparent'}
        transition="all 0.2s"
        _hover={{
          bg: isActive ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <IconComponent size={20} />
        <Text fontWeight={isActive ? '600' : '500'}>{children}</Text>
      </Flex>
    </RouterLink>
  );
};

interface MobileNavProps {
  onOpen: () => void;
}

const MobileNav = ({ onOpen }: MobileNavProps) => {
  const { user } = useAuth();

  return (
    <Flex
      position="fixed"
      top={0}
      left={0}
      right={0}
      h="60px"
      px={4}
      alignItems="center"
      justifyContent="space-between"
      {...glassStyle}
      zIndex={100}
      display={{ base: 'flex', md: 'none' }}
    >
      <IconButton
        onClick={onOpen}
        variant="ghost"
        aria-label="Abrir menú"
        color="white"
        _hover={{ bg: 'whiteAlpha.200' }}
      >
        <LuMenu size={24} />
      </IconButton>

      <HStack gap={2}>
        <Box
          w="8px"
          h="8px"
          borderRadius="full"
          bg="linear-gradient(135deg, #ff6b6b 0%, #ffab40 100%)"
        />
        <Text
          fontSize="lg"
          fontWeight="700"
          color="white"
          fontFamily="'Poppins', sans-serif"
        >
          {user?.rol === 'admin' ? 'Admin' : 'Panel'}
        </Text>
      </HStack>

      <Box w="40px" /> {/* Spacer */}
    </Flex>
  );
};

const BottomNav = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const allItems = [
    ...LinkItems,
    { name: 'Salir', icon: LuLogOut, path: '#logout' }
  ];

  return (
    <Flex
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      h="70px"
      {...glassStyle}
      zIndex={100}
      display={{ base: 'flex', md: 'none' }}
      justifyContent="space-around"
      alignItems="center"
      px={2}
    >
      {allItems.map((item) => {
        const isActive = item.path !== '#logout' && (
          location.pathname === item.path || 
          (item.path !== '/admin' && location.pathname.startsWith(item.path))
        );
        const isLogout = item.path === '#logout';

        const content = (
          <VStack
            gap={1}
            p={2}
            borderRadius="xl"
            color={isLogout ? 'red.400' : (isActive ? '#ff6b6b' : 'whiteAlpha.600')}
            bg={isActive ? 'rgba(255, 107, 107, 0.15)' : 'transparent'}
            transition="all 0.2s"
            minW="60px"
          >
            <item.icon size={22} />
            <Text fontSize="xs" fontWeight={isActive ? '600' : '400'}>
              {item.name}
            </Text>
          </VStack>
        );

        if (isLogout) {
          return (
            <Box 
              key={item.name} 
              as="button" 
              onClick={handleLogout}
              cursor="pointer"
            >
              {content}
            </Box>
          );
        }

        return (
          <RouterLink key={item.name} to={item.path}>
            {content}
          </RouterLink>
        );
      })}
    </Flex>
  );
};
