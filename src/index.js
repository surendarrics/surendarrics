import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'

// Fonts are bundled with the site (no Google Fonts request)
import '@fontsource/titillium-web/400'
import '@fontsource/titillium-web/600'
import '@fontsource/titillium-web/700'
import '@fontsource/titillium-web/900'
import '@fontsource/titillium-web/600-italic'
import '@fontsource/titillium-web/700-italic'
import '@fontsource/chakra-petch/500'
import '@fontsource/chakra-petch/600'
import '@fontsource/chakra-petch/700'

import './index.css'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <Analytics />
  </React.StrictMode>
)
