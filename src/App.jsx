// src/App.jsx
import { useState, useEffect } from 'react'
import UserList from './components/UserList'
import { api } from './utils/api'


function App() {
  const [apiStatus, setApiStatus] = useState('Loading...')

  useEffect(() => {
    api.get('/api/hello')
      .then(data => setApiStatus(data.message))
      .catch(err => setApiStatus('API Error: ' + err.message))
  }, [])

  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold mb-4">Renew Python App</h1>
      <p>API Status: {apiStatus}</p>
      <UserList />
    </div>
  )
}

export default App