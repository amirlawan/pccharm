import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css' // Imports styles.css
import AOS from 'aos';
import 'aos/dist/aos.css';

// Initialize Animations
AOS.init({ duration: 800, easing: 'ease-in-out', once: true, offset: 50 });

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
