import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Button, Image, VStack, Text, HStack, IconButton } from '@chakra-ui/react';
import { LuUpload, LuTrash2, LuImage } from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';

// Cloudinary configuration
const CLOUD_NAME = 'doosdrcdk';
const UPLOAD_PRESET = 'entrada_digital';

interface CloudinaryUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

interface CloudinaryWidget {
  open: () => void;
  close: () => void;
  destroy: () => void;
}

declare global {
  interface Window {
    cloudinary: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (error: Error | null, result: { event: string; info: { secure_url: string } }) => void
      ) => CloudinaryWidget;
    };
  }
}

export default function CloudinaryUpload({ value, onChange, folder = 'eventos' }: CloudinaryUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const widgetRef = useRef<CloudinaryWidget | null>(null);
  const onChangeRef = useRef(onChange);

  // Keep onChange ref updated
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Load Cloudinary script once
  useEffect(() => {
    // Check if script already exists
    if (document.querySelector('script[src*="cloudinary"]')) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Don't remove script on unmount - it can be reused
    };
  }, []);

  // Create widget when script is loaded
  useEffect(() => {
    if (!scriptLoaded || !window.cloudinary) return;

    // Destroy previous widget if exists
    if (widgetRef.current) {
      widgetRef.current.destroy();
    }

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        folder: folder,
        sources: ['local', 'url', 'camera'],
        multiple: false,
        maxFileSize: 5000000,
        maxImageWidth: 1920,
        maxImageHeight: 1080,
        cropping: true,
        croppingAspectRatio: 16 / 9,
        croppingShowDimensions: true,
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        showSkipCropButton: true,
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ],
        styles: {
          palette: {
            window: '#1a1a1a',
            windowBorder: '#ff6b6b',
            tabIcon: '#ff6b6b',
            menuIcons: '#ff8a80',
            textDark: '#000000',
            textLight: '#ffffff',
            link: '#ff6b6b',
            action: '#ff6b6b',
            inactiveTabIcon: '#666666',
            error: '#ff4444',
            inProgress: '#ff8a80',
            complete: '#4ade80',
            sourceBg: '#1a1a1a'
          }
        }
      },
      (error, result) => {
        if (error) {
          console.error('Upload error:', error);
          setIsLoading(false);
          // Restore scroll
          document.body.style.overflow = '';
          return;
        }
        
        if (result.event === 'success') {
          onChangeRef.current(result.info.secure_url);
          setIsLoading(false);
          // Restore scroll after success
          document.body.style.overflow = '';
        }
        
        if (result.event === 'close') {
          setIsLoading(false);
          // Restore scroll when widget closes
          document.body.style.overflow = '';
        }
      }
    );

    return () => {
      if (widgetRef.current) {
        widgetRef.current.destroy();
        widgetRef.current = null;
      }
      // Ensure scroll is restored on cleanup
      document.body.style.overflow = '';
    };
  }, [scriptLoaded, folder]);

  const handleUploadClick = useCallback(() => {
    if (!widgetRef.current) {
      console.warn('Widget not ready');
      return;
    }
    setIsLoading(true);
    widgetRef.current.open();
  }, []);

  const handleRemoveImage = useCallback(() => {
    onChangeRef.current('');
  }, []);

  return (
    <VStack gap={3} align="stretch" w="100%">
      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Box position="relative" borderRadius="xl" overflow="hidden">
              <Image
                src={value}
                alt="Preview"
                w="100%"
                h="200px"
                objectFit="cover"
                borderRadius="xl"
              />
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="blackAlpha.400"
                opacity={0}
                transition="opacity 0.2s"
                _hover={{ opacity: 1 }}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <HStack gap={2}>
                  <IconButton
                    aria-label="Cambiar imagen"
                    onClick={handleUploadClick}
                    bg="rgba(255, 255, 255, 0.2)"
                    color="white"
                    _hover={{ bg: 'rgba(255, 107, 107, 0.8)' }}
                    borderRadius="full"
                  >
                    <LuUpload />
                  </IconButton>
                  <IconButton
                    aria-label="Eliminar imagen"
                    onClick={handleRemoveImage}
                    bg="rgba(255, 255, 255, 0.2)"
                    color="white"
                    _hover={{ bg: 'rgba(239, 68, 68, 0.8)' }}
                    borderRadius="full"
                  >
                    <LuTrash2 />
                  </IconButton>
                </HStack>
              </Box>
            </Box>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={handleUploadClick}
              h="200px"
              w="100%"
              variant="outline"
              borderStyle="dashed"
              borderWidth="2px"
              borderColor="gray.400"
              borderRadius="xl"
              _hover={{
                borderColor: '#ff6b6b',
                bg: 'rgba(255, 107, 107, 0.1)',
              }}
              loading={isLoading}
              loadingText="Abriendo..."
            >
              <VStack gap={2}>
                <Box
                  p={3}
                  borderRadius="full"
                  bg="rgba(255, 107, 107, 0.1)"
                >
                  <LuImage size={32} color="#ff6b6b" />
                </Box>
                <Text fontWeight="500">Subir Imagen</Text>
                <Text fontSize="xs" color="gray.500">
                  JPG, PNG, WebP • Max 5MB
                </Text>
              </VStack>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {value && (
        <Text fontSize="xs" color="gray.500" wordBreak="break-all">
          {value}
        </Text>
      )}
    </VStack>
  );
}
