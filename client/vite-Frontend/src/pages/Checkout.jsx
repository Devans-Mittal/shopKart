
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Checkout() {
    const navigate = useNavigate();

    const { items, loading } = useSelector((state) => state.cart);

    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        addressLine: "",
        city: "",
        state: "",
        pincode: ""
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const totalQuantity = items.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const totalAmount = items.reduce(
        (total, item) =>
            total + (item.product?.price || 0) * item.quantity,
        0
    );

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (loading) {
            setError("Please wait while your cart loads.");
            return;
        }

        if (items.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        if (!/^\d{10}$/.test(form.phone.trim())) {
            setError("Enter a valid 10-digit phone number.");
            return;
        }

        if (!/^\d{6}$/.test(form.pincode.trim())) {
            setError("Enter a valid 6-digit PIN code.");
            return;
        }

        try {
            setSubmitting(true);

            const data = await api("/api/orders", {
                method: "POST",
                body: JSON.stringify(form)
            });

            if (!data.success) {
                throw new Error(data.message || "Could not create order.");
            }

            // Save the new order ID for the next payment step.
            navigate("/checkout/payment", {
                state: { order: data.order }
            });
        } catch (err) {
            setError(err.message || "Could not place your order.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="checkout-page">Loading your cart...</div>;
    }

    if (items.length === 0) {
        return (
            <div className="checkout-page">
                <h1>Your cart is empty</h1>
                <button onClick={() => navigate("/products")}>
                    Browse Products
                </button>
            </div>
        );
    }

    return (
        <main className="checkout-page">
            <h1>Checkout</h1>
            <p className="checkout-subtitle">
                Enter your delivery details to continue.
            </p>

            <div className="checkout-layout">
                <form className="checkout-form" onSubmit={handleSubmit}>
                    <h2>Delivery Address</h2>

                    <label htmlFor="fullName">Full name</label>
                    <input
                        id="fullName"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        required
                        maxLength={100}
                        autoComplete="name"
                    />

                    <label htmlFor="phone">Phone number</label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        maxLength={10}
                        inputMode="numeric"
                        autoComplete="tel"
                    />

                    <label htmlFor="addressLine">Address</label>
                    <textarea
                        id="addressLine"
                        name="addressLine"
                        value={form.addressLine}
                        onChange={handleChange}
                        required
                        maxLength={300}
                        autoComplete="street-address"
                    />

                    <div className="checkout-form-row">
                        <div>
                            <label htmlFor="city">City</label>
                            <input
                                id="city"
                                name="city"
                                value={form.city}
                                onChange={handleChange}
                                required
                                maxLength={100}
                                autoComplete="address-level2"
                            />
                        </div>

                        <div>
                            <label htmlFor="state">State</label>
                            <input
                                id="state"
                                name="state"
                                value={form.state}
                                onChange={handleChange}
                                required
                                maxLength={100}
                                autoComplete="address-level1"
                            />
                        </div>
                    </div>

                    <label htmlFor="pincode">PIN code</label>
                    <input
                        id="pincode"
                        name="pincode"
                        value={form.pincode}
                        onChange={handleChange}
                        required
                        maxLength={6}
                        inputMode="numeric"
                        autoComplete="postal-code"
                    />

                    {error && (
                        <p className="checkout-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        className="checkout-place-order-btn"
                        type="submit"
                        disabled={submitting || loading}
                    >
                        {submitting ? "Creating order..." : "Place Order"}
                    </button>
                </form>

                <aside className="checkout-summary">
                    <h2>Order Summary</h2>

                    {items.map((item) => {
                        if (!item.product) return null;

                        return (
                            <div
                                className="checkout-summary-item"
                                key={item.product._id}
                            >
                                <span>
                                    {item.product.name} × {item.quantity}
                                </span>
                                <strong>
                                    ₹{(
                                        item.product.price * item.quantity
                                    ).toLocaleString("en-IN")}
                                </strong>
                            </div>
                        );
                    })}

                    <div className="checkout-summary-total">
                        <span>Total items</span>
                        <strong>{totalQuantity}</strong>
                    </div>

                    <div className="checkout-summary-total">
                        <span>Total</span>
                        <strong>
                            ₹{totalAmount.toLocaleString("en-IN")}
                        </strong>
                    </div>

                    <p className="checkout-secure-note">
                        Your final amount is recalculated securely by the server.
                    </p>
                </aside>
            </div>
        </main>
    );
}

export default Checkout;
