
import About from "../../components/About/About";
import Hero from "../../components/Hero/Hero";
import Services from "../../components/Services/Services";
import "./HomePage.css";

const HomePage = () => {

  
  return (
    <main className='main-container'>
      <div className="absolute  flex justify-between z-[-100px]">
        <div className="bg-shape1 bg-teal opacity-50 bg-blur"></div>
        <div className="bg-shape2 bg-primary opacity-50 bg-blur"></div>
        <div className="bg-shape3 bg-purple opacity-50 bg-blur"></div>
      </div>
      <Hero />
      <Services />
      <About />
    </main>
  );
};

export default HomePage;
