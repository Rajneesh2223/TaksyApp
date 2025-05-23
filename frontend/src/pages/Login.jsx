import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAuthData } from '../store/userslice';
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { email, password } = formData;
  const dispatch = useDispatch()

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

 const onSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setMessage('');

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log(data)

    if (!response.ok) {
      setMessage(data?.detail || 'Login failed. Please check your credentials.');
    } else {
      setMessage('Login successful! Welcome back.');
       dispatch(setAuthData({
          token: data.token,
          role: data.role,
          userId: data._id
        }));
     
      navigate('/dashboard');
    }
  } catch (error) {
    setMessage('Network error. Please try again.');
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="h-screen  flex justify-center items-center ">
      <div className="bg-gray-20 backdrop-blur-md shadow-2xl p-8 rounded-2xl w-full max-w-md border border-white/20">
        <h1 className="text-3xl font-extrabold text-center mb-6 text-black drop-shadow-md">Sign In</h1>
        
        {message && (
          <div className={`mb-4 p-4 rounded-lg text-sm font-medium animate-fade-in transition-all duration-300 ${
            message.includes('successful') 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-black text-sm font-semibold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              className="w-full px-4 py-2 bg-white/80 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-transparent transition duration-200"
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-black text-sm font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-4 py-2 bg-white/80 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-transparent transition duration-200"
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 text-black font-bold py-2 rounded-lg shadow-md transition duration-300 ease-in-out"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-black/90">
          Admin Credentials 
          <div><span className="font-semibold">user1@example.com</span> / <span className="font-semibold">password1234</span></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
