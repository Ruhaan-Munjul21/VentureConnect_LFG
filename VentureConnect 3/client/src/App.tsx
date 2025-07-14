import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './components/layout/navigation';
import Hero from './components/sections/hero';
import GetMatched from './pages/get-matched';
import ClientLogin from './pages/client-login';
import ClientDashboard from './pages/client-dashboard';

// Placeholder components for missing pages
const Home = () => (
  <div className="min-h-screen">
    <Navigation />
    <Hero />
  </div>
);

const Contact = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
      <p className="text-lg text-gray-600 mb-8">Get in touch with our team</p>
      <button 
        onClick={() => window.location.href = '/get-matched'}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Get Matched
      </button>
    </div>
  </div>
);

const Team = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Team</h1>
      <p className="text-lg text-gray-600 mb-8">Meet the VentriLinks team</p>
      <button 
        onClick={() => window.location.href = '/get-matched'}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Get Matched
      </button>
    </div>
  </div>
);

const NotFound = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-8">The page you're looking for doesn't exist</p>
      <button 
        onClick={() => window.location.href = '/'}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go Home
      </button>
    </div>
  </div>
);

function App() {
  console.log('Available routes: /, /get-matched, /client/login, /client/dashboard, /contact, /team');
  
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/get-matched" element={<GetMatched />} />
          <Route path="/client/login" element={<ClientLogin />} />
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/team" element={<Team />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 