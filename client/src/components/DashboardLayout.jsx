
import { useState, useEffect, useRef } from "react";
import {
  Outlet,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  LayoutDashboard,
  Activity,
  FileText,
  UserRound,
  Settings,
  LogOut,
  HeartPulse,
  Droplets,
  MoreHorizontal,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import "../App.css";

function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [accountOpen, setAccountOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const accountRef = useRef(null);

  const navigation = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "My Readings", path: "/readings", icon: Activity },
    { label: "Reports", path: "/reports", icon: FileText },
    { label: "Profile", path: "/profile", icon: UserRound },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  useEffect(() => {
    setSidebarOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    setAccountOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <div className="premium-app">
      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`premium-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="premium-brand">
          <div className="brand-symbol">
            <Droplets size={24} />
          </div>
          <span>
            Sweety<span className="brand-dot">.</span>
          </span>
          <button
            className="mobile-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="premium-navigation">
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/dashboard"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-help">
          <div className="help-icon">
            <HeartPulse size={21} />
          </div>
          <strong>Your health matters</strong>
          <p>Stay consistent with your daily health tracking.</p>
          <span>Keep tracking</span>
        </div>

        <div className="premium-sidebar-bottom">
          <button className="nav-link" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>

          <div className="sidebar-account-wrapper" ref={accountRef}>
            <button
              className="sidebar-profile"
              onClick={() => setAccountOpen((previous) => !previous)}
              aria-expanded={accountOpen}
            >
              <div className="profile-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="profile-info">
                <strong>{user?.name || "User"}</strong>
                <span>Personal account</span>
              </div>

              <MoreHorizontal size={19} />
            </button>

            {accountOpen && (
              <div className="sidebar-account-menu">
                <button onClick={() => navigate("/profile")}>
                  <UserRound size={17} />
                  My Profile
                  <ChevronRight size={15} />
                </button>

                <button onClick={() => navigate("/settings")}>
                  <Settings size={17} />
                  Account Settings
                  <ChevronRight size={15} />
                </button>

                <button className="account-logout" onClick={handleLogout}>
                  <LogOut size={17} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="premium-main">
        <div className="mobile-topbar">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>
          <strong>Sweety<span className="brand-dot">.</span></strong>
        </div>

        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
