'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/Header';
import Hero from './components/Hero';
import Platform from './components/Platform';
import Features from './components/Features';
import MobileAccess from './components/MobileAccess';
import HowItWorks from './components/HowItWorks';
import WhyChooseUs from './components/WhyChooseUs';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // If in PWA mode, redirect to student-entry
    if (window.matchMedia('(display-mode: standalone)').matches) {
      router.replace('/student-entry');
    }
  }, [router]);

  return (
    <>
      <Header />
      <Hero />
      <Platform />
      <Features />
      <MobileAccess />
      <HowItWorks />
      <WhyChooseUs />
      <FAQ />
      <Footer />
      <ThemeToggle />
    </>
  );
}