import Footer from '@/components/Footer';
import Nav from '@/components/Nav';
import SmoothScroll from '@/components/providers/SmoothScroll';
import About from '@/components/sections/About';
import Achievements from '@/components/sections/Achievements';
import Contact from '@/components/sections/Contact';
import Education from '@/components/sections/Education';
import Experience from '@/components/sections/Experience';
import Hero from '@/components/sections/Hero';
import Projects from '@/components/sections/Projects';
import Skills from '@/components/sections/Skills';

/**
 * Section order follows the HR reading path: who → what they achieved → what
 * they built → what they can do → where they study → how to reach them.
 * Backgrounds alternate black / white to separate sections without decoration.
 */
export default function Page() {
  return (
    <SmoothScroll>
      <Nav />
      <main id="main">
        <Hero />
        <About />
        <Achievements />
        <Projects />
        <Skills />
        <Experience />
        <Education />
        <Contact />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
