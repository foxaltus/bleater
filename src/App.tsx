import './App.css'
import AuthForm from './components/AuthForm'
import { AuthProvider } from './lib/auth'
import { useAuth } from './lib/useAuth'

// Main content component shown after authentication
function Dashboard() {
  const { user, signOut } = useAuth();
  
  return (
    <div className="dashboard">
      <header>
        <h1>Bleater Dashboard</h1>
        <div className="user-info">
          <span>{user?.email}</span>
          <button onClick={signOut}>Sign Out</button>
        </div>
      </header>
      <main>
        <p>Welcome to Bleater! Your authenticated dashboard.</p>
      </main>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? <Dashboard /> : <AuthForm />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
