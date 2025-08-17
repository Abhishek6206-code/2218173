import React, { useContext } from "react";
import AppContext from "../../context/AppContext";

const SearchProduct = () => {
  const { products } = useContext(AppContext);
  
  return (
    <div className="container my-5">
      <h2>Search Products</h2>
      <p>Search product component - implementation coming soon</p>
    </div>
  );
};

export default SearchProduct;