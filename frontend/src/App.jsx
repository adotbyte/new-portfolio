import React, { Suspense, lazy } from 'react';
import {MemoryRouter, Routes, Route } from 'react-router-dom';

// 1. MAKE SURE THIS LINE EXISTS:
import Navbar from './components/Navbar'; 
import AboutMe from './components/AboutMe';

// Import your other components too...
const Skills = lazy(() => import('./components/Skills'));
const Contact = lazy(() => import('./components/Contact'));
const Footer = lazy(() => import('./components/Footer'));
const Privacy = lazy(() => import('./components/Privacy'));
const Chatbot = lazy(() => import('./components/Chatbot'));

export default function App() {
  return (
    <MemoryRouter 
      future={{ 
        v7_startTransition: true, 
        v7_relativeSplatPath: true 
      }}
      >
      {/* Changed bg-light to bg-white to match your AboutMe background */}
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar /> 

        {/* REMOVED "container" and "mb-5 mt-4" */}
        {/* Added "w-full" to ensure it uses the whole width */}
        <main className="flex-grow w-full">
          <Routes>
            <Route path="/" element={<AboutMe />} />
            <Route path="Portfolio" element={<Skills />} />
            <Route path="Contact" element={<Contact />} />
            <Route path="Privacy" element={<Privacy />} />
          </Routes>
        </main>

        <Footer />
        <Chatbot />
      </div>
    </MemoryRouter>
  );
}