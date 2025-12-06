import { StrictMode, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Box, Heading, Text, Button } from '@chakra-ui/react'
import { Provider } from '@/components/ui/provider'
import { Toaster } from '@/components/ui/toaster'
import './index.css'
import './styles/futuristic.css'
import App from './App.tsx'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={10} textAlign="center">
          <Heading>Algo salió mal 😢</Heading>
          <Text mt={4} color="red.500">{this.state.error?.message}</Text>
          <Button mt={6} colorPalette="purple" onClick={() => window.location.reload()}>
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
    <Provider>
      <ErrorBoundary>
        <BrowserRouter>
          <App />
          <Toaster />
        </BrowserRouter>
      </ErrorBoundary>
    </Provider>
  </StrictMode>,
)
