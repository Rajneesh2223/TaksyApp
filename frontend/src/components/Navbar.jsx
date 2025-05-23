import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { clearAuthData } from "../store/userslice";


function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const token = localStorage.getItem("token");
    // const token = import.meta.env.VITE_ADMIN_TOKEN;
    const { token, role, userId } = useSelector((state) => state.user);
    console.log(token , role ,userId)

  const handleLogout = () => {
   
    dispatch(clearAuthData());
    localStorage.removeItem('auth');
    navigate('/login');
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

 

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-white text-xl font-bold hover:text-blue-200 transition-colors"
            >
              Task Manager
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!token ? (
              <>
                <Link
                  to="/login"
                  className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </>
            ) : role === "user" ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                 {/* <Link
                  to="/edit"
                  className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Edit Task
                </Link> */}
                <button
                  onClick={handleLogout}
                  className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : role === "admin" ? (
              <>
               <Link
                  to="/dashboard"
                  className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin"
                  className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Admin
                </Link>
                <Link
                  to="/task"
                  className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Create Task
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
