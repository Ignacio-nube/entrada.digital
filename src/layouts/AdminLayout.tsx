import { type ReactNode } from 'react';
import {
  Box, Flex, Icon, useColorModeValue, Link, Drawer, DrawerContent,
  useDisclosure, Text, IconButton, CloseButton, VStack
} from '@chakra-ui/react';
import { FiHome, FiCalendar, FiCheckSquare, FiMenu, FiLogOut } from 'react-icons/fi';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LinkItemProps {
  name: string;
  icon: any;
  path: string;
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'Dashboard', icon: FiHome, path: '/admin' },
  { name: 'Eventos', icon: FiCalendar, path: '/admin/eventos' },
  { name: 'Validar QR', icon: FiCheckSquare, path: '/admin/validar' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      <SidebarContent onClose={onClose} display={{ base: 'none', md: 'block' }} />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
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
  const { logout } = useAuth();
  const navigate = useNavigate();

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
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
          Admin
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      <VStack align="stretch" spacing={0}>
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
  icon: any;
  children: ReactNode;
  path: string;
  onClose: () => void;
  onClick?: () => void;
}

const NavItem = ({ icon, children, path, onClose, onClick }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === path;
  const activeBg = useColorModeValue('purple.100', 'purple.900');
  const activeColor = useColorModeValue('purple.700', 'purple.200');

  return (
    <Link 
      as={RouterLink} 
      to={path} 
      style={{ textDecoration: 'none' }} 
      _focus={{ boxShadow: 'none' }}
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
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: activeColor,
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  );
};

interface MobileProps {
  onOpen: () => void;
}

const MobileNav = ({ onOpen }: MobileProps) => {
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
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
        icon={<FiMenu />}
      />

      <Text
        display={{ base: 'flex', md: 'none' }}
        fontSize="2xl"
        fontFamily="monospace"
        fontWeight="bold"
      >
        Admin
      </Text>
    </Flex>
  );
};
