import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
function Wishlist() {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removingId, setRemovingId] = useState("");
    const fetchWishlist = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await api("/api/wishlist");
            setWishlist(data.wishlist || []);
        } catch (error) {
            setError(error.message || "Unable to load wishlist.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchWishlist();
    }, []);
    const handleRemove = async (productId) => {
        try {
            setRemovingId(productId);
            await api(`/api/wishlist/${productId}`, {
                method: "DELETE"
            });
            setWishlist((current) =>
                current.filter((product) => product._id !== productId)
            );
        } catch (error) {
            setError(error.message || "Unable to remove this product.");
        } finally {
            setRemovingId("");
        }
    };
    //   if (loading) {
    //     return <p>Loading your wishlist...</p>;
    //   }
    //   if (error) {
    //     return (
    //       <div>
    //         <p>Unable to load wishlist. {error}</p>
    //         <button onClick={fetchWishlist}>Try Again</button>
    //       </div>
    //     );
    //   }
    //   if (wishlist.length === 0) {
    //     return (
    //       <div className="wishlist-empty">
    //         <h2>Your wishlist is empty ❤️</h2>
    //         <p>Start saving products you love.</p>
    //         <button onClick={() => navigate("/products")}>
    //           Browse Products
    //         </button>
    //       </div>
    //     );
    //   }
    return (
        <div className="wishlist-page">
            <div className="wishlist-heading">
                <div>
                    <p className="wishlist-eyebrow">YOUR COLLECTION</p>
                    <h1>My Wishlist <span>♥</span></h1>
                    <p className="wishlist-subtitle">
                        The products you've saved for later.
                    </p>
                </div>

                {!loading && !error && wishlist.length > 0 && (
                    <span className="wishlist-count">
                        {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
                    </span>
                )}
            </div>

            {loading && (
                <div className="wishlist-state">
                    <div className="wishlist-spinner" />
                    <h2>Loading your wishlist...</h2>
                    <p>Getting your saved products.</p>
                </div>
            )}

            {!loading && error && (
                <div className="wishlist-state">
                    <div className="wishlist-state-icon">!</div>
                    <h2>Couldn't load your wishlist</h2>
                    <p>{error}</p>

                    <button
                        className="wishlist-primary-btn"
                        onClick={fetchWishlist}
                    >
                        Try Again
                    </button>

                    <button
                        className="wishlist-text-btn"
                        onClick={() => navigate("/products")}
                    >
                        Browse Products
                    </button>
                </div>
            )}

            {!loading && !error && wishlist.length === 0 && (
                <div className="wishlist-state">
                    <div className="wishlist-empty-icon">♡</div>
                    <h2>Your wishlist is empty</h2>
                    <p>Found something you like? Save it here for later.</p>

                    <button
                        className="wishlist-primary-btn"
                        onClick={() => navigate("/products")}
                    >
                        Explore Products
                    </button>
                </div>
            )}

            {!loading && !error && wishlist.length > 0 && (
                <div className="wishlist-grid">
                    {wishlist.map((product) => (
                        <article className="wishlist-card" key={product._id}>
                            <div className="wishlist-image-wrap">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="wishlist-product-image"
                                />

                                <button
                                    className="wishlist-remove-icon"
                                    title="Remove from wishlist"
                                    aria-label={`Remove ${product.name} from wishlist`}
                                    disabled={removingId === product._id}
                                    onClick={() => handleRemove(product._id)}
                                >
                                    {removingId === product._id ? "…" : "♥"}
                                </button>
                            </div>

                            <div className="wishlist-card-content">
                                <p className="wishlist-product-category">
                                    {product.category}
                                </p>

                                <h2>{product.name}</h2>

                                <p className="wishlist-product-price">
                                    ₹{Number(product.price).toLocaleString("en-IN")}
                                </p>

                                <p
                                    className={`wishlist-stock ${product.stock > 0 ? "available" : "unavailable"
                                        }`}
                                >
                                    {product.stock > 0
                                        ? `${product.stock} in stock`
                                        : "Out of stock"}
                                </p>

                                <button
                                    className="wishlist-view-btn"
                                    onClick={() => navigate(`/products/${product._id}`)}
                                >
                                    View Product →
                                </button>

                                <button
                                    className="wishlist-remove-btn"
                                    disabled={removingId === product._id}
                                    onClick={() => handleRemove(product._id)}
                                >
                                    {removingId === product._id
                                        ? "Removing..."
                                        : "Remove from Wishlist"}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>

    );
}
export default Wishlist;