import React, { useContext } from "react";
import AppContext from "../../context/AppContext";

const Profile = () => {
  const { user } = useContext(AppContext);
  
  return (
    <div className="container my-5">
      <h2>User Profile</h2>
      <p>Profile component - implementation coming soon</p>
    </div>
  );
};

export default Profile;