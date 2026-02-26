import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { User } from '../types';

/**
 * Admin Dashboard - View all users and their assignments
 */
export const AdminDashboardPage: React.FC = () => {
  const [users, setUsers] = useState<(User & { assignedPathName?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await userService.getAllUsers();
        if (response.success) {
          setUsers(response.data.users);
        }
      } catch (err: any) {
        setError('Failed to load users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center text-slate-600">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="container max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">OnboardAI Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-600">{currentUser?.email}</span>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-5 py-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">User Management</h2>
        <p className="text-slate-600 mb-6">
          Total users: <strong>{users.length}</strong>
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded px-4 py-3 text-red-700 mb-4">
            {error}
          </div>
        )}

        {users.length > 0 ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">
                      Team Size
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">
                      Assigned Path
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-900 font-medium">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-slate-700">{user.role || '-'}</td>
                      <td className="px-6 py-4 text-slate-700">{user.team_size || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                          {user.assigned_path ? 'Assigned' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card>
            <p className="text-slate-600 text-center">No users found</p>
          </Card>
        )}

        <div className="mt-8">
          <Button
            variant="secondary"
            onClick={() => navigate('/dashboard')}
            className="px-6"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
