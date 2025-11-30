import { StrictMode, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, ColorModeScript, Box, Heading, Text, Button } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import theme from './theme'

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={10} textAlign="center">
          <Heading>Algo salió mal 😢</Heading>
          <Text mt={4} color="red.500">{this.state.error?.message}</Text>
          <Button mt={6} colorScheme="purple" onClick={() => window.location.reload()}>
            Recargar Página
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <ErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </ChakraProvider>
  </StrictMode>,
)
