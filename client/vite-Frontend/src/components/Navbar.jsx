
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import api from "../services/api";
import { fetchCart } from "../features/cart/cartThunks";
import { clearCart } from "../features/cart/cartSlice";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart.items);

  // Total number of individual units in the cart
  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await api("/customers/logout", {
        method: "POST"
      });
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(clearCart());
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      <h2>ShopKart</h2>

      <div className="navbar-links">
        <Link to="/home">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/wishlist">♡ Wishlist</Link>
        <Link to="/cart">
          🛒 Cart ({cartCount})
        </Link>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
