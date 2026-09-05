import React, { useState, useEffect } from "react";
import {
  Globe,
  Cpu,
  Bot,
  ChevronRight,
  Star,
  Mail,
  User,
  Wallet,
  CheckCircle,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  Twitter,
  Linkedin,
  Layers,
  FileCode,
  ArrowRight,
  Instagram
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CyberCanvas from "./components/CyberCanvas";
import ChatbotWidget from "./components/ChatbotWidget";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const getSafeHash = () => {
    try {
      if (typeof window !== "undefined" && window.location) {
        return window.location.hash || "";
      }
    } catch (e) {
      // Ignored
    }
    return "";
  };

  const [currentHash, setCurrentHash] = useState(getSafeHash());
  const [scrollY, setScrollY] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectScope: "AI Conversational Bots",
    budget: "$5k - $15k",
    customMessage: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [leadRecordId, setLeadRecordId] = useState("");

  // Track hash routing to cleanly load admin view obscurely
  useEffect(() => {
    const handleHashChange = () => {
      try {
        if (typeof window !== "undefined" && window.location) {
          setCurrentHash(window.location.hash || "");
        }
      } catch (e) {
        // Ignored
      }
    };
    try {
      if (typeof window !== "undefined") {
        window.addEventListener("hashchange", handleHashChange);
      }
    } catch (e) {
      // Ignored
    }
    return () => {
      try {
        if (typeof window !== "undefined") {
          window.removeEventListener("hashchange", handleHashChange);
        }
      } catch (e) {
        // Ignored
      }
    };
  }, []);

  // Track window scroll coordinates for parallax depth calculations
  useEffect(() => {
    const handleScroll = () => {
      try {
        if (typeof window !== "undefined") {
          setScrollY(window.scrollY);
        }
      } catch (e) {
        // Ignored
      }
    };

    try {
      if (typeof window !== "undefined") {
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
      }
    } catch (e) {
      // Ignored
    }

    return () => {
      try {
        if (typeof window !== "undefined") {
          window.removeEventListener("scroll", handleScroll);
        }
      } catch (e) {
        // Ignored
      }
    };
  }, []);

  // Form validations
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Full name designation is required.";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Endpoint email node is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = "Invalid cryptographic email format.";
    }

    if (formData.customMessage.trim().length > 1000) {
      errors.customMessage = "Maximum message buffer size limit exceeded (1000 chars).";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const resp = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          source: "FORM",
        }),
      });

      if (!resp.ok) throw new Error("Connection failed on route sync.");
      const data = await resp.json();

      if (data.success) {
        setSubmitSuccess(true);
        if (data.lead?.id) {
          setLeadRecordId(data.lead.id);
        }
        setFormData({
          name: "",
          email: "",
          projectScope: "AI Conversational Bots",
          budget: "$5k - $15k",
          customMessage: "",
        });
      }
    } catch (err) {
      console.error("Endpoint submission failure", err);
      setFormErrors({ form: "Transmission link failed. Please retry or contact direct." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // If in admin view mode, render administrative panel directly (secured view behind key login)
  if (currentHash === "#admin" || currentHash === "#admin-dashboard") {
    return (
      <>
        {/* Isolated Nav Core for Admin Panel Return */}
        <header className="fixed top-0 left-0 right-0 h-20 bg-[#0B0C10]/80 backdrop-blur-md border-b border-[#1F2833]/60 z-50 flex items-center justify-between px-6 sm:px-12">
          <a href="#" className="flex items-center gap-2.5 group">
            <span className="font-mono text-white text-lg font-black tracking-widest text-neon-glow uppercase">
              CODECRAFT <span className="text-[#66FCF1]"></span> TECHNOLOGY
            </span>
          </a>
          <a
            href="#"
            className="px-4 py-2 bg-[#1F2833] text-xs font-mono text-[#66FCF1] hover:text-white border border-[#66FCF1]/20 rounded-lg transition-all"
          >
            ← Public Terminal
          </a>
        </header>
        <AdminDashboard />
      </>
    );
  }

  // PUBLIC LANDING PAGE
  return (
    <div id="landing-stage-root" className="bg-[#0B0C10] text-[#C5C6C7] min-h-screen relative overflow-x-hidden font-sans selection:bg-[#66FCF1] selection:text-[#0B0C10]">
      
      {/* 1. STICKY BRAND HEADER */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-[#0B0C10]/75 backdrop-blur-lg border-b border-[#1F2833]/45 z-40 flex items-center justify-between px-6 sm:px-12 transition-all">
        <a href="#" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 rounded bg-[#0B1123] border border-[#0B1123]/50 flex items-center justify-center shrink-0">
            <img src="CODE.png" alt="" />
            <span className="absolute inset-0 rounded bg-[#0B1123]/20 blur-sm pointer-events-none" />
          </div>
          <span className="font-mono text-white text-md font-bold tracking-widest uppercase ml-1">
            CODECRAFT <span className="text-[#66FCF1]"></span>
          </span>
        </a>

        {/* Navigation nodes */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-mono tracking-widest uppercase">
          <button onClick={() => handleScrollTo("services")} className="hover:text-white transition-colors cursor-pointer">
            SERVICES
          </button>
          <button onClick={() => handleScrollTo("testimonials")} className="hover:text-white transition-colors cursor-pointer">
            TESTIMONIALS
          </button>
          <button onClick={() => handleScrollTo("work")} className="hover:text-white transition-colors cursor-pointer">
            OUR WORK
          </button>
          <button onClick={() => handleScrollTo("contact")} className="hover:text-white transition-colors cursor-pointer">
            CONTACT
          </button>
        </nav>

        {/* Hidden Gate triggers */}
        <div className="flex items-center gap-4">
          
          <button
            onClick={() => handleScrollTo("contact")}
            className="px-4 py-2 bg-gradient-to-tr from-[#1F2833] to-[#0D151E] hover:from-[#66FCF1] hover:to-[#66FCF1]/70 border border-[#66FCF1]/30 hover:border-transparent text-xs hover:text-[#0B0C10] font-mono font-bold uppercase rounded-lg tracking-wider transition-all duration-300 cursor-pointer shadow-[0_5px_15px_rgba(0,0,0,0.3)]"
          >
            Get Quote
          </button>
        </div>
      </header>

      {/* 2. DYNAMIC HERO SECTION (Canvas Matrix Backdrop Embedded) */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center py-24 px-6 md:px-12 overflow-hidden select-none">
        
        {/* Render interactive 3D particle nodes behind text */}
        <CyberCanvas />

        {/* Parallax Layer 1: Ambient Slow Scrolling Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none transition-transform duration-75 ease-out"
          style={{
            transform: `translateY(${scrollY * 0.15}px)`,
            backgroundImage: `
              linear-gradient(to right, #1F2833 1px, transparent 1px),
              linear-gradient(to bottom, #1F2833 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Ambient background blur circles syncing to parallax scroll */}
        <div 
          className="absolute w-96 h-96 rounded-full bg-[#66FCF1]/5 blur-[120px] pointer-events-none transition-transform duration-75 ease-out"
          style={{
            transform: `translate(calc(-40% + ${scrollY * 0.22}px), calc(-30% + ${scrollY * 0.1}px))`,
          }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full bg-teal-500/5 blur-[100px] pointer-events-none transition-transform duration-75 ease-out"
          style={{
            transform: `translate(calc(40% + ${scrollY * -0.3}px), calc(50% + ${scrollY * -0.15}px))`,
          }}
        />

       

        {/* Text Area layout (Subtle matching translate to create screen separation) */}
        <div 
          className="w-full max-w-5xl mx-auto text-center space-y-8 z-10 pt-12 transition-transform duration-75 ease-out"
          style={{
            transform: `translateY(${scrollY * 0.08}px)`,
          }}
        >
          
          {/* Cyber design badge indicator */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#1F2833]/80 border border-[#66FCF1]/30 text-[10px] font-mono text-[#66FCF1] uppercase tracking-widest shadow-[0_0_15px_rgba(102,252,241,0.15)]"
          >
            <Sparkles size={11} className="animate-pulse" />
            Next-Gen Web Development & AI Solutions
          </motion.div>

          {/* Heading with prominent Space Grotesk display */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl sm:text-6xl md:text-7xl font-sans font-black tracking-tight text-white uppercase leading-[1.08] text-neon-glow"
          >
            SMART WEB DEVELOPMENT <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#66FCF1] via-[#66FCF1]/80 to-teal-400">
               & AI SOLUTIONS
            </span>
          </motion.h1>

          {/* Subtext description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="max-w-2xl mx-auto text-sm sm:text-base text-gray-400 leading-relaxed font-normal"
          >
            At CODECRAFT  Technology , We build custom high-converting Websites, deploy intelligent AI chatbots to automate your customer support , and implement powerful SEO strategies designed to scale your business.
          </motion.p>

          {/* Call to Actions with framed animations */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => handleScrollTo("contact")}
              className="w-full sm:w-auto px-8 py-4 bg-[#66FCF1] text-[#0B0C10] font-bold font-sans text-sm tracking-wider uppercase rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_10px_30px_rgba(102,252,241,0.3)]"
            >
              Connect With Us
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => handleScrollTo("services")}
              className="w-full sm:w-auto px-8 py-4 bg-[#1F2833]/80 hover:bg-[#1F2833] border border-[#66FCF1]/20 hover:border-[#66FCF1]/40 text-white font-mono text-xs tracking-widest uppercase rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              View Packages
              <ChevronRight size={14} className="text-gray-500" />
            </button>
          </motion.div>
          
        </div>

        {/* Bottom anchor indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <div className="w-5 h-8 rounded-full border-2 border-gray-800 flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full bg-[#66FCF1]"
            />
          </div>
        </div>
      </section>

      {/* 3. CORE SERVICES GRID (3D cyber architecture layout) */}
      <section id="services" className="py-24 px-6 sm:px-12 bg-[#0B0C10] relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Section titles */}
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="font-mono text-xs text-[#66FCF1] uppercase tracking-widest block">OUR SERVICES</span>
            <h2 className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-white uppercase">
              SERVICES TO SCALE YOUR BUSINESS
            </h2>
            <div className="h-0.5 w-12 bg-[#66FCF1] mx-auto mt-2" />
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Design */}
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-[#1F2833]/30 border border-[#1F2833] rounded-2xl p-8 space-y-6 flex flex-col justify-between group hover:border-[#66FCF1]/30 transition-duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 bg-[#66FCF1]/5 text-[#66FCF1] border-l border-b border-[#1F2833] rounded-bl-xl font-mono text-xs">
                01
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#0B0C10] border border-[#66FCF1]/30 flex items-center justify-center">
                  <Globe className="text-[#66FCF1]" size={22} />
                </div>
                <h3 className="text-xl font-bold text-white uppercase font-sans tracking-wide">
                  WEBSITE DEVELOPMENT
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed font-light">
                  We build tailored, modern website designed to load lightning-fast, look beautiful on mobile devices, and convert visitors into long-term clients.
                </p>
              </div>

              {/* Specs array */}
              <ul className="space-y-2 border-t border-[#1F2833] pt-6 font-mono text-[11px] text-gray-500">
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-[#66FCF1]" /> Business & E-Commerce Sites </li>
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-[#66FCF1]" /> Landing Pages & Portfolios</li>
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-[#66FCF1]" /> Custom Web Applications</li>
              </ul>
            </motion.div>

            {/* Card 2: AI Bots */}
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-[#1F2833]/30 border border-[#1F2833] rounded-2xl p-8 space-y-6 flex flex-col justify-between group hover:border-[#66FCF1]/30 transition-duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 bg-[#66FCF1]/5 text-[#66FCF1] border-l border-b border-[#1F2833] rounded-bl-xl font-mono text-xs">
                02
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#0B0C10] border border-[#66FCF1]/30 flex items-center justify-center">
                  <Bot className="text-[#66FCF1]" size={22} />
                </div>
                <h3 className="text-xl font-bold text-white uppercase font-sans tracking-wide">
                  AI SOLUTIONS
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed font-light">
                  Automate your Business with intelligent chat agents running 24/7. Our bots organically qualify leads, schedule bookings, and handle customer support directly. 
                </p>
              </div>

              {/* Specs array */}
              <ul className="space-y-2 border-t border-[#1F2833] pt-6 font-mono text-[11px] text-gray-500">
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-[#66FCF1]" /> Custom AI Agents</li>
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-[#66FCF1]" /> Customer Support Automation</li>
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-[#66FCF1]" /> Appointment Booking System</li>
              </ul>
            </motion.div>

            {/* Card 3: Automation Workflows */}
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-[#1F2833]/30 border border-[#1F2833] rounded-2xl p-8 space-y-6 flex flex-col justify-between group hover:border-[#66FCF1]/30 transition-duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 bg-[#66FCF1]/5 text-[#66FCF1] border-l border-b border-[#1F2833] rounded-bl-xl font-mono text-xs">
                03
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#0B0C10] border border-[#66FCF1]/30 flex items-center justify-center">
                  <Layers className="text-[#66FCF1]" size={22} />
                </div>
                <h3 className="text-xl font-bold text-white uppercase font-sans tracking-wide">
                  GROWTH & MARKETING
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed font-light">
                  Scale your digital presence and capture high-intent traffic using targeted SEO optimization, data analytics setups, and fully managed business launch campaigns.
                </p>
              </div>

              {/* Specs array */}
              <ul className="space-y-2 border-t border-[#1F2833] pt-6 font-mono text-[11px] text-gray-500">
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-[#66FCF1]" /> Search Engine Optimization (SEO)</li>
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-[#66FCF1]" /> Lead Capture System</li>
                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-[#66FCF1]" /> Analytics & Conversion Setup </li>
              </ul>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 4. CLIENT TESTIMONIALS (Neon Light up hover cards) */}
      <section id="testimonials" className="py-24 px-6 sm:px-12 bg-[#0B0C10]/60 relative z-10 border-t border-b border-[#1F2833]/30">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="font-mono text-xs text-[#66FCF1] uppercase tracking-widest block font-bold">Feedback Grid</span>
            <h2 className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-white uppercase">
              CLIENT TESTIMONIALS
            </h2>
            <div className="h-0.5 w-12 bg-[#66FCF1] mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Reviews */}
            <div className="p-8 rounded-2xl bg-[#1F2833]/30 border border-[#1F2833] hover:border-[#66FCF1]/45 transition-all duration-300 relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full border border-[#66FCF1]/30 flex items-center justify-center font-bold bg-[#1F2833] text-white">
                  S.N
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm tracking-wide">Shimmer & Glow Luxary Salon</h4>
                  <p className="text-[10px] text-[#66FCF1] font-mono uppercase mt-0.5">AI APPOINTMENT BOT & WHATSAPP CRM </p>
                </div>
                <div className="ml-auto flex gap-0.5 text-[#66FCF1]">
                  {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" />)}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 font-light leading-relaxed">
                "The Whatsapp Automated booking bot they created handles all our festive season rushes flawlessly. Our clients love the instant slot confirmations,and our booking errors have dropped to zero."
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#1F2833]/30 border border-[#1F2833] hover:border-[#66FCF1]/45 transition-all duration-300 relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full border border-[#66FCF1]/30 flex items-center justify-center font-bold bg-[#1F2833] text-white">
                  L.T
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm tracking-wide">Lyra Technologies</h4>
                  <p className="text-[10px] text-[#66FCF1] font-mono uppercase mt-0.5">Custom Web Architecture</p>
                </div>
                <div className="ml-auto flex gap-0.5 text-[#66FCF1]">
                  {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" />)}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 font-light leading-relaxed">
                "The customized single-page 3D portal they engineered is stunning. Performance audits are perfect and users routinely praise the smooth interaction design."
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#1F2833]/30 border border-[#1F2833] hover:border-[#66FCF1]/45 transition-all duration-300 relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full border border-[#66FCF1]/30 flex items-center justify-center font-bold bg-[#1F2833] text-white">
                  R.S
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm tracking-wide">Dr. Sharma's Dental Care</h4>
                  <p className="text-[10px] text-[#66FCF1] font-mono uppercase mt-0.5">#d PATIENT PORTAL AND LEAD ENGINE</p>
                </div>
                <div className="ml-auto flex gap-0.5 text-[#66FCF1]">
                  {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" />)}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 font-light leading-relaxed">
                "Our new interactive 3D clinic website has completely transformed how patients book consultations.The Automated follow-up system helps us retain leads natively without manually calling every patient."
              </p>
            </div>
       
            <div className="p-8 rounded-2xl bg-[#1F2833]/30 border border-[#1F2833] hover:border-[#66FCF1]/45 transition-all duration-300 relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full border border-[#66FCF1]/30 flex items-center justify-center font-bold bg-[#1F2833] text-white">
                  L.T
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm tracking-wide">Apex Academy & Science  Tutorials</h4>
                  <p className="text-[10px] text-[#66FCF1] font-mono uppercase mt-0.5">AI STUDENT LEAD ENGINE & WHATSAPP BOT</p>
                </div>
                <div className="ml-auto flex gap-0.5 text-[#66FCF1]">
                  {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" />)}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 font-light leading-relaxed">
                "Managing parent inquiries during batch addmisions used to be a nightmare for our staff.This automated lead system qualifies student profiles ,shares fee structures, and books demo classes instantly on Whatsapp.Our enrollment rate shot up by 40% this term! "
              </p>
            </div>

          </div>
        </div>
      </section>


        {/* 5.Project Designs section */}
      <section id="work" className="py-24 px-6 sm:px-12 bg-[#0B0C10] relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Section titles */}
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="font-mono text-xs text-[#66FCF1] uppercase tracking-widest block">OUR WORK</span>
            <h2 className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-white uppercase">
              WEBSITES WE'VE DESIGNED 
            </h2>
            <div className="h-0.5 w-12 bg-[#66FCF1] mx-auto mt-2" />
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Design */}
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-[#1F2833]/30 border border-[#1F2833] rounded-2xl p-6 h-[320px] space-y-6 flex flex-col justify-between group hover:border-[#66FCF1]/30 transition-duration-300 relative overflow-hidden"
            >
              <div>
              <img src="aura-asthetics.png" alt="Aura Asthetics Website design" className="w-full h-56 object-cover rounded-xl mb-6"/>
              <h3 className="text-xl font-bold text-white uppercase font-sans tracking-wide text-center">
                BEAUTY AND SPA WEBSITE
              </h3>
              

              </div>
             
            </motion.div>

            {/* Card 2: Design */}
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-[#1F2833]/30 border border-[#1F2833] rounded-2xl p-6 h-[320px] space-y-6 flex flex-col justify-between group hover:border-[#66FCF1]/30 transition-duration-300 relative overflow-hidden"
            >
              <div>
              <img src="Vangaurd.png" alt="Construction Website Design" className="w-full h-56 object-cover rounded-xl mb-6"/>
              <h3 className="text-xl font-bold text-white uppercase font-sans tracking-wide text-center">
                CONSTRUCTION WEBSITE
              </h3>
              

              </div>
             
            </motion.div>

             {/* Card 3: Design */}
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-[#1F2833]/30 border border-[#1F2833] rounded-2xl p-6 h-[320px] space-y-6 flex flex-col justify-between group hover:border-[#66FCF1]/30 transition-duration-300 relative overflow-hidden"
            >
              <div>
              <img src="aura-collection.png" alt="Aura Collection Website design" className="w-full h-56 object-cover rounded-xl mb-6"/>
              <h3 className="text-xl font-bold text-white uppercase font-sans tracking-wide text-center">
                E-COMMERCE WEBSITE
              </h3>
              

              </div>
             
            </motion.div>
          </div>
        </div>
      </section>  


      {/* 5. CONTACT FORM (Beautiful input expansions with validates) */}
      <section id="contact" className="py-24 px-6 sm:px-12 bg-[#0B0C10] relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="font-mono text-xs text-[#66FCF1] uppercase tracking-widest block">System Input</span>
            <h2 className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-white uppercase">
              RESERVE YOUR SYSTEM BLUEPRINT
            </h2>
            <p className="max-w-md mx-auto text-xs text-gray-500 leading-relaxed font-light mt-1">
              Submit your project constraints below. We will run an automated analytical systems evaluation and dispatch onboarding specs.
            </p>
          </div>

          {/* Actual Form sheet */}
          <div className="bg-[#1F2833]/20 border border-[#1F2833]/60 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            
            {/* Cyber scanner ornament */}
            <div className="absolute inset-0 cyber-scanner opacity-10" />

            {submitSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-8"
              >
                <div className="inline-flex items-center justify-center p-4 bg-[#66FCF1]/15 border border-[#66FCF1]/30 rounded-2xl text-[#66FCF1] mb-2 shadow-[0_0_20px_rgba(102,252,241,0.2)]">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-white text-2xl font-black uppercase tracking-wide">Specification Serialized</h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed font-light">
                  Your project blueprint request metadata has been successfully indexed in our core CRM logs. Real-time onboarding dispatch sequences initiated.
                </p>
                <div className="max-w-xs mx-auto p-3 bg-[#0B0C10] border border-[#1F2833] rounded-xl font-mono text-xs text-gray-500 select-all">
                  Lead Checksum: <span className="text-[#66FCF1]">{leadRecordId || "processing..."}</span>
                </div>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="px-6 py-2.5 bg-[#1F2833] border border-[#1F2833] text-xs font-mono tracking-wider uppercase text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  Submit Alternative Spec
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10 font-mono text-xs">
                
                {/* Form general warning */}
                {formErrors.form && (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-xs">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                    {formErrors.form}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name input */}
                  <div className="space-y-2">
                    <label className="text-gray-400 block tracking-wider uppercase font-bold flex items-center gap-1.5">
                      <User size={12} className="text-gray-600" />
                      Client Designation
                    </label>
                    <input
                      type="text"
                      placeholder="Enter legal or corporate name..."
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        setFormErrors((prev) => ({ ...prev, name: "" }));
                      }}
                      className="w-full bg-[#0B0C10] border border-[#1F2833] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#66FCF1]/60 focus:ring-1 focus:ring-[#66FCF1]/30 transition-all font-mono"
                    />
                    {formErrors.name && (
                      <span className="text-red-400 text-[10px] tracking-wide block mt-1">{formErrors.name}</span>
                    )}
                  </div>

                  {/* Email input */}
                  <div className="space-y-2">
                    <label className="text-gray-400 block tracking-wider uppercase font-bold flex items-center gap-1.5">
                      <Mail size={12} className="text-gray-600" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="Enter active business email..."
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setFormErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      className="w-full bg-[#0B0C10] border border-[#1F2833] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#66FCF1]/60 focus:ring-1 focus:ring-[#66FCF1]/30 transition-all font-mono"
                    />
                    {formErrors.email && (
                      <span className="text-red-400 text-[10px] tracking-wide block mt-1">{formErrors.email}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Scope Selector */}
                  <div className="space-y-2">
                    <label className="text-gray-400 block tracking-wider uppercase font-bold flex items-center gap-1.5">
                      <FileCode size={12} className="text-gray-600" />
                      Client Requirement
                    </label>
                    <div className="relative">
                      <select
                        value={formData.projectScope}
                        onChange={(e) => setFormData({ ...formData, projectScope: e.target.value })}
                        className="w-full bg-[#0B0C10] border border-[#1F2833] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#66FCF1]/60 appearance-none font-mono font-medium"
                      >
                        <option value="Custom Web Applications">Custom Web Applications</option>
                        <option value="AI Conversational Bots">AI Conversational Bots</option>
                        <option value="Automated System Workflows">Automated System Workflows</option>
                        <option value="Other">Other / General Optimization</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-[10px] uppercase font-bold font-mono">
                        select
                      </div>
                    </div>
                  </div>

                  {/* Budget Selector */}
                  <div className="space-y-2">
                    <label className="text-gray-400 block tracking-wider uppercase font-bold flex items-center gap-1.5">
                      <Wallet size={12} className="text-gray-600" />
                      Investment Scale
                    </label>
                    <div className="relative">
                      <select
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full bg-[#0B0C10] border border-[#1F2833] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#66FCF1]/60 appearance-none font-mono font-medium"
                      >
                        <option value="Under $5k">Under 5k</option>
                        <option value="$5k - $15k">5k - 15k</option>
                        <option value="$15k - $50k">15k - 50k</option>
                        <option value="$50k+">50k+</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-[10px] uppercase font-bold font-mono">
                        select
                      </div>
                    </div>
                  </div>
                </div>

                {/* Requirements Message */}
                <div className="space-y-2">
                  <label className="text-gray-400 block tracking-wider uppercase font-bold">
                    Special Specifications (Optional)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe specific workflow automations or unique functional specifications..."
                    value={formData.customMessage}
                    onChange={(e) => {
                      setFormData({ ...formData, customMessage: e.target.value });
                      setFormErrors((prev) => ({ ...prev, customMessage: "" }));
                    }}
                    className="w-full bg-[#0B0C10] border border-[#1F2833] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#66FCF1]/60 focus:ring-1 focus:ring-[#66FCF1]/30 transition-all font-mono resize-none"
                  />
                  {formErrors.customMessage && (
                    <span className="text-red-400 text-[10px] tracking-wide block mt-1">{formErrors.customMessage}</span>
                  )}
                </div>

                {/* Submitting Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#66FCF1] to-[#66FCF1]/80 hover:brightness-110 active:scale-[0.99] transition-all text-[#0B0C10] font-bold text-xs uppercase tracking-widest cursor-pointer shadow-[0_5px_15px_rgba(102,252,241,0.25)] select-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Transmitting spec checksum..." : "Submit"}
                </button>

              </form>
            )}

            {/* Micro aesthetic stats */}
            <div className="mt-8 pt-6 border-t border-[#1F2833]/40 flex flex-wrap justify-between items-center text-[9px] text-[#C5C6C7] font-mono uppercase tracking-widest gap-2">
              <span className="flex items-center gap-1.5"><ShieldAlert size={10} className="text-[#66FCF1]" /> Handshake Verified</span>
              <span></span>
              <span>AES SSL active</span>
            </div>

          </div>

        </div>
      </section>

      {/* 6. MINIMALIST FOOTER & SOCIAL NODES */}
      <footer className="bg-[#0B0C10] border-t border-[#1F2833]/60 py-16 px-6 sm:px-12 relative z-10 text-xs text-gray-500 font-mono">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="space-y-4 col-span-1 md:col-span-2">
            <h4 className="text-white font-bold tracking-widest uppercase flex items-center gap-2">
              <span className="text-[#66FCF1]">//</span> CODECRAFT  TECHNOLOGY
            </h4>
            <p className="max-w-xs text-[11px] leading-relaxed text-gray-500">
            Premium digital growth agency building high-converting websites and intelligent whatsapp automation setups to help Indian businesses scale their daily appointments, bookings, and student enrollments.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="text-white text-[10px] font-bold uppercase tracking-widest">EXPLORE SYSTEMS</h5>
            <ul className="space-y-2 text-[11px] text-gray-500">
              <li><button onClick={() => handleScrollTo("hero")} className="hover:text-[#66FCF1] transition-colors cursor-pointer text-[11px]">Home</button></li>
              <li><button onClick={() => handleScrollTo("services")} className="hover:text-[#66FCF1] transition-colors cursor-pointer text-[11px]">Our Solutions</button></li>
              <li><button onClick={() => handleScrollTo("contact")} className="hover:text-[#66FCF1] transition-colors cursor-pointer text-[11px]">Book Consultation</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-white text-[10px] font-bold uppercase tracking-widest">CONNECT WITH US</h5>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/CODECRAFT ?igsh=MW1raG44dXZoNDZlOA==" className="p-2 border border-[#1F2833] hover:border-[#66FCF1] text-gray-400 hover:text-white rounded-lg transition-colors shadow" id="instagram-footer-link">
                <Instagram size={15} />
              </a>
              <a href="#" className="p-2 border border-[#1F2833] hover:border-[#66FCF1] text-gray-400 hover:text-white rounded-lg transition-colors shadow">
                <Twitter size={15} />
              </a>
              <a href="#" className="p-2 border border-[#1F2833] hover:border-[#66FCF1] text-gray-400 hover:text-white rounded-lg transition-colors shadow">
                <Linkedin size={15} />
              </a>
            </div>
            <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-wide">
              ESHTABLISHED 2026:<span className="text-[#66FCF1]">AMRAVATI</span>
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[#1F2833]/30 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-600 gap-4">
          <span>&copy; 2026 CODECRAFT  TECHNOLOGY | ALL RIGHTS RESERVED | DATA PRIVACY GAURANTEED</span>
          <a href="#admin" className="hover:text-[#000001] transition-colors uppercase tracking-widest flex items-center gap-1.5 font-bold">
            <ShieldAlert size={11} className="text-[#000001]" />
            
          </a>
        </div>
      </footer>

      {/* 7. FLOATING LEAD CAPTURE INTELLIGENT CHATBOT WIDGET */}
      <ChatbotWidget />

    </div>
  );
}
