import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const originalError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('validateDOMNesting')) return;
  originalError(...args);
};

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
)
