import React from 'react';
import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Courses from '../components/sections/Courses';
import Contact from '../components/sections/Contact';

const Home = () => {
  return (
    <div>
      <Hero />
      <About />
      <Courses />
      <Contact />
    </div>
  );
};

export default Home;