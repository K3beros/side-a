import './index.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Waitlist from './components/Waitlist'
import Safety from './components/Safety'

function App() {
  return (
    <div style={{ background: 'var(--black)', minHeight: '100vh' }}>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Waitlist />
       <Safety />
    </div>
  )
}

export default App