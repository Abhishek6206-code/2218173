import React, { useContext } from "react";
import AppContext from "../context/AppContext";

const Checkout = () => {
  const { cart } = useContext(AppContext);
  
  return (
    <div className="container my-5">
      <h2>Checkout</h2>
      <p>Checkout component - implementation coming soon</p>
    </div>
  );
};

export default Checkout;