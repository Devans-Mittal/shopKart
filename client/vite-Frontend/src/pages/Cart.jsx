
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { fetchCart } from "../features/cart/cartThunks";

function Cart() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { items, loading, error } = useSelector(
        (state) => state.cart
    );

    useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    const totalQuantity = items.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const subtotal = items.reduce(
        (total, item) =>
            total + (item.product?.price || 0) * item.quantity,
        0
    );

    const updateQuantity = async (productId, quantity) => {
        try {
            await api(`/api/cart/${productId}`, {
                method: "PATCH",
                body: JSON.stringify({ quantity })
            });

            await dispatch(fetchCart()).unwrap();
        } catch (error) {
            alert(error.message || "Could not update quantity.");
        }
    };

    const removeItem = async (productId) => {
        try {
            await api(`/api/cart/${productId}`, {
                method: "DELETE"
            });

            await dispatch(fetchCart()).unwrap();
        } catch (error) {
            alert(error.message || "Could not remove product.");
        }
    };

    if (loading) {
        return <div className="cart-page"><p>Loading your cart...</p></div>;
    }

    if (error) {
        return (
            <div className="cart-page">
                <h1>My Shopping Cart</h1>
                <p className="error-message">{error}</p>
                <button onClick={() => dispatch(fetchCart())}>
                    Try Again
                </button>
            </div>
        );
    }


    if (items.length === 0) {
        return (
            <div className="cart-page">
                <div className="cart-empty">
                    <div className="cart-empty-icon">
                        🛍️
                    </div>

                    <h1>Your cart is waiting</h1>

                    <p>
                        Looks like you haven't added anything yet.
                        Explore our collection and find something you'll love.
                    </p>

                    <button
                        className="cart-checkout-btn"
                        onClick={() => navigate("/products")}
                    >
                        Browse Products →
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="cart-page">
            <h1>My Shopping Cart</h1>
            <p>{totalQuantity} items in your cart</p>

            <div className="cart-layout">
                <div className="cart-items">
                    {items.map((item) => {
                        const product = item.product;

                        if (!product) return null;

                        return (
                            <div className="cart-item" key={product._id}>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="cart-item-image"
                                />

                                <div className="cart-item-details">
                                    <h3>{product.name}</h3>
                                    <p>₹{product.price.toLocaleString("en-IN")}</p>
                                    <p>
                                        {product.stock} available
                                    </p>

                                    <div className="cart-quantity">
                                        <button
                                            disabled={item.quantity <= 1}
                                            onClick={() =>
                                                updateQuantity(
                                                    product._id,
                                                    item.quantity - 1
                                                )
                                            }
                                        >
                                            −
                                        </button>

                                        <span>{item.quantity}</span>

                                        <button
                                            disabled={item.quantity >= product.stock}
                                            onClick={() =>
                                                updateQuantity(
                                                    product._id,
                                                    item.quantity + 1
                                                )
                                            }
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        className="cart-remove-btn"
                                        onClick={() => removeItem(product._id)}
                                    >
                                        Remove
                                    </button>
                                </div>

                                <p className="cart-item-total">
                                    ₹{(product.price * item.quantity).toLocaleString("en-IN")}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <aside className="cart-summary">
                    <h2>Order Summary</h2>

                    <div className="cart-summary-row">
                        <span>Total items</span>
                        <span>{totalQuantity}</span>
                    </div>

                    <div className="cart-summary-row">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="cart-summary-row cart-grand-total">
                        <strong>Total</strong>
                        <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
                    </div>

                    <button
                        className="cart-checkout-btn"
                        onClick={() => navigate("/checkout")}
                    >
                        Proceed to Checkout
                    </button>

                    <button
                        className="cart-continue-btn"
                        onClick={() => navigate("/products")}
                    >
                        Continue Shopping
                    </button>
                </aside>
            </div>
        </div>
    );
}

export default Cart;
