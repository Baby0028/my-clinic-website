import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- Firebase Imports ---
// (These are the required Firebase SDKs for the app)
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  Timestamp,
  setDoc,
  doc
} from 'firebase/firestore';

// --- Icon Imports ---
// (Using lucide-react for modern, clean icons)
import { 
  Menu, 
  X, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  AlertCircle,
  Stethoscope,
  Apple,
  Award,
  BookOpen,
  Quote,
  Sparkles, // For cosmetic
  Brain, // For nutrition/mind
  Scan, // For UPI
  Clipboard // For copy
} from 'lucide-react';

// --- Firebase Configuration & App Initialization ---

// These global variables are expected to be injected by the environment.
// For a *real* build, you will replace these with Environment Variables.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase
let app;
let auth;
let db;

if (firebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.error("Error initializing Firebase:", e);
  }
}

// --- Main App Component ---

export default function App() {
  const [currentPage, setCurrentPage] =useState('home');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState(null);

  // Effect for Firebase Authentication
  useEffect(() => {
    if (!auth) {
      console.log("Firebase not configured. Booking functionality will be disabled.");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthReady(true);
      } else {
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
          } else {
            await signInAnonymously(auth);
          }
        } catch (error) {
          console.error("Error signing in:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // --- Page Rendering Logic ---
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'dermatology':
        return <DermatologyPage setCurrentPage={setCurrentPage} />;
      case 'nutrition':
        return <NutritionPage setCurrentPage={setCurrentPage} />;
      case 'booking':
        return <BookingPage db={db} userId={userId} isAuthReady={isAuthReady} />;
      case 'discovery':
        return <DiscoveryCallPage db={db} userId={userId} isAuthReady={isAuthReady} />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="font-sans bg-white min-h-screen text-gray-800">
      <style>
        {`
          /* Applying custom fonts via CSS */
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700;800;900&display=swap');
          
          .font-serif { font-family: 'Playfair Display', serif; }
          .font-sans { font-family: 'Inter', sans-serif; }
          
          /* Custom gradient for the site */
          .soft-gradient {
            background: linear-gradient(135deg, #FFF0E6, #E0F7FA); /* Soft Peach to Soft Cyan */
          }

          /* Custom glassmorphism */
          .glass-card {
            background: rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.18);
          }

          /* Smooth scroll */
          html {
            scroll-behavior: smooth;
          }
        `}
      </style>
      
      <Header setCurrentPage={setCurrentPage} />
      <main>
        {renderPage()}
      </main>
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}

// --- Header & Navigation ---

function Header({ setCurrentPage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', page: 'home' },
    { name: 'Dermatology', page: 'dermatology' },
    { name: 'Nutrition', page: 'nutrition' },
    { name: 'Book Appointment', page: 'booking' },
    { name: 'Discovery Call', page: 'discovery' },
    { name: 'Contact', page: 'contact' },
  ];

  const handleNavClick = (page) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  return (
    <header className="sticky top-0 z-50 glass-card shadow-sm">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div 
          className="text-2xl font-serif font-bold text-gray-900 cursor-pointer"
          onClick={() => handleNavClick('home')}
        >
          Dr. Pratikshya K. Padhy
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-6">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => handleNavClick(link.page)}
              className="text-gray-700 hover:text-cyan-600 transition-colors"
            >
              {link.name}
            </button>
          ))}
          <button
            onClick={() => handleNavClick('booking')}
            className="ml-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium py-2 px-5 rounded-full shadow-lg transition-transform hover:scale-105"
          >
            Book Now
          </button>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white/90 backdrop-blur-md shadow-lg py-4">
          <div className="container mx-auto px-6 flex flex-col space-y-4">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => handleNavClick(link.page)}
                className="text-gray-700 hover:text-cyan-600 text-left py-2"
              >
                {link.name}
              </button>
            ))}
            <button
              onClick={() => handleNavClick('booking')}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium py-3 px-6 rounded-full shadow-lg"
            >
              Book Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

// --- Page Components ---

