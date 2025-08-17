import React, { useContext } from "react";
import AppContext from "../context/AppContext";

const Cart = () => {
  const { cart } = useContext(AppContext);
  
  return (
    <div className="container my-5">
      <h2>Shopping Cart</h2>
      <p>Cart component - implementation coming soon</p>
    </div>
  );
};

export default Cart;