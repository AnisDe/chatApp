import React, { useState, useEffect } from "react";
import "./loginPage.css";
import axiosInstance from "../../lib/axios";
const EditProfile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("user/profile/me", {
          withCredentials: true,
        });
        setUsername(res.data.user.username || "");
        setEmail(res.data.user.email || "");
      } catch (err) {
        setErrorMsg(err.message || "Error loading profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await axiosInstance.put("/user/edit/me", {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setSuccessMsg("Profile updated!");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-card">
          <form onSubmit={handleSubmit} className="w-100">
            <h2 className="h4 mb-4 text-center" style={{ color: "black" }}>Edit Profile</h2>

            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                placeholder={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-control"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                placeholder={email}
                disabled
                className="form-control-plaintext"
              />
            </div>

            {successMsg && (
              <div className="alert alert-success py-2 message">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="alert alert-danger py-2 message">{errorMsg}</div>
            )}

            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      </div>
       <div className="login-right">
        <div className="promo">
          <h2>Edit user</h2>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur
            veniam voluptatem magni, obcaecati aperiam mollitia quisquam
            distinctio explicabo itaque cumque excepturi nesciunt doloremque
            unde consequuntur omnis cum provident. Animi, cupiditate.
          </p>
          <button className="learn-btn">Learn More ›</button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
