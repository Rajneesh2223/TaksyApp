import { Navigate, Route, Routes } from 'react-router-dom';

import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import Admin from './pages/Admin';
import CreateTask from './pages/CreateTask';
import Dashboard from './pages/Dashboard';
import EditTask from './pages/EditTask';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

function App() {
  // const token = import.meta.env.VITE_ROLE
  // const role = import.meta.env.VITE_ROLE; // 'user' or 'admin'
     const { token, role, userId } = useSelector((state) => state.user);
    console.log(token , role ,userId)
  

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto ">
        <Routes>
          {!token ? (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : role === "user" ? (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              {/* <Route path="/task" element={<CreateTask />} /> */}
              {/* <Route path="/task" element={<CreateTask />} /> */}
               <Route path="/edit/:id" element={<EditTask />} />



             
            </>
          ) : role === "admin" ? (
            <>
              <Route path="/admin" element={<Admin />} />
               <Route path="/task" element={<CreateTask />} />
               <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;
