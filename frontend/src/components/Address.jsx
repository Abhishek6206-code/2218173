import React, { useContext } from "react";
import AppContext from "../context/AppContext";

const Address = () => {
  const { userAddress } = useContext(AppContext);
  
  return (
    <div className="container my-5">
      <h2>Shipping Address</h2>
      <p>Address component - implementation coming soon</p>
    </div>
  );
};

export default Address;