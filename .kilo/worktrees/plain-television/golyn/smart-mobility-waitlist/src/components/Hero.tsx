import SafeIcon from '../assets/safe-icon.svg';
import VerifiedIcon from '../assets/verified-driver.svg';
import RealtimeIcon from '../assets/real-time.svg';
import CommunityIcon from '../assets/community.svg';
import MatchedImage from '../assets/matched.png';




const STATS = [
  // { value: '1,248', label: 'On the waitlist' },
  { value: 'Lagos', label: 'First city' },
]

const BADGES = [
  { icon: VerifiedIcon, label: 'Verified drivers only' },
  { icon: RealtimeIcon, label: 'Real-time matching' },
  { icon: SafeIcon, label: 'Safe & transparent fares' },
  { icon: CommunityIcon, label: 'Community-driven' },
]

export default function Hero() {
  return (
    <section style={{
      background: 'var(--black)',
      paddingTop: 64,
    }}>
      {/* Main Hero */}
      <div className="container" style={{
         display: 'grid',
        gridTemplateColumns: '2fr 3fr',
        gap: 0,
        alignItems: 'stretch',
        padding: '0',
        maxWidth: 'var(--max-width)',
        margin: '0 auto',
      }}>

        {/* Left: Copy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '80px 24px 64px 24px' }}>
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 2,
            color: 'var(--green)',
            textTransform: 'uppercase',
          }}>
            Coming to you soon
          </span>

          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 60px)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-1.5px',
            color: 'var(--white)',
          }}>
            Your ride is<br />
            already going{' '}
            <span style={{ color: 'var(--green)' }}>your way</span>
          </h1>

          <p style={{
            fontSize: 16,
            lineHeight: 1.7,
            color: 'var(--text-muted)',
            maxWidth: 420,
          }}>
            Skip the junction hustle. GoLyn matches Lagos commuters with private
            car owners already heading their route — pay a fair split, ride in comfort.
          </p>

          <div>
            <button
              onClick={() => {
                const waitlistElement = document.getElementById('for-drivers')
                if (waitlistElement) {
                  waitlistElement.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              style={{
                background: 'var(--green)',
                color: 'var(--black)',
                fontWeight: 700,
                fontSize: 15,
                padding: '14px 28px',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'background 0.2s',
                cursor: 'pointer',
                border: 'none',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-dark)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--green)' }}
            >
              Join Waitlist →
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 40, paddingTop: 8 }}>
            {STATS.map((stat) => (
              <div key={stat.value}>
                <div style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: 'var(--green)',
                  letterSpacing: '-1px',
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  marginTop: 2,
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Hero Image */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: 600,
        }}>
          <img
            src={MatchedImage}
            alt="Woman walking to matched ride"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: '35% center',
              display: 'block',
            }}
          />
          {/* Left edge blend */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 120,
            height: '100%',
            background: 'linear-gradient(to right, var(--black), transparent)',
            pointerEvents: 'none',
          }} />
          {/* Bottom edge blend */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: 'linear-gradient(to bottom, transparent, var(--black))',
            pointerEvents: 'none',
          }} />
          {/* Top edge blend */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 60,
            background: 'linear-gradient(to bottom, var(--black), transparent)',
            pointerEvents: 'none',
          }} />
        </div>
      </div>
      {/* Badges Bar */}
      <div style={{
        background: 'var(--green)',
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '12px 40px',
          padding: '14px 24px',
        }}>
          {BADGES.map((badge) => (
            <div key={badge.label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--black)',
            }}>
              <img src={badge.icon} alt={badge.label} style={{ width: 20, height: 20 }} />
              {badge.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}