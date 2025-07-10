import { useFrappeAuth } from 'frappe-react-sdk'
import LoginPage from './pages/LoginPage'
import Spinner from './components/ui/spinner'
import DashboardLayout from './components/layouts/DashboardLayout'

function App() {
  const { currentUser, isLoading } = useFrappeAuth()

  return (
    <div className="App">
      {isLoading ? (
        <Spinner />
      ) : currentUser ? (
        <DashboardLayout />
      ) : (
        <LoginPage />
      )}
    </div>
  )
}

export default App
