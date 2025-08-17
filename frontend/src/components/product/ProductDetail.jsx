import React, { useContext } from "react";
import AppContext from "../../context/AppContext";

const ProductDetail = () => {
  const { products } = useContext(AppContext);
  
  return (
    <div className="container my-5">
      <h2>Product Detail</h2>
      <p>Product detail component - implementation coming soon</p>
    </div>
  );
};

export default ProductDetail;