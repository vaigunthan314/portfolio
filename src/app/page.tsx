'use client';

import dynamic from 'next/dynamic';
import SmoothScroll from '@/components/SmoothScroll';
import Navbar from '@/components/Navbar';
import CustomCursor from '@/components/CustomCursor';

const Hero = dynamic(() => import('@/components/Hero'), { ssr: false });
const Skills = dynamic(() => import('@/components/Skills'), { ssr: false });
const Experience = dynamic(() => import('@/components/Experience'), { ssr: false });
const Projects = dynamic(() => import('@/components/Projects'), { ssr: false });
const Education = dynamic(() => import('@/components/Education'), { ssr: false });
const Contact = dynamic(() => import('@/components/Contact'), { ssr: false });

export default function Home() {
  return (
    <SmoothScroll>
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>
    </SmoothScroll>
  );
}
