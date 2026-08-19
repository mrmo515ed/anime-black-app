import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './firebase';
import { installLocalServer } from './localServer';

// Bundled backend: intercept /api/* when running inside the Android APK (file://)
installLocalServer();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
