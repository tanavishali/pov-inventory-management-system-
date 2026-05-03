import { useState } from 'react'
import { useLoginMutation } from '../store/slices/authApiSlice'

const s = {
  body: {
    minHeight: '100vh',
    background: 'linear-gradient(145deg, #e8f0fe 0%, #c9d8f5 50%, #b3c8ef 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Nunito', sans-serif", padding: '16px',
  },
  card: {
    background: '#fff', borderRadius: '28px', padding: '48px 40px 40px',
    width: '100%', maxWidth: '440px',
    boxShadow: '0 10px 50px rgba(51,102,255,0.12)',
  },
  header: { textAlign: 'center', marginBottom: '34px' },
  iconWrap: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '76px', height: '76px',
    background: 'linear-gradient(135deg, #eff4ff, #dce8ff)',
    borderRadius: '50%', marginBottom: '18px',
    boxShadow: '0 4px 16px rgba(51,102,255,0.15)',
  },
  label: { display: 'block', fontWeight: 800, fontSize: '13.5px', color: '#0f172a', marginBottom: '8px' },
  inputBox: (focused) => ({
    display: 'flex', alignItems: 'center',
    background: focused ? '#f0f5ff' : '#f4f7fd',
    border: `2px solid ${focused ? '#3366ff' : '#e8eef8'}`,
    borderRadius: '14px', padding: '0 14px', gap: '10px',
    boxShadow: focused ? '0 0 0 4px rgba(51,102,255,0.1)' : 'none',
    transition: 'all 0.25s',
    marginBottom: '18px',
  }),
  inputField: {
    flex: 1, border: 'none', background: 'transparent', padding: '14px 0',
    fontSize: '14.5px', fontFamily: "'Nunito', sans-serif", fontWeight: 600,
    color: '#1e293b', outline: 'none', minWidth: 0,
  },
  btn: {
    width: '100%', padding: '15px',
    background: 'linear-gradient(135deg, #3366ff, #5580ff)',
    border: 'none', borderRadius: '14px', color: '#fff',
    fontSize: '16px', fontWeight: 800, fontFamily: "'Nunito', sans-serif",
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '10px', boxShadow: '0 5px 20px rgba(51,102,255,0.38)',
  },
  switchBox: {
    textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#64748b',
    padding: '14px 20px', background: '#f8faff', borderRadius: '12px',
    border: '1.5px solid #e8eef8', marginTop: '16px',
  },
}

function Alert({ type, msg }) {
  if (!msg) return null
  const ok = type === 'success'
  return (
    <div style={{
      padding: '12px 15px', borderRadius: '12px', fontSize: '13.5px', fontWeight: 700,
      marginBottom: '18px',
      background: ok ? '#ecfdf5' : '#fff1f2',
      border: `1.5px solid ${ok ? '#86efac' : '#fda4af'}`,
      color: ok ? '#166534' : '#9f1239',
    }}>
      <i className={`fa-solid fa-${ok ? 'circle-check' : 'circle-exclamation'}`} style={{ marginRight: 8 }} />
      {msg}
    </div>
  )
}

function InputField({ icon, type, id, placeholder, value, onChange, children }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={s.inputBox(focused)}>
      <i className={`fa-solid fa-${icon}`} style={{ color: focused ? '#3366ff' : '#a0aec0', fontSize: '15px', flexShrink: 0, transition: 'color 0.25s' }} />
      <input
        id={id} type={type} placeholder={placeholder} value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={s.inputField}
      />
      {children}
    </div>
  )
}

