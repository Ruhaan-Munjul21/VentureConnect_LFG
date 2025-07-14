import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect Biotech Startups to Capital
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            VentriLinks uses AI to match biotech startups with the right VCs. 
            Get personalized introductions to investors actively seeking companies like yours.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/get-matched"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-block text-center"
            >
              Get Matched Now
            </Link>
            <button
              onClick={() => navigate('/team')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold border border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Meet Our Team
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl mb-2">🚀</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Matching</h3>
              <p className="text-gray-600">Our AI analyzes thousands of VCs to find your perfect matches</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Results</h3>
              <p className="text-gray-600">Get matched with VCs in 24-48 hours</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Confidential</h3>
              <p className="text-gray-600">Your information is protected and never shared without permission</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;