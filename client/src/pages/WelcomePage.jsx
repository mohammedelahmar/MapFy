import { Link } from 'react-router-dom';
import MapPlaceholder from '../components/MapPlaceholder';
import '../styles/WelcomePage.css';

const WelcomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navbar with improved styling */}
      <header className="bg-white/95 backdrop-blur-sm shadow-md sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary-600 flex items-center">
            <svg className="w-6 h-6 mr-2 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            MapFy
          </h1>
          <div className="space-x-2 sm:space-x-4">
            <Link to="/login" className="px-4 sm:px-5 py-2 text-primary-600 font-medium hover:text-primary-800 transition-all duration-300">
              Log In
            </Link>
            <Link
              to="/register"
              className="px-4 sm:px-5 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 shadow-md hover:shadow-lg transition-all duration-300 btn-hover-effect"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section with updated layout and decorative elements */}
        <section className="relative container mx-auto px-4 md:px-8 py-16 md:py-24 overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-20 left-5 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          
          <div className="flex flex-col md:flex-row items-center relative z-10">
            <div className="md:w-1/2 md:pr-10 hero-text">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                Professional Topography Mapping <span className="text-primary-600">Made Simple</span>
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Create, analyze, and share detailed topographic maps with powerful tools and intuitive interface.
                Perfect for professionals, researchers, and outdoor enthusiasts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 hero-cta">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-lg font-medium shadow-lg hover:shadow-primary-500/20 hover:shadow-xl transition-all duration-300 btn-hover-effect text-center"
                >
                  Get Started for Free
                </Link>
                <a
                  href="#features"
                  className="px-8 py-4 border-2 border-primary-600 text-primary-600 rounded-md text-lg font-medium hover:bg-primary-50 transition-all duration-300 text-center group"
                >
                  Learn More
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline ml-2 transform group-hover:translate-y-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="md:w-1/2 mt-12 md:mt-0 hero-image">
              <div className="transform rotate-1 shadow-2xl rounded-2xl overflow-hidden border-4 border-white relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/10 to-transparent z-10"></div>
                <MapPlaceholder />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with improved cards */}
        <section id="features" className="bg-gray-50 py-20 md:py-32 relative overflow-hidden">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ 
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%234f46e5\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              backgroundPosition: '0 0',
              backgroundSize: '60px 60px'
            }}></div>
          </div>

          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">Key Features</h2>
            <p className="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto">
              Built for professionals who demand precision and performance
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="feature-card bg-white p-6 rounded-xl shadow-md border border-gray-100 group">
                <div className="bg-primary-100 p-2 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-primary-600 transition-colors duration-300">Interactive Map Editor</h3>
                <p className="text-gray-600">
                  Manipulate topographic data with powerful Mapbox integration. Draw points, lines, and polygons with precision.
                </p>
              </div>

              <div className="feature-card bg-white p-6 rounded-xl shadow-md border border-gray-100 group">
                <div className="bg-primary-100 p-2 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-primary-600 transition-colors duration-300">Import & Export</h3>
                <p className="text-gray-600">
                  Easily import KML, GPX, or GeoJSON files and export high-quality maps in multiple formats.
                </p>
              </div>

              <div className="feature-card bg-white p-6 rounded-xl shadow-md border border-gray-100 group">
                <div className="bg-primary-100 p-2 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-primary-600 transition-colors duration-300">Advanced Analytics</h3>
                <p className="text-gray-600">
                  Get detailed statistics about your maps, including area calculations, elevation data, and more.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action with improved background */}
        <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 py-20 text-white overflow-hidden">
          {/* Decorative wave pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 left-0 w-full">
              <path fill="#ffffff" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,181.3C960,181,1056,203,1152,202.7C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
          
          <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to create your first map?</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
              Join thousands of professionals who trust MapFy for their topographic mapping needs.
            </p>
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-primary-700 rounded-md text-lg font-medium hover:bg-gray-100 inline-block shadow-lg shadow-primary-900/20 hover:shadow-xl hover:shadow-primary-900/30 transition-all duration-300 btn-hover-effect"
            >
              Get Started Now
            </Link>
          </div>
        </section>
      </main>

      {/* Footer with improved layout and styling */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-10">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                MapFy
              </h3>
              <p className="text-gray-400">
                Professional topography mapping platform for everyone.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-primary-300">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-all duration-300">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-all duration-300">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-all duration-300">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-primary-300">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-all duration-300">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-all duration-300">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-all duration-300">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-primary-300">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-all duration-300 transform hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-all duration-300 transform hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-all duration-300 transform hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} MapFy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;