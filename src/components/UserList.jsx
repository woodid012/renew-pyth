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
    <div className="max-w-4xl mx-auto p-8 sm:p-4">
      <h2>User Management</h2>
      
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
      
      <form onSubmit={editingUser ? updateUser : addUser} className="bg-white p-8 rounded-xl shadow-md mb-8 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
            className="flex-1 p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            className="flex-1 p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={loading}
            className="py-3 px-6 rounded-lg text-base font-medium cursor-pointer transition-all duration-200
            bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'Processing...' : editingUser ? 'Update User' : 'Add User'}
          </button>
          {editingUser && (
            <button type="button" onClick={cancelEdit} disabled={loading}
              className="py-3 px-6 rounded-lg text-base font-medium cursor-pointer transition-all duration-200
              bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-60 disabled:cursor-not-allowed">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-8">
        <h3>Users ({users.length})</h3>
        {loading && users.length === 0 ? (
          <div className="text-center p-12 text-gray-500 italic">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center p-12 text-gray-500 italic">No users found. Add your first user above.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {users.map((user) => (
              <div key={user._id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
                <div className="mb-4">
                  <div className="text-lg font-semibold text-gray-900 mb-1">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  {user._id && <div className="user-id">ID: {user._id}</div>}
                </div>
                <div className="flex gap-2 mt-4">
                  <button 
                    className="flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all duration-200
                    bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-60 disabled:cursor-not-allowed" 
                    onClick={() => startEdit(user)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button 
                    className="flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all duration-200
                    bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed" 
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