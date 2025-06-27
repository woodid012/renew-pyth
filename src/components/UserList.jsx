// src/components/UserList.jsx
import { useState, useEffect } from 'react'
import { api } from '../utils/api'

function UserList() {
  const [users, setUsers] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await api.get('/api/users')
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to fetch users: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const addUser = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required')
      return
    }

    try {
      setLoading(true)
      setError('')
      const response = await api.post('/api/users', { name: name.trim(), email: email.trim() })
      console.log('Add user response:', response)
      setName('')
      setEmail('')
      await fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Error adding user:', error)
      setError('Failed to add user: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (user) => {
    setEditingUser(user)
    setName(user.name)
    setEmail(user.email)
  }

  const cancelEdit = () => {
    setEditingUser(null)
    setName('')
    setEmail('')
    setError('')
  }

  const updateUser = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required')
      return
    }

    if (!editingUser || !editingUser._id) {
      setError('No user selected for editing')
      return
    }

    try {
      setLoading(true)
      setError('')
      const response = await api.put(`/api/users/${editingUser._id}`, { 
        name: name.trim(), 
        email: email.trim() 
      })
      console.log('Update user response:', response)
      cancelEdit()
      await fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Error updating user:', error)
      setError('Failed to update user: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (user) => {
    if (!user || !user._id) {
      setError('Invalid user for deletion')
      return
    }

    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return

    try {
      setLoading(true)
      setError('')
      const response = await api.delete(`/api/users/${user._id}`)
      console.log('Delete user response:', response)
      await fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error)
      setError('Failed to delete user: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="user-management">
      <h2>User Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={editingUser ? updateUser : addUser} className="user-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <div className="form-buttons">
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : editingUser ? 'Update User' : 'Add User'}
          </button>
          {editingUser && (
            <button type="button" onClick={cancelEdit} disabled={loading}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="users-list">
        <h3>Users ({users.length})</h3>
        {loading && users.length === 0 ? (
          <div className="loading">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="no-users">No users found. Add your first user above.</div>
        ) : (
          <div className="users-grid">
            {users.map((user) => (
              <div key={user._id} className="user-card">
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-email">{user.email}</div>
                  {user._id && <div className="user-id">ID: {user._id}</div>}
                </div>
                <div className="user-actions">
                  <button 
                    className="edit-btn" 
                    onClick={() => startEdit(user)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn" 
                    onClick={() => deleteUser(user)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserList