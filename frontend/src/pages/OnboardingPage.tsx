import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { OnboardingPath, ChecklistItem } from '../types';

/**
 * Onboarding page - Collect user profile info and assign path
 */
export const OnboardingPage: React.FC = () => {
  const [role, setRole] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [goal, setGoal] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [assignedPath, setAssignedPath] = useState<OnboardingPath | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const navigate = useNavigate();

  const roleOptions = [
    'Operations Manager',
    'Sales Lead',
    'Founder',
    'Support Manager',
    'Marketing Manager',
    'Other',
  ];

  const teamSizeOptions = [
    '1-5 people',
    '6-20 people',
    '21-100 people',
    '100+ people',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!role || !teamSize || !goal) {
      setError('Please fill in all fields');
      return;
    }

    if (goal.length < 10) {
      setError('Please provide more details about your goal (at least 10 characters)');
      return;
    }

    setLoading(true);

    try {
      const response = await userService.updateProfile({
        role,
        team_size: teamSize,
        goal,
      });

      if (response.success) {
        setAssignedPath(response.data.path);
        setWelcomeMessage(response.data.welcomeMessage);
        setCompleted(true);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          'Failed to complete onboarding. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (completed && assignedPath) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container max-w-2xl">
          <Card className="mb-6">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">🎉 Welcome!</h1>
              <p className="text-xl text-slate-600">{welcomeMessage}</p>
            </div>

            <Card
              title={assignedPath.name}
              description={assignedPath.description}
              className="mb-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Your Onboarding Checklist
              </h3>
              <ul className="space-y-3">
                {(assignedPath.checklist || []).map(
                  (item: ChecklistItem, index: number) => (
                    <li
                      key={index}
                      className="flex items-start p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <input
                        type="checkbox"
                        id={`item-${index}`}
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

            <div className="text-center mt-8">
              <Button
                variant="primary"
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3"
              >
                Got it! Take me to my dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Let's Get Started
          </h1>
          <p className="text-center text-slate-600 mb-6">
            Tell us about yourself so we can customize your experience
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded px-4 py-3 text-red-700 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col">
              <label htmlFor="role" className="mb-2 font-medium text-slate-900">
                What's your role?
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="px-3 py-2 border border-slate-300 rounded-lg font-sans transition-all duration-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Select your role</option>
                {roleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="teamSize"
                className="mb-2 font-medium text-slate-900"
              >
                Team size
              </label>
              <select
                id="teamSize"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                required
                className="px-3 py-2 border border-slate-300 rounded-lg font-sans transition-all duration-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Select team size</option>
                {teamSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor="goal" className="mb-2 font-medium text-slate-900">
                What are you trying to accomplish?
              </label>
              <textarea
                id="goal"
                placeholder="Describe your main goals or challenges..."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
                className="px-3 py-2 border border-slate-300 rounded font-sans transition-all duration-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 resize-y min-h-[120px]"
                rows={6}
              />
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full"
            >
              Create My Onboarding Path
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};


