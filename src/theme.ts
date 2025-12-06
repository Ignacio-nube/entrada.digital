import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        accent: {
          primary: { value: "#ff6b6b" },
          secondary: { value: "#ff8a80" },
          tertiary: { value: "#ffab40" },
          quaternary: { value: "#ff7043" },
          quinary: { value: "#ff5722" },
        }
      }
    },
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: {
            value: "#000000"
          },
          subtle: {
            value: "#0a0a0a"
          }
        },
        fg: {
          DEFAULT: {
            value: "#ffffff"
          },
          muted: {
            value: "#a1a1aa"
          }
        }
      }
    }
  },
  globalCss: {
    "html, body": {
      bg: "#000000",
      color: "#ffffff",
      minHeight: "100vh",
      fontFamily: "'Poppins', system-ui, sans-serif",
    },
    "::selection": {
      bg: "rgba(255, 107, 107, 0.4)",
      color: "white"
    },
    "::-webkit-scrollbar": {
      width: "8px",
    },
    "::-webkit-scrollbar-track": {
      bg: "#0a0a0a",
    },
    "::-webkit-scrollbar-thumb": {
      bg: "rgba(255, 107, 107, 0.5)",
      borderRadius: "4px",
    },
    "::-webkit-scrollbar-thumb:hover": {
      bg: "rgba(255, 107, 107, 0.8)",
    }
  }
})

export const system = createSystem(defaultConfig, config)
