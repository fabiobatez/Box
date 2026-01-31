import { useEffect, useMemo, useState } from 'react'
import { Mail, Send, RefreshCw, LogOut, User, Inbox, PlusCircle, ArrowLeft } from 'lucide-react'
import logo from './assets/Logo1_FABRICE_ADANLESSOSSI.png'
import './App.css'

const API = 'http://localhost:4001'

function App() {
  const [user, setUser] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const userParam = params.get('user')
    if (userParam) {
      localStorage.setItem('box_user', userParam)
      // Clean URL without reload
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname
      window.history.pushState({ path: newUrl }, '', newUrl)
      return userParam
    }
    return localStorage.getItem('box_user')
  })

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [compose, setCompose] = useState({ to: '', subject: '', body: '' })
  const [view, setView] = useState('inbox') // 'inbox' | 'sent'
  const [selectedMessage, setSelectedMessage] = useState(null)

  async function startGoogleLogin() {
    window.location.href = `${API}/auth/google/login`
  }

  async function loadMessages(targetView = view) {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const label = targetView === 'sent' ? 'SENT' : 'INBOX'
      const res = await fetch(`${API}/mail/messages?userId=${encodeURIComponent(user)}&label=${label}`, { credentials: 'include' })
      if (!res.ok) {
        if (res.status === 401) {
           throw new Error('Session expirée. Veuillez vous reconnecter.')
        }
        throw new Error('Erreur lors du chargement des messages')
      }
      const data = await res.json()
      setMessages(data.items || [])
      // Clear selection if switching views, but not necessarily on refresh if we want to keep it? 
      // Actually, for simplicity, let's keep selection if it exists in the new list, but easier to just clear or keep UI state separate.
      // If we refresh, we might want to keep viewing the message. But if we switch views, we definitely want to clear.
      if (targetView !== view) {
        setSelectedMessage(null)
      }
    } catch (e) {
      setError(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }

  async function sendMail(e) {
    e.preventDefault()
    if (!user) return setError('Utilisateur non authentifié')
    setError('')
    try {
      const res = await fetch(`${API}/mail/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...compose, userId: user }),
      })
      const data = await res.json()
      if (res.ok) {
        setCompose({ to: '', subject: '', body: '' })
        loadMessages('inbox') // Refresh inbox or sent? Usually sent. But user might want to see sent.
        // Let's switch to Sent view to confirm? Or just stay.
        // Request didn't specify. Let's stay but maybe notify.
        alert('Message envoyé !')
      } else {
        throw new Error(data.error || 'Échec de l’envoi')
      }
    } catch (e) {
      setError('Erreur d’envoi: ' + String(e.message || e))
    }
  }

  function handleLogout() {
    localStorage.removeItem('box_user')
    setUser(null)
    setMessages([])
    // Optional: Notify backend to clear token from memory/file if we want strictly secure logout
    // But for now, client-side clear is enough to "disconnect" the UI
    fetch(`${API}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user })
    }).catch(console.error)
  }

  useEffect(() => {
    loadMessages(view)
  }, [user, view])

  if (!user) {
    return (
      <div className="login-container">
        <div className="card login-card">
          <img src={logo} className="logo" alt="Box logo" style={{ height: '80px', marginBottom: '2rem' }} />
          <h1>Bienvenue sur Box</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
            Gérez vos emails en toute simplicité.
          </p>
          <button className="btn-primary" onClick={startGoogleLogin} style={{ width: '100%' }}>
            <User size={18} />
            Se connecter avec Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-brand">
          <img src={logo} className="header-logo" alt="Box logo" />
          <span>Box</span>
        </div>
        <div className="user-info">
          <span>{user}</span>
          <button className="btn-secondary" onClick={handleLogout} title="Déconnexion">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="main-content">
        <section>
          <div className="section-title" style={{ justifyContent: 'space-between' }}>
            {selectedMessage ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button className="btn-secondary" onClick={() => setSelectedMessage(null)}>
                  <ArrowLeft size={20} />
                </button>
                <h3>Message</h3>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  className={`btn-secondary ${view === 'inbox' ? 'active' : ''}`}
                  onClick={() => setView('inbox')}
                  style={{ 
                    fontWeight: view === 'inbox' ? 'bold' : 'normal',
                    backgroundColor: view === 'inbox' ? 'var(--color-border)' : 'transparent' 
                  }}
                >
                  <Inbox size={20} />
                  <span>Reçus</span>
                </button>
                <button 
                  className={`btn-secondary ${view === 'sent' ? 'active' : ''}`}
                  onClick={() => setView('sent')}
                  style={{ 
                    fontWeight: view === 'sent' ? 'bold' : 'normal',
                    backgroundColor: view === 'sent' ? 'var(--color-border)' : 'transparent' 
                  }}
                >
                  <Send size={20} />
                  <span>Envoyés</span>
                </button>
              </div>
            )}
            
            {!selectedMessage && (
              <button className="btn-secondary" onClick={() => loadMessages(view)} disabled={loading}>
                <RefreshCw size={16} className={loading ? 'spin' : ''} />
              </button>
            )}
          </div>
          
          {error && <div style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>{error}</div>}

          <div className="card" style={{ padding: '0.5rem', minHeight: '300px' }}>
            {selectedMessage ? (
              <div className="message-detail" style={{ padding: '1rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>{selectedMessage.subject}</h2>
                <div style={{ marginBottom: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  <div><strong>De:</strong> {selectedMessage.from}</div>
                  <div><strong>À:</strong> {selectedMessage.to}</div>
                  <div><strong>Date:</strong> {selectedMessage.date}</div>
                </div>
                <hr style={{ border: '0', borderTop: '1px solid var(--color-border)', margin: '1rem 0' }} />
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', fontFamily: 'sans-serif' }}>
                  {selectedMessage.body}
                </div>
              </div>
            ) : (
              <ul className="inbox-list">
                {messages.length === 0 && !loading && (
                  <div className="empty-state">
                    <Mail size={48} color="var(--color-text-muted)" />
                    <p>Aucun message dans {view === 'inbox' ? 'la boîte de réception' : 'les éléments envoyés'}</p>
                  </div>
                )}
                {messages.map((m) => (
                  <li key={m.id} className="email-item" onClick={() => setSelectedMessage(m)} style={{ cursor: 'pointer' }}>
                    <div className="email-header">
                      <span className="email-subject">{m.subject || '(Sans objet)'}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                         {/* Date is already formatted string from backend or we use it directly */}
                         {m.date}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="email-from">
                        {view === 'sent' ? `À: ${m.to.replace(/<.*>/, '').trim()}` : m.from.replace(/<.*>/, '').trim()}
                      </span>
                    </div>
                    <div className="email-snippet">{m.snippet}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section>
          <div className="section-title">
            <PlusCircle size={20} />
            <h3>Nouveau message</h3>
          </div>
          <form onSubmit={sendMail} className="card compose-form">
            <div className="form-group">
              <label className="form-label">À</label>
              <input 
                value={compose.to} 
                onChange={(e) => setCompose({ ...compose, to: e.target.value })} 
                placeholder="destinataire@exemple.com"
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Objet</label>
              <input 
                value={compose.subject} 
                onChange={(e) => setCompose({ ...compose, subject: e.target.value })} 
                placeholder="Sujet du message"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea 
                value={compose.body} 
                onChange={(e) => setCompose({ ...compose, body: e.target.value })} 
                rows={12} 
                placeholder="Écrivez votre message ici..."
                style={{ resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary">
                <Send size={18} />
                Envoyer
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

export default App
