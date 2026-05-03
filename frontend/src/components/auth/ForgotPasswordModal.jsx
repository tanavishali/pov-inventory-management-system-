import { useState, useEffect, useRef } from 'react'

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100, padding: '16px',
  },
  modal: {
    background: '#fff', borderRadius: '26px', padding: '40px 34px 34px',
    width: '100%', maxWidth: '400px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.18)',
  },
  stepIndicator: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', marginBottom: '28px',
  },
  iconWrap: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '70px', height: '70px',
    background: 'linear-gradient(135deg, #eff4ff, #dce8ff)',
    borderRadius: '50%', marginBottom: '16px',
    boxShadow: '0 4px 14px rgba(51,102,255,0.15)',
  },
  header: { textAlign: 'center', marginBottom: '24px' },
  otpContainer: { display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '18px' },
  modalBtns: { display: 'flex', gap: '10px', marginTop: '4px' },
  strengthBars: { display: 'flex', gap: '5px', marginBottom: '5px' },
}

function Alert({ type, msg }) {
  if (!msg) return null
  const isSuccess = type === 'success'
  return (
    <div style={{
      padding: '12px 15px', borderRadius: '12px', fontSize: '13.5px', fontWeight: 700,
      marginBottom: '18px',
      background: isSuccess ? '#ecfdf5' : '#fff1f2',
      border: `1.5px solid ${isSuccess ? '#86efac' : '#fda4af'}`,
      color: isSuccess ? '#166534' : '#9f1239',
    }}>
      <i className={`fa-solid fa-${isSuccess ? 'circle-check' : 'circle-exclamation'}`} style={{ marginRight: 8 }} />
      {msg}
    </div>
  )
}

function StepDot({ status }) {
  const base = { borderRadius: '50%', transition: 'all 0.3s', height: '8px' }
  if (status === 'active') return <div style={{ ...base, background: '#3366ff', width: '24px', borderRadius: '4px' }} />
  if (status === 'done') return <div style={{ ...base, background: '#86efac', width: '8px' }} />
  return <div style={{ ...base, background: '#e8eef8', width: '8px' }} />
}

function OtpInput({ otpValues, setOtpValues }) {
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return
    const newOtp = [...otpValues]
    newOtp[i] = val.slice(-1)
    setOtpValues(newOtp)
    if (val && i < 5) refs[i + 1].current?.focus()
  }

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !otpValues[i] && i > 0) refs[i - 1].current?.focus()
    if (e.key === 'ArrowLeft' && i > 0) refs[i - 1].current?.focus()
    if (e.key === 'ArrowRight' && i < 5) refs[i + 1].current?.focus()
  }

  return (
    <div style={styles.otpContainer}>
      {otpValues.map((val, i) => (
        <input
          key={i}
          ref={refs[i]}
          value={val}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          maxLength={1}
          style={{
            width: '52px', height: '58px',
            border: `2px solid ${val ? '#3366ff' : '#e8eef8'}`,
            borderRadius: '14px',
            background: val ? '#eff4ff' : '#f4f7fd',
            textAlign: 'center', fontSize: '22px', fontWeight: 900,
            color: val ? '#3366ff' : '#0f172a',
            fontFamily: 'Nunito, sans-serif', outline: 'none',
          }}
        />
      ))}
    </div>
  )
}

function StrengthMeter({ password }) {
  if (!password) return null
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e']
  const labels = ['Weak', 'Fair', 'Good', 'Strong 💪']
  const c = colors[score - 1] || '#ef4444'
  const l = labels[score - 1] || 'Very Weak'

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={styles.strengthBars}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: '4px', borderRadius: '3px',
            background: i <= score ? c : '#e8eef8', transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <div style={{ fontSize: '11.5px', fontWeight: 700, color: c }}>Strength: {l}</div>
    </div>
  )
}

