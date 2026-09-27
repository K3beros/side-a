
const STEPS = [
  {
    icon: '🗺️',
    title: 'Set your route',
    description: 'Enter where you\'re going — Ojota to CMS, Ikeja to Lekki, or anywhere across Lagos. We know the routes.',
  },
  {
    icon: '⚡',
    title: 'Get matched instantly',
    description: 'We find a verified private car owner already heading your direction. No detours, no wahala — a natural match.',
  },
  {
    icon: '💸',
    title: 'Split the fare, ride easy',
    description: 'Pay your share of the ride upfront. The driver earns from their daily commute. Everyone wins, Lagos moves.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{
      background: 'var(--white)',
      padding: 'var(--section-pad)',
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 80,
        alignItems: 'center',
      }}>

        {/* Left: Copy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: 'var(--gray)',
            }}>
              How It Works
            </span>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-1px',
              color: 'var(--black)',
            }}>
              Three steps,<br />one smooth ride
            </h2>
            <p style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: 'var(--gray)',
              maxWidth: 400,
            }}>
              We digitise what Lagosians already do — just smarter, safer,
              and with zero junction anxiety.
            </p>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {STEPS.map((step) => (
              <div key={step.title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--black)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  flexShrink: 0,
                }}>
                  {step.icon}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--black)' }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--gray)' }}>
                    {step.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Ride Preview Card */}
        {/* Right: Ride Preview Card */}
        <div style={{
          background: 'var(--black)',
          borderRadius: 'var(--radius-lg)',
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          overflow: 'hidden',
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}>
            Active Ride Preview
          </div>

          {/* Two column: route left, car right */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            alignItems: 'center',
            minHeight: 140,
          }}>

            {/* Left: Route stops with vertical line */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 120 }}>
              {/* Vertical connector line */}
              <div style={{
                position: 'absolute',
                left: 4,
                top: 21,
                bottom: 36,
                width: 1.5,
                background: '#333',
              }} />

              {/* Stop 1 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'var(--green)',
                  flexShrink: 0,
                  marginTop: 2,
                  zIndex: 1,
                }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>Maryland Junction</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Pickup · Near you</div>
                </div>
              </div>

              {/* Stop 2 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'var(--white)',
                  flexShrink: 0,
                  marginTop: 2,
                  zIndex: 1,
                }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>Victoria Island</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Drop-off</div>
                </div>
              </div>
            </div>

            {/* Right: Car SVG blended */}
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 120,
              overflow: 'hidden',
            }}>
              {/* Subtle glow */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at center, rgba(200,241,53,0.07) 0%, transparent 70%)',
              }} />
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 225 130"
                preserveAspectRatio="xMidYMid meet"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M221.25 60C219.844 57.6562 205.964 51.6609 205.964 51.6609C208.378 50.4141 210.028 50.1562 210.028 45C210.028 39.375 210 37.5 206.25 37.5H193.528C193.477 37.3875 193.42 37.2703 193.369 37.1531C185.156 19.2187 184.055 14.6859 171.806 8.58281C155.377 0.412498 124.575 0 112.5 0C100.425 0 69.6234 0.412498 53.2078 8.58281C40.9453 14.6766 41.25 17.8125 31.6453 37.1531C31.6453 37.2047 31.5469 37.3406 31.4578 37.5H18.7219C15 37.5 14.9719 39.375 14.9719 45C14.9719 50.1562 16.6219 50.4141 19.0359 51.6609C19.0359 51.6609 5.625 58.125 3.75 60C1.875 61.875 0 75 0 97.5C0 120 1.875 142.5 1.875 142.5H7.47188C7.47188 149.062 8.4375 150 11.25 150H48.75C51.5625 150 52.5 149.062 52.5 142.5H172.5C172.5 149.062 173.438 150 176.25 150H214.688C216.562 150 217.5 148.594 217.5 142.5H223.125C223.125 142.5 225 119.531 225 97.5C225 75.4688 222.656 62.3438 221.25 60ZM51.2156 81.0656C42.6783 81.9989 34.0975 82.4777 25.5094 82.5C15.9375 82.5 15.6094 83.1141 14.9344 77.1375C14.6806 74.402 14.7609 71.6458 15.1734 68.9297L15.4688 67.5H16.875C22.5 67.5 27.7828 67.7391 37.7578 70.6781C42.8312 72.2005 47.6031 74.5888 51.8625 77.7375C53.9062 79.2187 54.375 80.625 54.375 80.625L51.2156 81.0656ZM167.072 114.816L165 120H60C60 120 60.1828 119.714 57.6562 114.759C55.7812 111.094 58.125 108.75 61.8328 107.419C69.0141 104.831 90 97.5 112.5 97.5C135 97.5 156.403 103.819 163.359 107.419C165.938 108.75 169.139 109.688 167.072 114.844V114.816ZM46.6031 50.8172C45.089 50.9047 43.5715 50.9157 42.0563 50.85C43.2797 48.675 43.9594 46.2516 45.1547 43.7203C48.9047 35.7516 53.1938 26.7328 60.8297 22.9312C71.8641 17.4375 94.7344 14.9625 112.5 14.9625C130.266 14.9625 153.136 17.4187 164.17 22.9312C171.806 26.7328 176.077 35.7563 179.845 43.7203C181.05 46.275 181.72 48.7172 182.977 50.9063C182.039 50.9578 180.961 50.9062 178.387 50.8172H46.6031ZM209.597 77.1187C208.594 82.9687 209.531 82.5 199.491 82.5C190.902 82.4777 182.322 81.9989 173.784 81.0656C172.448 80.8266 172.069 78.5719 173.137 77.7375C177.375 74.5534 182.154 72.1618 187.242 70.6781C197.217 67.7391 202.833 67.3453 208.378 67.5422C208.751 67.5564 209.105 67.7079 209.372 67.9675C209.639 68.2272 209.801 68.5766 209.827 68.9484C210.091 71.677 210.014 74.428 209.597 77.1375V77.1187Z" fill="#C8F135" fill-opacity="0.3"/>
              </svg>
              {/* Left fade to blend into route column */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 32,
                height: '100%',
                background: 'linear-gradient(to right, var(--black), transparent)',
                pointerEvents: 'none',
              }} />
{/* Bottom fade */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 16,
                background: 'linear-gradient(to bottom, transparent, var(--black))',
                pointerEvents: 'none',
              }} />
            </div>
          </div>

          {/* Driver matched banner */}
          <div style={{
            background: 'var(--green)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ fontSize: 14 }}>👤</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--black)' }}>
              DRIVER MATCHED — TOYOTA CAMRY, SILVER · 3 MINS AWAY
            </span>
          </div>

          {/* Fare */}
          <div style={{
            background: '#1a1a1a',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid #2a2a2a',
          }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>YOUR FARE</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--green)', letterSpacing: '-1px' }}>₦1,400</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Split between 2 riders</div>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>FULL JOURNEY</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'line-through' }}>₦2,800</div>
              <div style={{
                background: '#1a2a00',
                color: 'var(--green)',
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 20,
              }}>
                50% saved
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #how-it-works .container {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}