// src/components/UserList.jsx
import { useState, useEffect } from 'react'
import { api } from '../utils/api'

function UserList() {
  const [users, setUsers] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const fetchUsers = async () => {
    try {
      const data = await api.get('/api/users')
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const addUser = async (e) => {
    e.preventDefault()
    if (!name || !email) return

    try {
      await api.post('/api/users', { name, email })
      setName('')
      setEmail('')
      fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Error adding user:', error)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div>
      <h2>Users</h2>
      <form onSubmit={addUser}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Add User</button>
      </form>
      <ul>
        {users.map((user, index) => (
          <li key={index}>{user.name} ({user.email})</li>
        ))}
      </ul>
    </div>
  )
}

export default UserList