import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { User, OnboardingPath, ChecklistItem } from '../types';

/**
 * User Dashboard - Shows assigned onboarding path and checklist
 */
export const DashboardPage: React.FC = () => {
  const [userPath, setUserPath] = useState<OnboardingPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const response = await userService.getProfile();
        if (response.success && response.data.path) {
          setUserPath(response.data.path);
        }
      } catch (err: any) {
        setError('Failed to load your onboarding path');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center text-slate-600">Loading your onboarding path...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="container max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">OnboardAI Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-600">{user?.email}</span>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-5 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded px-4 py-3 text-red-700 mb-4">
            {error}
          </div>
        )}

        {userPath ? (
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {userPath.name}
            </h2>
            <p className="text-lg text-slate-600 mb-8">{userPath.description}</p>

            <Card title="Your Onboarding Checklist">
              <ul className="space-y-3">
                {(userPath.checklist || []).map(
                  (item: ChecklistItem, index: number) => (
                    <li
                      key={index}
                      className="flex items-start p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <input
                        type="checkbox"
                        id={`dashboard-item-${index}`}
                        className="w-5 h-5 mt-0.5 accent-blue-600 rounded cursor-pointer hover:accent-blue-700"
                      />
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-slate-900">
                          {item.title}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                          {item.description}
                        </div>
                      </div>
                    </li>
                  )
                )}
              </ul>
            </Card>

            <div className="mt-8">
              <Button
                variant="secondary"
                onClick={() => navigate('/admin')}
                className="px-6"
              >
                View Admin Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <Card>
            <p className="text-slate-600 text-center">
              No onboarding path assigned yet. Complete your profile to get started.
            </p>
            <div className="text-center mt-4">
              <Button
                variant="primary"
                onClick={() => navigate('/onboarding')}
              >
                Complete Profile
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