// --- Home Page ---
function HomePage({ setCurrentPage }) {
  return (
    <div>
      {/* Hero Section */}
      <section className="soft-gradient py-20 md:py-32">
        <div className="container mx-auto px-6 grid md:grid-cols-2 items-center gap-12">
          <div className="flex flex-col space-y-6">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 leading-tight">
              Holistic Skin & Health Starts Here.
            </h1>
            <p className="text-lg text-gray-700 max-w-lg">
              Dr. Pratikshya K. Padhy combines modern dermatology with clinical nutrition to provide care that heals from the inside out.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <button
                onClick={() => setCurrentPage('booking')}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105"
              >
                Book an Appointment
              </button>
              <button
                onClick={() => setCurrentPage('dermatology')}
                className="bg-white/50 border border-cyan-300 text-cyan-700 font-semibold py-3 px-8 rounded-full shadow-sm transition-transform hover:scale-105"
              >
                Learn More
              </button>
            </div>
          </div>
          <div className="hidden md:block relative">
            <img
              src="https://images.unsplash.com/photo-1559839734-66f8e7b10a4b?auto=format&fit=crop&w=500&h=500&q=80"
              alt="Dr. Pratikshya K. Padhy"
              className="rounded-full shadow-2xl z-10 relative object-cover w-[500px] h-[500px]"
              onError={(e) => { e.target.src = 'https://placehold.co/500x500/E0F7FA/3AA0A7?text=Dr.+P.&font=playfairdisplay'; e.target.onerror = null; }}
            />
            <div className="absolute -top-4 -left-4 w-52 h-52 bg-peach-200/50 rounded-full"></div>
            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-cyan-200/50 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
          <span className="text-cyan-600 font-semibold">Meet The Doctor</span>
          <h2 className="text-4xl font-serif font-bold mt-2 mb-6">
            Dr. Pratikshya Kumari Padhy
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            As a Dermatologist and Clinical Nutritionist with a belief in a dual approach to wellness,
            I understand that beautiful skin is not just about external treatments; it's a
            reflection of your internal health. My practice is dedicated to providing
            you with comprehensive, personalized care plans that address root causes, not just symptoms.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="glass-card p-6 rounded-2xl shadow-lg text-left">
              <Award className="text-cyan-600 mb-3" size={32} />
              <h3 className="text-xl font-serif font-bold mb-2">Dermatologist</h3>
              <p className="text-gray-700">Expert diagnosis and treatment for all skin, hair, and nail conditions using evidence-based methods.</p>
            </div>
            <div className="glass-card p-6 rounded-2xl shadow-lg text-left">
              <Apple className="text-peach-600 mb-3" size={32} />
              <h3 className="text-xl font-serif font-bold mb-2">Clinical Nutritionist</h3>
              <p className="text-gray-700">Personalized dietary plans to manage health conditions, optimize wellness, and nourish your skin.</p>
            </div>
            <div className="glass-card p-6 rounded-2xl shadow-lg text-left">
              <BookOpen className="text-blue-600 mb-3" size={32} />
              <h3 className="text-xl font-serif font-bold mb-2">Medical Foundation</h3>
              <p className="text-gray-700">
                Completed her MBBS, providing a comprehensive foundation in medical science, diagnostics, and patient care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 soft-gradient">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-cyan-600 font-semibold">What We Offer</span>
            <h2 className="text-4xl font-serif font-bold mt-2">
              Our Core Services
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <ServiceCard
              imageUrl="https://images.unsplash.com/photo-1616394584738-04e4fb31f703?auto=format&fit=crop&w=800&q=80"
              title="Advanced Dermatology"
              description="From acne and eczema to advanced cosmetic procedures, receive expert care tailored to your unique skin type."
              featureList={['Evidence-based treatments', 'Personalized skin mapping', 'Cosmetic consultations']}
              onClick={() => setCurrentPage('dermatology')}
            />
            <ServiceCard
              imageUrl="https://images.unsplash.com/photo-1498837167922-ddd275259159?auto=format&fit=crop&w=800&q=80"
              title="Clinical Nutrition"
              description="Unlock your body's potential with nutrition plans that target inflammation, boost immunity, and promote radiant skin."
              featureList={['Gut-skin axis optimization', 'Personalized meal plans', 'Holistic wellness focus']}
              onClick={() => setCurrentPage('nutrition')}
            />
          </div>
        </div>
      </section>
      
      {/* Discovery Call CTA Section */}
      <DiscoveryCallCTA setCurrentPage={setCurrentPage} />
      
      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-cyan-600 font-semibold">Patient Stories</span>
            <h2 className="text-4xl font-serif font-bold mt-2">
              Words of Wellness
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Dr. Padhy didn't just give me creams; she changed my diet and my skin has never been clearer. Her holistic approach truly works."
              name="A. Sharma"
            />
            <TestimonialCard
              quote="I struggled with hair loss for years. Her combination of treatment and nutritional guidance made a visible difference in months."
              name="R. Singh"
            />
            <TestimonialCard
              quote="The Discovery Call was so insightful. Finally, a doctor who listens and connects the dots between my diet and my skin issues."
              name="P. James"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ imageUrl, title, description, featureList, onClick }) {
  return (
    <div 
      className="glass-card rounded-2xl shadow-lg cursor-pointer transition-transform duration-300 hover:-translate-y-2 overflow-hidden"
      onClick={onClick}
    >
      <img 
        src={imageUrl} 
        alt={title} 
        className="w-full h-56 object-cover"
        onError={(e) => { e.target.src = `https://placehold.co/800x400/E0F7FA/3AA0A7?text=${title.replace(' ', '+')}&font=playfairdisplay`; e.target.onerror = null; }}
      />
      <div className="p-6 md:p-8">
        <h3 className="text-2xl font-serif font-bold mb-3">{title}</h3>
        <p className="text-gray-700 mb-5">{description}</p>
        <ul className="space-y-2 mb-6">
          {featureList.map((feature, index) => (
            <li key={index} className="flex items-center text-gray-800 font-medium">
              <CheckCircle size={18} className="text-cyan-600 mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <span className="text-cyan-600 font-semibold flex items-center group">
          Learn More <ArrowRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </div>
  );
}

function TestimonialCard({ quote, name }) {
  return (
    <div className="glass-card p-6 rounded-2xl shadow-lg">
      <Quote className="text-cyan-400 mb-4" size={32} />
      <p className="text-gray-700 italic mb-4">"{quote}"</p>
      <p className="font-semibold text-gray-900">{name}</p>
    </div>
  );
}

function DiscoveryCallCTA({ setCurrentPage }) {
  return (
    <section id="discovery-cta" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="soft-gradient rounded-2xl p-12 md:p-16 shadow-xl flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-3">Start with a Discovery Call</h2>
            <p className="text-lg text-gray-700 max-w-2xl">
              Not sure where to begin? Schedule a 20-minute introductory call to discuss your health goals with Dr. Padhy.
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('discovery')}
            className="flex-shrink-0 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105"
          >
            Book Your Call
          </button>
        </div>
      </div>
    </section>
  );
}

// --- Dermatology Page ---
function DermatologyPage({ setCurrentPage }) {
  const conditions = [
    'Acne (adult and adolescent)',
    'Rosacea and Redness',
    'Eczema, Psoriasis, and Dermatitis',
    'Hair Loss (Alopecia)',
    'Pigmentation Disorders (Melasma, Vitigo)',
    'Skin Allergies & Nail Disorders'
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative soft-gradient py-24 md:py-32 flex items-center">
        <div className="container mx-auto px-6 z-10">
          <span className="text-cyan-600 font-semibold">Service</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold my-4 max-w-2xl">
            Advanced Dermatology
          </h1>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed max-w-2xl">
            Our dermatological services are rooted in medical science and tailored to your individual needs. We believe in treating the skin as an integral part of your body's entire system.
          </p>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1512290924970-689269ace38c?auto=format&fit=crop&w=1000&q=80" 
          alt="Dermatology Treatment" 
          className="absolute top-0 right-0 w-full h-full object-cover opacity-20 md:opacity-100 md:w-1/2"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </section>

      {/* Content Section */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Conditions We Treat */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h2 className="text-4xl font-serif font-bold mb-6">Conditions We Treat</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Dr. Padhy provides expert diagnosis and treatment for a wide range of acute and chronic skin conditions. We prioritize finding the root cause to create a lasting solution.
              </p>
              <button
                onClick={() => setCurrentPage('booking')}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105"
              >
                Book a Consultation
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {conditions.map((condition) => (
                <div key={condition} className="glass-card p-4 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <CheckCircle size={18} className="text-cyan-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-800 font-medium">{condition}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cosmetic Dermatology */}
          <div className="soft-gradient rounded-2xl p-12 md:p-16 shadow-xl flex flex-col md:flex-row items-center gap-12">
            <div className="flex-shrink-0 w-24 h-24 bg-white/50 rounded-full flex items-center justify-center">
              <Sparkles size={40} className="text-peach-600" />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">Cosmetic Dermatology</h2>
              <p className="text-lg text-gray-700 max-w-3xl">
                We also offer cosmetic dermatology consultations to help you achieve your aesthetic goals. Our philosophy is to enhance your natural beauty through safe, effective, and minimally invasive procedures, always discussed in the context of your overall skin health.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// --- Nutrition Page ---
function NutritionPage({ setCurrentPage }) {
  const focusAreas = [
    'Anti-inflammatory diets for skin',
    'Gut-skin axis connection',
    'Personalized meal plans',
    'Nutritional support for hormones',
    'Identifying food sensitivities',
    'Optimizing diet for healthy aging'
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative soft-gradient py-24 md:py-32 flex items-center">
        <div className="container mx-auto px-6 z-10">
          <span className="text-peach-600 font-semibold">Service</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold my-4 max-w-2xl">
            Clinical Nutrition
          </h1>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed max-w-2xl">
            What you eat directly impacts your skin's health, your energy levels, and your body's ability to heal. Our clinical nutrition services are designed to create a personalized roadmap to wellness, starting from your plate.
          </p>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1543362906-ac927e6a5641?auto=format&fit=crop&w=1000&q=80" 
          alt="Clinical Nutrition" 
          className="absolute top-0 right-0 w-full h-full object-cover opacity-20 md:opacity-100 md:w-1/2"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </section>

      {/* Content Section */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Focus Areas */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h2 className="text-4xl font-serif font-bold mb-6">Our Focus Areas</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We move beyond one-size-fits-all diets to create a plan that is unique to your body, lifestyle, and health goals. We believe food is medicine.
              </p>
              <button
                onClick={() => setCurrentPage('discovery')}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105"
              >
                Book a Discovery Call
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {focusAreas.map((area) => (
                <div key={area} className="glass-card p-4 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <CheckCircle size={18} className="text-cyan-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-800 font-medium">{area}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Our Approach */}
          <div className="soft-gradient rounded-2xl p-12 md:p-16 shadow-xl flex flex-col md:flex-row items-center gap-12">
            <div className="flex-shrink-0 w-24 h-24 bg-white/50 rounded-full flex items-center justify-center">
              <Brain size={40} className="text-peach-600" />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">Our Approach: The Gut-Skin Axis</h2>
              <p className="text-lg text-gray-700 max-w-3xl">
                Through targeted dietary changes and lifestyle modifications, we will work together to reduce inflammation, balance your body, and build a foundation for lasting health. A healthy gut is the foundation for radiant skin.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// --- Booking Page ---
function BookingPage({ db, userId, isAuthReady }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Generate 15 upcoming dates
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 15; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  // Define evening slots (6 PM to 10 PM IST)
  // Slots are 18:00, 19:00, 20:00, 21:00
  const timeSlots = ['18:00', '19:00', '20:00', '21:00'];

  // --- Firestore Logic ---
  const publicAppointmentsPath = `artifacts/${appId}/public/data/appointments`;

  // Listen for real-time updates to booked slots
  useEffect(() => {
    if (!db || !isAuthReady) return;

    // Query for appointments in the 15-day window
    const today = new Date();
    const _endDate = new Date(today);
    _endDate.setDate(today.getDate() + 15);

    const q = query(
      collection(db, publicAppointmentsPath),
      where("bookingTimestamp", ">=", Timestamp.fromDate(today))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const slots = snapshot.docs.map(doc => doc.data().slotId);
      setBookedSlots(slots);
    }, (err) => {
      console.error("Error fetching booked slots:", err);
      setError("Could not load available slots. Please refresh.");
    });

    return () => unsubscribe();
  }, [db, isAuthReady, publicAppointmentsPath]);

  const isSlotBooked = (date, time) => {
    const slotId = `${date.toISOString().split('T')[0]}T${time}`;
    return bookedSlots.includes(slotId);
  };
  
  const handleBooking = async (e) => {
    e.preventDefault();
    if (!db || !userId) {
      setError("Cannot connect to booking system. Please refresh.");
      return;
    }
    if (!selectedTime) {
      setError("Please select a time slot.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    const slotId = `${dateStr}T${selectedTime}`;
    
    const bookingTimestamp = new Date(`${dateStr}T${selectedTime}:00`); // Assumes local time is IST for simplicity
    
    try {
      // Create appointment document
      const apptData = {
        slotId,
        date: dateStr,
        time: selectedTime,
        patientName: name,
        patientEmail: email,
        bookedBy: userId,
        bookedAt: Timestamp.now(),
        bookingTimestamp: Timestamp.fromDate(bookingTimestamp)
      };

      // Use setDoc with slotId as a unique ID to prevent double-booking
      await setDoc(doc(db, publicAppointmentsPath, slotId), apptData);

      // --- Send Email Confirmation ---
      const formattedDate = selectedDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      });
      
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'appointment',
            name: name,
            email: email,
            date: formattedDate,
            time: selectedTime,
          }),
        });
      } catch (emailError) {
        console.warn("Booking was successful, but email notification failed:", emailError);
        // Don't show this error to the user, the booking still worked.
      }
      // ---------------------------------
      
      setSuccess(`Appointment confirmed for ${name} on ${formattedDate} at ${selectedTime} IST. Please check your email for payment details and the meeting link.`);
      
      // Reset form
      setSelectedTime(null);
      setName('');
      setEmail('');

    } catch (err) {
      console.error("Error booking appointment:", err);
      setError("This slot may have just been booked. Please try another slot.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-24 soft-gradient">
      <div className="container mx-auto px-6">
        <h1 className="text-5xl font-serif font-bold text-center mb-4">Book an Appointment</h1>
        <p className="text-lg text-gray-700 text-center mb-12 max-w-2xl mx-auto">
          Schedule your <span className="font-bold">₹500</span> evening consultation. All times are in India Standard Time (IST).
          Available slots are from 6:00 PM to 10:00 PM.
        </p>

        <div className="glass-card max-w-4xl mx-auto p-6 md:p-10 rounded-2xl shadow-lg">
          {/* Date Scroller */}
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold mb-4">1. Select a Date</h2>
            <div className="flex space-x-3 overflow-x-auto py-3">
              {availableDates.map((date) => {
                const isSelected = selectedDate.toDateString() === date.toDateString();
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`flex-shrink-0 w-24 p-4 rounded-lg text-center transition-all duration-200 ${
                      isSelected
                        ? 'bg-cyan-600 text-white shadow-lg scale-105'
                        : 'bg-white/50 hover:bg-white'
                    }`}
                  >
                    <span className="font-semibold text-sm block">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="font-bold text-2xl block my-1">
                      {date.getDate()}
                    </span>
                    <span className="font-semibold text-sm block">
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots */}
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold mb-4">2. Select a Time</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {timeSlots.map((time) => {
                const isBooked = isSlotBooked(selectedDate, time);
                const isSelected = selectedTime === time;

                return (
                  <button
                    key={time}
                    onClick={() => !isBooked && setSelectedTime(time)}
                    disabled={isBooked}
                    className={`p-4 rounded-lg text-center font-semibold transition-all duration-200 ${
                      isBooked
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed line-through'
                        : isSelected
                        ? 'bg-cyan-600 text-white shadow-lg scale-105'
                        : 'bg-white/50 hover:bg-white'
                    }`}
                  >
                    {time} IST
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Booking Form */}
          {selectedTime && (
            <form onSubmit={handleBooking}>
              <h2 className="text-2xl font-serif font-bold mb-4">3. Your Details</h2>
              <p className="mb-6">
                You are booking for <span className="font-bold text-cyan-700">{selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</span> at <span className="font-bold text-cyan-700">{selectedTime} IST</span>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
              >
                {isLoading ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </form>
          )}

          {/* Messages */}
          {success && (
            <div className="mt-6 p-4 rounded-lg bg-green-100 text-green-800 flex items-center">
              <CheckCircle className="mr-3" />
              {success}
            </div>
          )}
          {error && (
            <div className="mt-6 p-4 rounded-lg bg-red-100 text-red-800 flex items-center">
              <AlertCircle className="mr-3" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Discovery Call Page ---
function DiscoveryCallPage({ db, userId, isAuthReady }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Generate 15 upcoming dates
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 15; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!name || !email || !message) {
      setError("Please fill out all fields.");
      return;
    }
    if (!selectedDate) {
        setError("Please select a preferred date.");
        return;
    }
    if (!db || !userId) {
      setError("Cannot connect to booking system. Please refresh.");
      return;
    }
    
    setIsLoading(true);
    
    // We can save this to a public path as well
    const discoveryCallPath = `artifacts/${appId}/public/data/discovery_calls`;
    const formattedDate = selectedDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    try {
      await addDoc(collection(db, discoveryCallPath), {
        name,
        email,
        message,
        preferredDate: formattedDate,
        preferredDateISO: selectedDate.toISOString().split('T')[0],
        bookedBy: userId,
        bookedAt: Timestamp.now(),
        status: 'pending_confirmation'
      });

      // --- Send Email Notification to Doctor & Patient ---
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'discovery',
            name: name,
            email: email,
            date: formattedDate,
            time: "To be confirmed", // We set a placeholder
          }),
        });
      } catch (emailError) {
        console.warn("Discovery call booking was successful, but email notification failed:", emailError);
      }
      // ---------------------------------
      
      setSuccess(true); // Move to success step
      // Reset form
      setName('');
      setEmail('');
      setMessage('');
      setSelectedDate(new Date());

    } catch (err) {
      console.error("Error submitting booking:", err);
      setError("There was an error submitting your booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="py-24 soft-gradient">
      <div className="container mx-auto px-6">
        <div className="glass-card max-w-3xl mx-auto p-6 md:p-10 rounded-2xl shadow-lg">
          
          {!success && (
            <>
              <h1 className="text-5xl font-serif font-bold text-center mb-4">Discovery Call</h1>
              <p className="text-lg text-gray-700 text-center mb-8">
                Start your journey with a 20-minute introductory call. We'll discuss your goals and see if we're a good fit.
              </p>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <textarea
                    placeholder="Briefly tell us what you'd like to discuss..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="4"
                    required
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  
                  {/* Date Scroller */}
                  <div className="pt-4">
                    <h2 className="text-xl font-serif font-bold mb-4">Select a Preferred Date</h2>
                    <div className="flex space-x-3 overflow-x-auto py-3">
                      {availableDates.map((date) => {
                        const isSelected = selectedDate.toDateString() === date.toDateString();
                        return (
                          <button
                            key={date.toISOString()}
                            type="button" // Important: prevent form submission
                            onClick={() => setSelectedDate(date)}
                            className={`flex-shrink-0 w-24 p-4 rounded-lg text-center transition-all duration-200 ${
                              isSelected
                                ? 'bg-cyan-600 text-white shadow-lg scale-105'
                                : 'bg-white/50 hover:bg-white'
                            }`}
                          >
                            <span className="font-semibold text-sm block">
                              {date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                            <span className="font-bold text-2xl block my-1">
                              {date.getDate()}
                            </span>
                            <span className="font-semibold text-sm block">
                              {date.toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105"
                >
                  {isLoading ? 'Submitting...' : 'Book My Call'}
                </button>
              </form>
            </>
          )}

          {/* Step 3: Success */}
          {success && (
            <div className="text-center p-8">
              <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
              <h1 className="text-4xl font-serif font-bold text-gray-900 mb-3">Request Received!</h1>
              <p className="text-lg text-gray-700">
                Your Discovery Call request for <span className="font-bold">{selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</span> has been sent.
              </p>
              <p className="text-lg text-gray-700 mt-2">
                Please check your email, <span className="font-bold">{email}</span>, for a confirmation. We will be in touch shortly to finalize a time.
              </p>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="mt-6 p-4 rounded-lg bg-red-100 text-red-800 flex items-center">
              <AlertCircle className="mr-3" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Contact Page ---
function ContactPage() {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Use mailto: for a simple, client-only contact form
  const handleSubmit = (e) => {
    e.preventDefault();
    const to = 'kshyapratik@gmail.com';
    const body = `Name: ${name}\n\Lessage: ${message}`;
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-serif font-bold mb-4">Get In Touch</h1>
          <p className="text-lg text-gray-700 mb-8">
            For general inquiries, please use the form below. Please note that medical advice cannot be provided via email.
            <br/>
            <span className="font-semibold">Do not use this form for emergencies.</span>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <textarea
              placeholder="Your Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="6"
              required
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Footer ---
function Footer({ setCurrentPage }) {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16">
      <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-2xl font-serif font-bold text-white mb-4">
            Dr. Pratikshya K. Padhy
          </h3>
          <p className="text-gray-400">
            Dermatologist & Clinical Nutritionist
            <br />
            Holistic Healing, Modern Medicine.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><button onClick={() => setCurrentPage('home')} className="hover:text-white">Home</button></li>
            <li><button onClick={() => setCurrentPage('dermatology')} className="hover:text-white">Dermatology</button></li>
            <li><button onClick={() => setCurrentPage('nutrition')} className="hover:text-white">Nutrition</button></li>
            <li><button onClick={() => setCurrentPage('contact')} className="hover:text-white">Contact</button></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Book a Session</h4>
          <ul className="space-y-2">
            <li><button onClick={() => setCurrentPage('booking')} className="hover:text-white">Book an Appointment</button></li>
            <li><button onClick={() => setCurrentPage('discovery')} className="hover:text-white">Schedule Discovery Call</button></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-6 mt-12 pt-8 border-t border-gray-700 text-center text-gray-500">
        &copy; {new Date().getFullYear()} Dr. Pratikshya K. Padhy. All rights reserved.
      </div>
    </footer>
  );
}