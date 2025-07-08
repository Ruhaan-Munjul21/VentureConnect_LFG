export default function GetMatched() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">VentriLinks</h1>
            <a href="/" className="text-blue-600 hover:text-blue-700">← Back to Home</a>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get Matched with VCs That Want to Fund You
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Our AI analyzes 2,000+ investor profiles to find VCs actively seeking startups like yours
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-600 mb-8">
            <span className="text-green-600">✓ Results in 24-48 hours</span>
            <span className="text-green-600">✓ Free sample matches</span>
            <span className="text-green-600">✓ No spam guarantee</span>
          </div>
        </div>
                
        {/* Better styled form container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-8 border-b border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Tell us about your startup
            </h3>
            <p className="text-gray-600">
              This information helps us find VCs that are actively looking for companies like yours
            </p>
          </div>
                    
          <div className="p-0 relative">
            {/* Overlay to hide Airtable branding */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-white z-10 pointer-events-none"></div>
                        
            <iframe
              src="https://airtable.com/embed/app768aQ07mCJoyu8/shrlLG8nRtAkRbXVn?backgroundColor=transparent"
              width="100%"
              height="800"
              frameBorder="0"
              style={{
                background: 'transparent',
                border: 'none'
              }}
            />
          </div>
        </div>
                
        {/* Trust indicators below */}
        <div className="text-center mt-8">
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <span>🔒 Confidential & Secure</span>
            <span>🚀 Used by 500+ biotech founders</span>
            <span>⚡ AI-powered matching</span>
          </div>
        </div>
      </div>
    </div>
  );
}
