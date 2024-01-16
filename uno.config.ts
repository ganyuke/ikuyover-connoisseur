import { defineConfig, presetUno, presetWebFonts, presetWind } from 'unocss'

export default defineConfig({
    shortcuts: {
        'card': 'bg-brand-card'
    },
    theme: {
        backgroundColor: {
            'brand-dark': '#121824',
            'brand-card': '#283356'
        }
    },
    presets: [
        presetWind(),
        presetUno(),
        presetWebFonts({
            provider: 'google', // default provider
            fonts: {
                // these will extend the default theme
                sans: [
                    {
                        name: 'Lato',
                        weights: ['300', '400', '900'],
                        italic: true,
                    }
                ],
            },
        })
    ],
})