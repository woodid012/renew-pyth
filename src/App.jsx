import { useState, useEffect } from 'react'
import UserList from './components/UserList'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState('Loading...')

  useEffect(() => {
    fetch('http://localhost:3001/api/hello')
      .then(res => res.json())
      .then(data => setApiStatus(data.message))
      .catch(err => setApiStatus('API Error: ' + err.message))
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      <h1>Renew Python App</h1>
      <p>API Status: {apiStatus}</p>
      <UserList />
    </div>
  )
}

export default App