import { useState, useEffect } from 'react'

type Tab = 'drivers' | 'riders'

const DRIVER_BENEFITS = [
  'Earn ₦5,000–₦15,000 extra monthly on your existing routes',
  'You choose your schedule — no shifts, no pressure',
  'Only verified, rated riders in your car',
  'Instant payout to your account after every ride',
]

const RIDER_BENEFITS = [
  'Pay a fair split — never full cab price again',
  'Ride with verified, rated private car owners',
  'Real-time tracking shared with trusted contacts',
  'No surge pricing — ever',
]

export default function Waitlist() {
  const [tab, setTab] = useState<Tab>('drivers')
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    email: '',
    phone: '',
    role: '',
    from: '',
    to: '',
    gender: '',
  })

  // Switch tab based on URL hash
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#for-riders') {
        setTab('riders')
      } else if (window.location.hash === '#for-drivers') {
        setTab('drivers')
      }
    }
    handleHash() // run on mount
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const benefits = tab === 'drivers' ? DRIVER_BENEFITS : RIDER_BENEFITS

  const PHONE_REGEX = /^(\+234|0)[789][01]\d{8}$/

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format'
    if (!form.phone) errs.phone = 'Phone is required'
    else if (!PHONE_REGEX.test(form.phone)) errs.phone = 'Enter your phone number in this format: +2348012345678'
    if (!form.from) errs.from = 'Start location is required'
    if (!form.to) errs.to = 'Stop location is required'
    if (!form.gender) errs.gender = 'Please select your gender'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setErrors({})

    try {
      const res = await fetch('/smart-mobility/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          phone: form.phone,
          role: tab === 'drivers' ? 'DRIVER' : 'PASSENGER',
          gender: form.gender,
          start: form.from,
          stop: form.to,
          signupReason: form.role || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        if (err.errors?.length) {
          const fieldErrors: Record<string, string> = {}
          err.errors.forEach((e: any) => { fieldErrors[e.field] = e.message })
          setErrors(fieldErrors)
          return
        }
        throw new Error(err.message || 'Submission failed')
      }

      setSubmitted(true)
    } catch (err) {
      console.error('Submission error:', err)
    }
  }

  return (
    <>
      {/* Anchor targets sitting above the section */}
      <div id="for-drivers" style={{ position: 'relative', top: -80 }} />

      <section style={{
        background: 'var(--gray-light)',
        padding: 'var(--section-pad)',
        position: 'relative',
      }}>
        {/* Riders anchor inside section so it scrolls into view */}
        <div id="for-riders" style={{ position: 'absolute', top: -80 }} />

        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 80,
          alignItems: 'center',
        }}>

          {/* Left: Who it's for */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: 'var(--gray)',
            }}>
              Who It's For
            </span>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-1px',
              color: 'var(--black)',
            }}>
              Built for every<br />road warrior
            </h2>
            <p style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: 'var(--gray)',
              maxWidth: 380,
            }}>
              Whether you drive or ride, RideAlong works around your
              schedule — not the other way around.
            </p>
          </div>

          {/* Right: Tabbed Form */}
          <div style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-lg)',
            padding: 32,
            boxShadow: '0 4px 40px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}>

            {/* Tabs */}
            <div style={{
              display: 'flex',
              background: 'var(--gray-light)',
              borderRadius: 'var(--radius-sm)',
              padding: 4,
            }}>
              {(['drivers', 'riders'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setSubmitted(false); setErrors({}) }}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    background: tab === t ? 'var(--white)' : 'transparent',
                    color: tab === t ? 'var(--black)' : 'var(--gray)',
                    boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  For {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {submitted ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                padding: '32px 0',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 48 }}>🎉</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--black)' }}>
                  You're on the list!
                </div>
                <div style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.6 }}>
                  We'll reach out when RideAlong launches in your area.
                  Tell a friend — the more Lagosians join, the faster we launch.
                </div>
              </div>
            ) : (
              <>
                {/* Benefits */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: 'var(--black)',
                    lineHeight: 1.3,
                  }}>
                    {tab === 'drivers'
                      ? 'Turn your daily commute into side income'
                      : 'Ride smarter, spend less every day'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                    {benefits.map((b) => (
                      <div key={b} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--green)', fontWeight: 700, marginTop: 1, flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.5 }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {([
                    { key: 'email', label: 'Email Address', placeholder: 'john@example.com', type: 'email' },
                    { key: 'phone', label: 'Phone Number', placeholder: '+2348012345678', type: 'tel' },
                    { key: 'from', label: 'Where Is Your Start Stop?', placeholder: 'e.g. Maryland Junction', type: 'text' },
                    { key: 'to', label: 'Where Is Your Final Stop?', placeholder: 'e.g. Victoria Island', type: 'text' },
                  ] as const).map((field) => {
                    const hasError = !!errors[field.key]
                    return (
                      <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--black)' }}>
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={form[field.key]}
                          onChange={(e) => {
                            setForm({ ...form, [field.key]: e.target.value })
                            if (errors[field.key]) setErrors({ ...errors, [field.key]: '' })
                          }}
                          style={{
                            padding: '11px 14px',
                            borderRadius: 'var(--radius-sm)',
                            border: `1.5px solid ${hasError ? '#EF4444' : 'var(--gray-border)'}`,
                            fontSize: 14,
                            color: 'var(--black)',
                            fontFamily: 'var(--font)',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                          }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = hasError ? '#EF4444' : 'var(--green)' }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = hasError ? '#EF4444' : 'var(--gray-border)' }}
                        />
                        {hasError && (
                          <span style={{ fontSize: 11, color: '#EF4444', lineHeight: 1.3 }}>{errors[field.key]}</span>
                        )}
                      </div>
                    )
                  })}

                  {/* Role dropdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--black)' }}>
                      What GoLyn would be used for?
                    </label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      style={{
                        padding: '11px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid var(--gray-border)',
                        fontSize: 14,
                        color: form.role ? 'var(--black)' : '#9CA3AF',
                        fontFamily: 'var(--font)',
                        outline: 'none',
                        background: 'var(--white)',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 14px center',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--green)' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--gray-border)' }}
                    >
                      <option value="" disabled>Select your role</option>
                      <option value="RIDE_TO_WORK">Ride to Work</option>
                      <option value="RIDE_TO_SCHOOL">Ride to School</option>
                      <option value="RIDE_TO_EVENTS">Ride to Events (We see you ravers 😉)</option>
                      <option value="LEISURE">Leisure</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {/* Gender dropdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--black)' }}>
                      Gender
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) => {
                        setForm({ ...form, gender: e.target.value })
                        if (errors.gender) setErrors({ ...errors, gender: '' })
                      }}
                      style={{
                        padding: '11px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: `1.5px solid ${errors.gender ? '#EF4444' : 'var(--gray-border)'}`,
                        fontSize: 14,
                        color: form.gender ? 'var(--black)' : '#9CA3AF',
                        fontFamily: 'var(--font)',
                        outline: 'none',
                        background: 'var(--white)',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 14px center',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = errors.gender ? '#EF4444' : 'var(--green)' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = errors.gender ? '#EF4444' : 'var(--gray-border)' }}
                    >
                      <option value="" disabled>Select your gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                    </select>
                    {errors.gender && (
                      <span style={{ fontSize: 11, color: '#EF4444', lineHeight: 1.3 }}>{errors.gender}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  style={{
                    background: 'var(--green)',
                    color: 'var(--black)',
                    fontWeight: 700,
                    fontSize: 15,
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    width: '100%',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--green-dark)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--green)' }}
                >
                  Join Waitlist →
                </button>
              </>
            )}
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            #for-drivers .container {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>
    </>
  )
}