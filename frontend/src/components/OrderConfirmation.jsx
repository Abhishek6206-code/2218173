import React, { useContext } from "react";
import AppContext from "../context/AppContext";

const OrderConfirmation = () => {
  const { userOrder } = useContext(AppContext);
  
  return (
    <div className="container my-5">
      <h2>Order Confirmation</h2>
      <p>Order confirmation component - implementation coming soon</p>
    </div>
  );
};

export default OrderConfirmation;