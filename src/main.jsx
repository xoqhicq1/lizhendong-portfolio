import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import StockTool from './StockTool.jsx';
import './styles.css';

const CurrentApp = window.location.pathname.startsWith('/stock') ? StockTool : App;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CurrentApp />
  </React.StrictMode>,
);
