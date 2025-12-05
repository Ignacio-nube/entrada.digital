import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: {
            value: { _light: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", _dark: "{colors.gray.900}" }
          },
          subtle: {
            value: { _light: "{colors.gray.50}", _dark: "{colors.gray.800}" }
          }
        }
      }
    }
  },
  globalCss: {
    body: {
      bg: "bg",
      backgroundAttachment: "fixed",
      minHeight: "100vh"
    }
  }
})

export const system = createSystem(defaultConfig, config)
