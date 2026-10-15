import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useDispatch } from "react-redux";
import { fetchCart } from "../features/cart/cartThunks";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const [cartLoading, setCartLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const getProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await api(`/api/products/${id}`);

        if (active) { setProduct(data.product || data); }
      } catch (error) {
        if (active) { setError(error.message || "Unable to load this product."); }
      } finally {
        if (active) setLoading(false);
      }
    };
    getProduct();
    return () => { active = false; };
  }, [id]);



  const handleAddToCart = async () => {
    console.log("Add to Cart clicked");
    console.log("Product:", product);

    try {
      setCartLoading(true);
      setCartMessage("");
      setCartError("");

      const data = await api(`/api/cart/${product._id}`, {
        method: "POST"
      });

      console.log("Add to cart response:", data);
      setCartMessage(data.message || "Added to cart!");

      const cartData = await dispatch(fetchCart()).unwrap();
      console.log("Updated Redux cart:", cartData);
    } catch (error) {
      console.error("Add to cart error:", error);
      setCartError(error.message || "Could not add product to cart.");
    } finally {
      setCartLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="details-message">
        <p>Loading product...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="details-message">
        <h2>Couldn't load this product</h2>
        <p className="error">{error}</p>
        <button
          className="details-secondary-btn"
          onClick={() => navigate("/products")}
        >
          ← Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="details-message">
        <h2>Product not found</h2>
        <button
          className="details-secondary-btn"
          onClick={() => navigate("/products")}
        >
          ← Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <button
        className="details-back-btn"
        onClick={() => navigate("/products")}
      >
        ← Back to Products
      </button>

      <div className="product-details-card">
        <div className="details-image-section">
          <img
            src={product.image}
            alt={product.name}
            className="details-product-image"
          />
        </div>

        <div className="details-info">
          <span className="details-category">
            {product.category}
          </span>

          <h1>{product.name}</h1>

          <p className="details-description">
            {product.description}
          </p>

          <p className="details-price">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </p>

          <p
            className={`details-stock ${product.stock > 0 ? "in-stock" : "out-of-stock"
              }`}
          >
            {product.stock > 0
              ? `✓ In stock (${product.stock} available)`
              : "Out of stock"}
          </p>

          <div className="details-actions">
            <button
              className="details-primary-btn"
              disabled={product.stock <= 0 || cartLoading}
              onClick={handleAddToCart}
            >
              {cartLoading
                ? "Adding..."
                : product.stock <= 0
                  ? "Out of Stock"
                  : "Add to Cart"}
            </button>

            <button
              className="details-secondary-btn"
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </button>
          </div>

          {cartMessage && (
            <p className="success-message">{cartMessage}</p>
          )}

          {cartError && (
            <p className="error-message">{cartError}</p>
          )}

          <div className="details-delivery-note">
            <span>↗</span>
            <p>Browse ShopKart for more products you might love.</p>
          </div>
        </div>
      </div>
    </div>

  );
}

export default ProductDetails;