import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import api from "../services/api";
import { fetchCart } from "../features/cart/cartThunks";
// import "./Payment.css";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order;
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  const handlePayment = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError("");

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay Checkout.");
      }

      const data = await api(`/api/orders/${order._id}/payment`, {
        method: "POST",
      });

      if (!data.success) {
        throw new Error(data.message || "Could not create payment order.");
      }

      const checkout = new window.Razorpay({
        key: data.keyId,
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: "ShopKart",
        description: "Payment for your order",
        order_id: data.razorpayOrder.id,

        handler: async (response) => {
          try {
            const result = await api(
              `/api/orders/${order._id}/verify-payment`,
              {
                method: "POST",
                body: JSON.stringify(response),
              }
            );

            if (!result.success) {
              throw new Error(
                result.message || "Payment verification failed."
              );
            }

            // Payment is verified. Cart refresh is a separate operation.
            dispatch(fetchCart());

            navigate("/home", {
              replace: true,
              state: {
                paymentSuccess: true,
                message: "Payment successful! Your order is confirmed.",
                orderId: order._id,
              },
            });
          } catch (err) {
            setError(
              err.message ||
              "We couldn't confirm the order status. Please check your orders before retrying."
            );
          }
        },

        prefill: {
          name: order.deliveryAddress?.fullName || "",
          contact: order.deliveryAddress?.phone || "",
        },

        theme: { color: "#2563eb" },
        modal: {
          ondismiss: () => {
            setError("Payment cancelled. Your order is still pending.");
            setLoading(false)
          },
        },
      });

      checkout.on("payment.failed", () => {
        setError("Payment failed or was not completed. You can try again.");
        setLoading(false);
      });

      checkout.open();
    } catch (err) {
      setError(err.message || "Unable to start payment.");
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <div className="payment-page">
        <div className="payment-empty">
          <h2>No order details found</h2>
          <p>Please return to your cart and try again.</p>
          <button
            className="payment-secondary-btn"
            onClick={() => navigate("/cart")}
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="payment-page">
      <div className="payment-container">
        <div className="payment-heading">
          <span className="payment-eyebrow">SHOPKART CHECKOUT</span>
          <h1>Complete your payment</h1>
          <p>Review your order before proceeding to secure checkout.</p>
        </div>

        <div className="payment-layout">
          <section className="payment-card payment-summary">
            <div className="payment-card-heading">
              <div>
                <span className="payment-step">ORDER SUMMARY</span>
                <h2>Your order</h2>
              </div>
              <span className="payment-bag">🛍️</span>
            </div>

            <p className="payment-order-id">
              Order ID: <span>{order._id}</span>
            </p>

            <div className="payment-items">
              {order.items?.length > 0 ? (
                order.items.map((item, index) => (
                  <div
                    className="payment-item"
                    key={item.product?._id || item.product || index}
                  >
                    <div className="payment-item-image">
                      {item.image ? (
                        <img src={item.image} alt={item.name || "Product"} />
                      ) : (
                        <span>📦</span>
                      )}
                    </div>

                    <div className="payment-item-details">
                      <h3>{item.name || item.product?.name || "Product"}</h3>
                      <p>Quantity: {item.quantity}</p>
                    </div>

                    <strong>
                      {formatPrice(
                        Number(item.price || 0) * Number(item.quantity || 0)
                      )}
                    </strong>
                  </div>
                ))
              ) : (
                <p className="payment-muted">
                  Your order has been created. The total below reflects the
                  saved order amount.
                </p>
              )}
            </div>

            <div className="payment-total">
              <span>Total payable</span>
              <strong>{formatPrice(order.totalAmount)}</strong>
            </div>
          </section>

          <aside className="payment-card payment-method">
            <span className="payment-step">PAYMENT METHOD</span>
            <h2>Secure checkout</h2>

            <div className="payment-security">
              <span className="payment-lock">🔒</span>
              <div>
                <strong>Powered by Razorpay</strong>
                <p>
                  Continue to Razorpay Checkout to choose an available payment
                  method.
                </p>
              </div>
            </div>

            {error && (
              <div className="payment-error" role="alert">
                <strong>Payment couldn't be completed</strong>
                <p>{error}</p>
              </div>
            )}

            <button
              className="payment-primary-btn"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? "Opening checkout..." : `Pay ${formatPrice(order.totalAmount)} securely`}
              {!loading && <span>→</span>}
            </button>

            <button
              className="payment-back-btn"
              onClick={() => navigate("/cart")}
              disabled={loading}
            >
              ← Back to Cart
            </button>

            <p className="payment-footnote">
              🔐 Your payment is processed through Razorpay Checkout.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Payment;