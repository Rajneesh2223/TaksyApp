import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setAuthData } from '../store/userslice';

function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Registration successful!');
        setFormData({ email: '', password: '' });
        
        dispatch(setAuthData({
          token: data.token,
          role: data.role,
          userId: data._id
        }));
        
        navigate('/dashboard');
      } else {
        setMessage(data.message || ' Registration failed. Please try again.');
      }
    } catch (err) {
      setMessage(' Network error. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 via-sky-100 to-purple-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-extrabold text-center text-sky-700 mb-6">Create Account</h1>

        {message && (
          <div className={`mb-4 p-3 text-sm rounded-lg border transition-all ${
            message.includes('successful')
              ? 'bg-green-50 text-green-800 border-green-300'
              : 'bg-red-50 text-red-800 border-red-300'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              disabled={isLoading}
              value={email}
              onChange={onChange}
              placeholder="example@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              disabled={isLoading}
              value={password}
              onChange={onChange}
              placeholder="Create a strong password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-400 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-blue-600 hover:to-sky-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-60"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account? <span className="text-sky-600 hover:underline cursor-pointer">Login</span>
        </p>
      </div>
    </div>
  );
}

export default SignUp;