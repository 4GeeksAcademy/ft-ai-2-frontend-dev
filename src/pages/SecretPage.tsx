import { Navigate, useNavigate } from 'react-router-dom'
import { useDataStore } from '../store/dataStore'

export function SecretPage() {
  const navigate = useNavigate()
  const user = useDataStore((s) => s.user)
  const isAuthenticated = useDataStore((s) => s.isAuthenticated)
  const logout = useDataStore((s) => s.logout)

  if (!isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <main className="page">
      <h1 className="page__title">Secret Page</h1>
      <div className="secret">
        <p className="secret__greeting">Welcome, {user?.username}!</p>
        <dl className="secret__details">
          <dt className="secret__term">Username</dt>
          <dd className="secret__value">{user?.username}</dd>
          <dt className="secret__term">Email</dt>
          <dd className="secret__value">{user?.email}</dd>
        </dl>
        <button className="secret__logout" type="button" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </main>
  )
}
