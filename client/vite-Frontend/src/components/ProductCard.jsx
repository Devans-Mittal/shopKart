
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../services/api";
import { fetchCart } from "../features/cart/cartThunks";

function ProductCard({
  product,
  wishlisted,
  wishlistLoading,
  onWishlistChange
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [saving, setSaving] = useState(false);
  const [cartSaving, setCartSaving] = useState(false);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");

  const handleAddToWishlist = async () => {
    try {
      setSaving(true);
      setError("");

      await api(`/api/wishlist/${product._id}`, {
        method: "POST"
      });

      onWishlistChange(product._id, true);
    } catch (error) {
      setError(error.message || "Could not add product to wishlist.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      setCartSaving(true);
      setCartMessage("");
      setError("");

      const data = await api(`/api/cart/${product._id}`, {
        method: "POST"
      });

      await dispatch(fetchCart()).unwrap();

      setCartMessage(data.message || "Product added to cart!");
      setTimeout(() => {
        setCartMessage("");
      }, 2000);
    } catch (error) {
      setError(
        error.message || "Could not add product to cart."
      );
    } finally {
      setCartSaving(false);
    }
  };

  return (
    <div className="product-card">
      <img
        src={product.image}
        alt={product.name}
        className="product-image"
      />

      <div className="product-card-content">
        <p className="product-category">{product.category}</p>
        <h2>{product.name}</h2>

        <p className="product-price">₹{product.price}</p>

        <p className="product-stock">
          {product.stock > 0
            ? `${product.stock} in stock`
            : "Out of stock"}
        </p>

        <button
          onClick={() => navigate(`/products/${product._id}`)}
        >
          View Details
        </button>

        <button
          onClick={handleAddToCart}
          disabled={cartSaving || product.stock === 0}
        >
          {cartSaving
            ? "⏳ Adding..."
            : product.stock === 0
              ? "Out of Stock"
              : "🛒 Add to Cart"}
        </button>

        <button
          className={`wishlist-btn ${wishlisted ? "wishlisted" : ""}`}
          onClick={handleAddToWishlist}
          disabled={saving || wishlistLoading || wishlisted}
        >
          {wishlistLoading
            ? "⏳ Checking Wishlist..."
            : saving
              ? "⏳ Saving..."
              : wishlisted
                ? "♥ Added to Wishlist"
                : "♡ Add to Wishlist"}
        </button>

        {cartMessage && (
          <p className="cart-success-message" role="status">
            ✓ {cartMessage}
          </p>
        )}

        {error && (
          <p className="error-message">{error}</p>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
