import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const styles = {
  global: (props: any) => ({
    body: {
      bg: mode(
        // Light mode: Gradient background
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        // Dark mode: Dark solid background
        'gray.900'
      )(props),
      color: mode('gray.800', 'whiteAlpha.900')(props),
      minHeight: '100vh',
      backgroundAttachment: 'fixed', // Keep gradient fixed
    },
  }),
};

const theme = extendTheme({ config, styles });

export default theme;
