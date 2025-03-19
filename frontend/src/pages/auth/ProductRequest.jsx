import React from "react";
import Layout from "./layout";
import ProductRequestcard from "./productRequestcard";
import ToggleButton from "./ToggleButton";

export default function ProductRequest() {
  return (
    <Layout>
      <ToggleButton />
      <div className="product-request-grid">
        <ProductRequestcard />
        <ProductRequestcard />
        <ProductRequestcard />
        <ProductRequestcard />
        <ProductRequestcard />
      </div>
    </Layout>
  );
}
