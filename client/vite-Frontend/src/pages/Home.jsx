import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";


function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentInfo = location.state;
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCustomer = async () => {
      try {
        const data = await api("/customers/me");
        setCustomer(data);
      } catch (error) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    getCustomer();
  }, [navigate]);

  if (loading) {
    return <h2 className="loading">Loading ShopKart...</h2>;
  }

  if (!customer) {
    return null;
  }

  return (
    <main className="home">
      {paymentInfo?.paymentSuccess && (
        <div className="payment-success">
          <h2>✓ Payment Successful!</h2>
          <p>{paymentInfo.message}</p>
          <p>
            Order ID: <strong>{paymentInfo.orderId}</strong>
          </p>
        </div>
      )}
      <section className="home-hero">
        <div className="hero-content">
          <span className="hero-eyebrow">YOUR EVERYDAY STORE</span>

          <h1>
            Find your next
            <span> favourite thing.</span>
          </h1>

          <p>
            Hey, {customer.fullName}! Explore products you'll love,
            all in one place.
          </p>

          <button
            className="hero-shop-btn"
            onClick={() => navigate("/products")}
          >
            Explore Products <span>→</span>
          </button>

          <div className="hero-trust">
            <span>✓ Easy shopping</span>
            <span>✓ Your personal wishlist</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-circle">
            <span className="hero-bag">🛍️</span>
          </div>
          <div className="hero-floating-card">
            <span>✨</span>
            <div>
              <strong>Your next favourite</strong>
              <small>is waiting for you</small>
            </div>
          </div>
        </div>
      </section>

      <section className="home-featured">
        <div>
          <span className="section-eyebrow">HANDPICKED FOR YOU</span>
          <h2>Something worth discovering.</h2>
          <p>Browse our collection and find something you'll love.</p>
        </div>

        <button
          className="hero-shop-btn"
          onClick={() => navigate("/products")}
        >
          Browse the collection →
        </button>
      </section>

      <section className="home-account">
        <div className="account-avatar">
          {customer.fullName?.charAt(0)?.toUpperCase()}
        </div>

        <div className="account-details">
          <span className="section-eyebrow">YOUR ACCOUNT</span>
          <h2>Welcome back, {customer.fullName}</h2>
          <p>{customer.email}</p>
          <p>{customer.phone}</p>
        </div>
      </section>
    </main>
  );
}

export default Home;
