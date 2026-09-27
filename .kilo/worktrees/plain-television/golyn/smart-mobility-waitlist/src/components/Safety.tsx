const SAFETY_FEATURES = [
  {
    icon: '🪪',
    title: 'Driver verification',
    description: 'Every driver completes ID, license and vehicle checks before their first ride.',
  },
  {
    icon: '📍',
    title: 'Live GPS tracking',
    description: 'Your route is tracked in real-time. Share your trip with trusted contacts.',
  },
  {
    icon: '⭐',
    title: 'Two-way ratings',
    description: 'Drivers and riders rate each other. Bad actors get removed fast.',
  },
  {
    icon: '🚨',
    title: 'Emergency SOS',
    description: 'One tap sends your location to emergency contacts and our support team.',
  },
]

export default function Safety() {
  return (
    <>
      {/* Safety Section */}
      <section id="safety" style={{
        background: 'var(--black)',
        padding: 'var(--section-pad)',
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 80,
          alignItems: 'center',
        }}>

          {/* Left: Copy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: 'var(--green)',
            }}>
              Safety First
            </span>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-1px',
              color: 'var(--white)',
            }}>
              Safety is<br />non-negotiable.
            </h2>
            <p style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: 'var(--text-muted)',
              maxWidth: 380,
            }}>
              We put our full effort into making every ride trustworthy —
              because your safety is our top priority, full stop.
            </p>
          </div>

          {/* Right: Feature Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}>
            {SAFETY_FEATURES.map((feature) => (
              <div key={feature.title} style={{
                background: 'var(--dark-card)',
                borderRadius: 'var(--radius)',
                padding: 20,
                border: '1px solid #2a2a2a',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-sm)',
                  background: '#222',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                }}>
                  {feature.icon}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)' }}>
                  {feature.title}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-muted)' }}>
                  {feature.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{
        background: 'var(--green)',
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        <div className="container" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}>
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-1.5px',
            color: 'var(--black)',
            maxWidth: 640,
          }}>
            Be first when Lagos rides together.
          </h2>
          <p style={{
            fontSize: 16,
            color: '#2a2a2a',
            lineHeight: 1.6,
            maxWidth: 480,
          }}>
            Early members get priority access, free rides and other exciting perks.
            We launch in Q4 — your spot is waiting.
          </p>
          <div style={{
            display: 'flex',
            gap: 0,
            marginTop: 8,
            width: '100%',
            maxWidth: 480,
          }}>
            <input
              type="email"
              placeholder="Enter Your Email Address"
              style={{
                flex: 1,
                padding: '14px 18px',
                fontSize: 14,
                border: 'none',
                borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)',
                outline: 'none',
                fontFamily: 'var(--font)',
                background: 'var(--white)',
                color: 'var(--black)',
              }}
            />
            <button style={{
              background: 'var(--black)',
              color: 'var(--white)',
              fontWeight: 700,
              fontSize: 14,
              padding: '14px 20px',
              borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
              whiteSpace: 'nowrap',
              transition: 'background 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#333' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--black)' }}
            >
              Subscribe to our email list
            </button>
          </div>
          <p style={{ fontSize: 12, color: '#444', marginTop: 4 }}>
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'var(--black)',
        borderTop: '1px solid #1f1f1f',
        padding: '60px 24px 32px',
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 48,
          marginBottom: 48,
        }}>

          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--white)' }}>Go</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--green)' }}>Lyn</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 220 }}>
              Lagos carpooling, done right. Built by Lagosians.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              {['𝕏', 'in', 'f', 'TikTok'].map((social) => (
                <div key={social} style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '1px solid #333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}>
                  {social}
                </div>
              ))}
            </div>
          </div>

          {/* Product */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--white)', marginBottom: 4 }}>
              Product
            </div>
            {['How It Works', 'For Drivers', 'For Riders', 'Safety'].map((link) => (
              <a key={link} href="#" style={{ fontSize: 13, color: 'var(--text-muted)', transition: 'color 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--white)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                {link}
              </a>
            ))}
          </div>

          {/* Company */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--white)', marginBottom: 4 }}>
              Company
            </div>
            {['About Us', 'Blog', 'Career', 'Press'].map((link) => (
              <a key={link} href="#" style={{ fontSize: 13, color: 'var(--text-muted)', transition: 'color 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--white)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                {link}
              </a>
            ))}
          </div>

          {/* Support */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--white)', marginBottom: 4 }}>
              Support
            </div>
            {['Help Centre', 'Contact Us', 'Privacy Policy', 'Terms of Use'].map((link) => (
              <a key={link} href="#" style={{ fontSize: 13, color: 'var(--text-muted)', transition: 'color 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--white)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="container" style={{
          borderTop: '1px solid #1f1f1f',
          paddingTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            © 2026 GoLyn Technologies Ltd. All rights reserved.
          </p>
        </div>

        <style>{`
          @media (max-width: 768px) {
            footer .container:first-child {
              grid-template-columns: 1fr 1fr !important;
            }
          }
        `}</style>
      </footer>
    </>
  )
}