export default function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])
  const [generatedCode, setGeneratedCode] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [alert, setAlert] = useState({ type: '', msg: '' })
  const [countdown, setCountdown] = useState(0)
  const [showResend, setShowResend] = useState(false)
  const timerRef = useRef(null)

  const showAlert = (type, msg) => setAlert({ type, msg })
  const clearAlert = () => setAlert({ type: '', msg: '' })

  const startTimer = () => {
    clearInterval(timerRef.current)
    setCountdown(30)
    setShowResend(false)
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setShowResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  const sendCode = () => {
    if (!email) { showAlert('error', 'Please enter your email address!'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showAlert('error', 'Please enter a valid email!'); return }
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedCode(code)
    setOtpValues(['', '', '', '', '', ''])
    setStep(2)
    startTimer()
    clearAlert()
    setTimeout(() => showAlert('success', `Code sent! (Demo code: ${code})`), 100)
  }

  const resendCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedCode(code)
    setOtpValues(['', '', '', '', '', ''])
    startTimer()
    showAlert('success', `New code sent! (Demo: ${code})`)
  }

  const verifyCode = () => {
    const entered = otpValues.join('')
    if (entered.length < 6) { showAlert('error', 'Please enter the complete 6-digit code!'); return }
    if (entered !== generatedCode) { showAlert('error', 'Incorrect code! Please try again.'); return }
    clearInterval(timerRef.current)
    setStep(3)
    clearAlert()
  }

  const changePassword = () => {
    if (!newPass || !confirmPass) { showAlert('error', 'Please fill in both fields!'); return }
    if (newPass.length < 6) { showAlert('error', 'Password must be at least 6 characters!'); return }
    if (newPass !== confirmPass) { showAlert('error', 'Passwords do not match!'); return }
    setStep(4)
    clearAlert()
  }

  const dotStatus = (i) => {
    if (i < step) return 'done'
    if (i === step) return 'active'
    return 'inactive'
  }

  const btnStyle = (variant = 'primary') => ({
    flex: variant === 'cancel' ? 1 : 2,
    padding: '13px',
    background: variant === 'cancel' ? '#f4f7fd' : 'linear-gradient(135deg, #3366ff, #5580ff)',
    border: variant === 'cancel' ? '2px solid #e8eef8' : 'none',
    borderRadius: '12px',
    color: variant === 'cancel' ? '#475569' : '#fff',
    fontSize: '14px', fontWeight: 800,
    fontFamily: 'Nunito, sans-serif',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    boxShadow: variant === 'cancel' ? 'none' : '0 4px 14px rgba(51,102,255,0.3)',
  })

  const inputBoxStyle = (focused) => ({
    display: 'flex', alignItems: 'center',
    background: focused ? '#f0f5ff' : '#f4f7fd',
    border: `2px solid ${focused ? '#3366ff' : '#e8eef8'}`,
    borderRadius: '14px', padding: '0 14px', gap: '10px',
    boxShadow: focused ? '0 0 0 4px rgba(51,102,255,0.1)' : 'none',
  })

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        {step < 4 && (
          <div style={styles.stepIndicator}>
            {[1, 2, 3].map(i => <StepDot key={i} status={dotStatus(i)} />)}
          </div>
        )}

        <Alert type={alert.type} msg={alert.msg} />

        {/* Step 1 - Email */}
        {step === 1 && (
          <>
            <div style={styles.header}>
              <div style={styles.iconWrap}>
                <i className="fa-solid fa-lock" style={{ fontSize: '28px', color: '#3366ff' }} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>Forgot Password?</h2>
              <p style={{ color: '#64748b', fontSize: '13.5px', fontWeight: 600, lineHeight: 1.6 }}>
                Enter your registered email address and we'll send you a verification code.
              </p>
            </div>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '13.5px', color: '#0f172a', marginBottom: '8px' }}>Email Address</label>
              <div style={inputBoxStyle(false)}>
                <i className="fa-solid fa-envelope" style={{ color: '#a0aec0', fontSize: '15px' }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ flex: 1, border: 'none', background: 'transparent', padding: '14px 0', fontSize: '14.5px', fontFamily: 'Nunito, sans-serif', fontWeight: 600, color: '#1e293b', outline: 'none' }}
                />
              </div>
            </div>
            <div style={styles.modalBtns}>
              <button style={btnStyle('cancel')} onClick={onClose}>Cancel</button>
              <button style={btnStyle()} onClick={sendCode}>
                <i className="fa-solid fa-paper-plane" /> Send Code
              </button>
            </div>
          </>
        )}

        {/* Step 2 - OTP */}
        {step === 2 && (
          <>
            <div style={styles.header}>
              <div style={styles.iconWrap}>
                <i className="fa-solid fa-shield-halved" style={{ fontSize: '28px', color: '#3366ff' }} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>Enter OTP Code</h2>
              <p style={{ color: '#64748b', fontSize: '13.5px', fontWeight: 600, lineHeight: 1.6 }}>
                We sent a 6-digit code to{' '}
                <span style={{ color: '#3366ff', fontWeight: 800, background: '#eff4ff', padding: '2px 8px', borderRadius: '6px', fontSize: '13px' }}>{email}</span>
              </p>
            </div>
            <OtpInput otpValues={otpValues} setOtpValues={setOtpValues} />
            <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '13.5px', color: '#94a3b8', fontWeight: 600 }}>
              {!showResend ? (
                <span>Resend code in <strong style={{ color: '#64748b' }}>{countdown}s</strong></span>
              ) : (
                <span>Didn't receive it?{' '}
                  <a onClick={resendCode} style={{ color: '#3366ff', fontWeight: 800, textDecoration: 'none', cursor: 'pointer' }}>Resend Code</a>
                </span>
              )}
            </div>
            <div style={styles.modalBtns}>
              <button style={btnStyle('cancel')} onClick={() => setStep(1)}>Back</button>
              <button style={btnStyle()} onClick={verifyCode}>
                <i className="fa-solid fa-check" /> Verify
              </button>
            </div>
          </>
        )}

        {/* Step 3 - New Password */}
        {step === 3 && (
          <>
            <div style={styles.header}>
              <div style={styles.iconWrap}>
                <i className="fa-solid fa-key" style={{ fontSize: '28px', color: '#3366ff' }} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>New Password</h2>
              <p style={{ color: '#64748b', fontSize: '13.5px', fontWeight: 600, lineHeight: 1.6 }}>Create a strong new password for your account.</p>
            </div>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '13.5px', color: '#0f172a', marginBottom: '8px' }}>New Password</label>
              <div style={inputBoxStyle(false)}>
                <i className="fa-solid fa-lock" style={{ color: '#a0aec0', fontSize: '15px' }} />
                <input
                  type={showNewPass ? 'text' : 'password'} value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="Min. 6 characters"
                  style={{ flex: 1, border: 'none', background: 'transparent', padding: '14px 0', fontSize: '14.5px', fontFamily: 'Nunito, sans-serif', fontWeight: 600, color: '#1e293b', outline: 'none' }}
                />
                <button onClick={() => setShowNewPass(!showNewPass)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b0bec5', fontSize: '15px' }}>
                  <i className={`fa-solid fa-${showNewPass ? 'eye-slash' : 'eye'}`} />
                </button>
              </div>
              <StrengthMeter password={newPass} />
            </div>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '13.5px', color: '#0f172a', marginBottom: '8px' }}>Confirm Password</label>
              <div style={inputBoxStyle(false)}>
                <i className="fa-solid fa-lock" style={{ color: '#a0aec0', fontSize: '15px' }} />
                <input
                  type={showConfirmPass ? 'text' : 'password'} value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  placeholder="Repeat your password"
                  style={{ flex: 1, border: 'none', background: 'transparent', padding: '14px 0', fontSize: '14.5px', fontFamily: 'Nunito, sans-serif', fontWeight: 600, color: '#1e293b', outline: 'none' }}
                />
                <button onClick={() => setShowConfirmPass(!showConfirmPass)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b0bec5', fontSize: '15px' }}>
                  <i className={`fa-solid fa-${showConfirmPass ? 'eye-slash' : 'eye'}`} />
                </button>
              </div>
            </div>
            <div style={styles.modalBtns}>
              <button style={btnStyle('cancel')} onClick={() => setStep(2)}>Back</button>
              <button style={btnStyle()} onClick={changePassword}>
                <i className="fa-solid fa-floppy-disk" /> Save Password
              </button>
            </div>
          </>
        )}

        {/* Step 4 - Success */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{
              width: '90px', height: '90px', margin: '0 auto 20px',
              background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(16,185,129,0.25)',
              animation: 'popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275)',
            }}>
              <i className="fa-solid fa-check" style={{ fontSize: '38px', color: '#059669' }} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginBottom: '10px' }}>Password Changed! 🎉</h2>
            <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 600, lineHeight: 1.6, marginBottom: '26px' }}>
              Your password has been updated successfully. You can now log in with your new password.
            </p>
            <button
              onClick={onClose}
              style={{
                width: '100%', padding: '15px',
                background: 'linear-gradient(135deg, #3366ff, #5580ff)',
                border: 'none', borderRadius: '14px', color: '#fff',
                fontSize: '16px', fontWeight: 800, fontFamily: 'Nunito, sans-serif',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                boxShadow: '0 5px 20px rgba(51,102,255,0.38)',
              }}
            >
              <i className="fa-solid fa-right-to-bracket" /> Go to Login
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  )
}