function RegisterForm({ onSwitch, onSuccess }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [alert, setAlert] = useState({ type: '', msg: '' })

  const handleSubmit = () => {
    if (!name || !email || !password) { setAlert({ type: 'error', msg: 'Please fill in all fields!' }); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setAlert({ type: 'error', msg: 'Please enter a valid email address!' }); return }
    if (password.length < 6) { setAlert({ type: 'error', msg: 'Password must be at least 6 characters!' }); return }
    setAlert({ type: 'success', msg: `Account created successfully! Welcome, ${name}! 🎉` })
    setTimeout(() => onSuccess && onSuccess(), 1500)
  }

  return (
    <>
      <div style={s.header}>
        <div style={s.iconWrap}>
          <i className="fa-solid fa-user-plus" style={{ fontSize: '32px', color: '#3366ff' }} />
        </div>
        <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#0f172a', marginBottom: '7px' }}>Create Account</h1>
        <p style={{ color: '#64748b', fontSize: '14.5px', fontWeight: 600 }}>Join Smart Sales System today</p>
      </div>
      <Alert type={alert.type} msg={alert.msg} />
      <div>
        <label style={s.label}>Full Name</label>
        <InputField icon="user" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label style={s.label}>Email Address</label>
        <InputField icon="envelope" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div>
        <label style={s.label}>Password</label>
        <InputField icon="lock" type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)}>
          <button onClick={() => setShowPass(!showPass)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b0bec5', fontSize: '15px', display: 'flex', alignItems: 'center' }}>
            <i className={`fa-solid fa-${showPass ? 'eye-slash' : 'eye'}`} />
          </button>
        </InputField>
      </div>
      <button style={s.btn} onClick={handleSubmit}>
        <i className="fa-solid fa-user-plus" /> Create Account
      </button>
      <div style={s.switchBox}>
        Already have an account?{' '}
        <a onClick={onSwitch} style={{ color: '#3366ff', fontWeight: 800, textDecoration: 'none', cursor: 'pointer' }}>Sign In</a>
      </div>
    </>
  )
}

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [alert, setAlert] = useState({ type: '', msg: '' })

  const [login, { isLoading }] = useLoginMutation()

  const handleLogin = async () => {
    if (!email || !password) {
      setAlert({ type: 'error', msg: 'Please fill in all fields!' })
      return
    }

    try {
      const response = await login({ email, password }).unwrap()
      
      // Save token to localStorage
      localStorage.setItem('wholesale_token', response.access_token)
      
      setAlert({ type: 'success', msg: `Login successful! Welcome ${response.user.name}...` })
      
      // Small delay to show success state before redirecting
      setTimeout(() => {
        onLogin(response.user)
      }, 1000)
    } catch (err) {
      setAlert({ 
        type: 'error', 
        msg: err?.data?.message || 'Login failed. Please check your credentials.' 
      })
    }
  }

  return (
    <>
      <div style={s.header}>
        <div style={s.iconWrap}>
          <i className="fa-solid fa-chart-line" style={{ fontSize: '32px', color: '#3366ff' }} />
        </div>
        <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#0f172a', marginBottom: '7px' }}>Welcome Back!</h1>
        <p style={{ color: '#64748b', fontSize: '14.5px', fontWeight: 600 }}>Sign in to Smart Sales System</p>
      </div>
      <Alert type={alert.type} msg={alert.msg} />
      <div>
        <label style={s.label}>Email Address</label>
        <InputField icon="envelope" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div>
        <label style={s.label}>Password</label>
        <InputField icon="lock" type={showPass ? 'text' : 'password'} placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)}>
          <button onClick={() => setShowPass(!showPass)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b0bec5', fontSize: '15px', display: 'flex', alignItems: 'center' }}>
            <i className={`fa-solid fa-${showPass ? 'eye-slash' : 'eye'}`} />
          </button>
        </InputField>
      </div>
      <button 
        style={{ ...s.btn, marginTop: '8px', opacity: isLoading ? 0.7 : 1 }} 
        onClick={handleLogin}
        disabled={isLoading}
      >
        <i className={`fa-solid fa-${isLoading ? 'spinner fa-spin' : 'right-to-bracket'}`} /> 
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </>
  )
}

export default function AuthPage({ onLogin }) {
  return (
    <div style={s.body}>
      <div style={s.card}>
        <LoginForm onLogin={onLogin} />
      </div>
    </div>
  )
}
