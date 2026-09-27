import { useState } from 'react'

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'For Drivers', href: '#for-drivers' },
  { label: 'For Riders', href: '#for-riders' },
  { label: 'Safety', href: '#safety' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: 'var(--white)',
      borderBottom: '1px solid #1f1f1f',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--black)', letterSpacing: '-0.5px' }}>GoLyn</span>
          <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--green)', letterSpacing: '-0.5px' }}>Ride</span>
        </div>

        {/* Desktop Nav Links */}
        <div className="desktop-nav" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)', transition: 'color 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--black)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <a
          href="#for-drivers"
          className="desktop-nav"
          style={{ background: 'var(--green)', color: 'var(--black)', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 'var(--radius-sm)', display: 'inline-block' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-dark)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--green)' }}
        >
          Join Waitlist
        </a>

        {/* Mobile Hamburger */}
        <button
          className="mobile-nav"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', color: 'var(--white)', fontSize: 22, padding: 4 }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-nav" style={{
          background: 'var(--dark)',
          padding: '16px 24px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{ fontSize: 16, fontWeight: 500, color: 'var(--white)' }}
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              background: 'var(--green)',
              color: 'var(--black)',
              fontWeight: 700,
              fontSize: 15,
              padding: '12px 20px',
              borderRadius: 'var(--radius-sm)',
              marginTop: 8,
              display: 'block',
              width: '100%',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Join Waitlist
          </button>
        </div>
      )}

      <style>{`
        .desktop-nav { display: flex; }
        .mobile-nav { display: none; }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex; }
        }
      `}</style>
    </nav>
  )
}