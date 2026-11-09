import { UserRound, Mail, ShieldCheck, CalendarDays } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user } = useAuth();

  const name = user?.name || "User";
  const email = user?.email || "Email not available";

  return (
    <div className="profile-page">
      <header className="premium-header">
        <div>
          <span className="readings-eyebrow">ACCOUNT</span>
          <h1>My Profile</h1>
          <p>View your personal account information.</p>
        </div>
      </header>

      <section className="profile-card">
        <div className="profile-banner">
          <div className="profile-large-avatar">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2>{name}</h2>
            <p>Personal account</p>
          </div>
        </div>

        <div className="profile-details">
          <h3>Personal Information</h3>

          <div className="profile-detail-row">
            <div className="profile-detail-icon">
              <UserRound size={20} />
            </div>
            <div>
              <span>Full Name</span>
              <strong>{name}</strong>
            </div>
          </div>

          <div className="profile-detail-row">
            <div className="profile-detail-icon">
              <Mail size={20} />
            </div>
            <div>
              <span>Email Address</span>
              <strong>{email}</strong>
            </div>
          </div>

          <div className="profile-detail-row">
            <div className="profile-detail-icon">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span>Account Status</span>
              <strong>Active</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Profile;