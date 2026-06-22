import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDataStore } from '../store/dataStore'

export function LoginForm() {
  const navigate = useNavigate()
  const login = useDataStore((s) => s.login)
  const isLoading = useDataStore((s) => s.isLoading)
  const error = useDataStore((s) => s.error)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

  const handleLogin = async () => {
    const success = await login({ username, password, email })
    if (success) {
      navigate('/secret')
    }
  }

  return (
    <form
      className="login-form"
      onSubmit={(e) => {
        e.preventDefault()
        void handleLogin()
      }}
    >
      <h2 className="login-form__title">Login</h2>

      {error && <p className="login-form__error">{error}</p>}

      <div className="login-form__field">
        <label className="login-form__label" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          className="login-form__input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div className="login-form__field">
        <label className="login-form__label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className="login-form__input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="login-form__field">
        <label className="login-form__label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="login-form__input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <button className="login-form__submit" type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  )
}
