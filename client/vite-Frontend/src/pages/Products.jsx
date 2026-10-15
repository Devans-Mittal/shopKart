import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
function Products() {
//   const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (search) {
          params.append("search", search);
        }

        if (category) {
          params.append("category", category);
        }

        const query = params.toString();

        const data = await api(
          `/api/products${query ? `?${query}` : ""}`
        );

        setProducts(data.products);

      } catch (error) {
        setError("Something went wrong while loading products.");
      } finally {
        setLoading(false);
      }
    };

    getProducts();

  }, [search, category]);


  useEffect(() => {
    const getWishlist = async () => {
      try {
        const data = await api("/api/wishlist");

        setWishlistIds(
          data.wishlist.map((product) => product._id)
        );
      } catch (error) {
        console.error("Could not load wishlist:", error);
      } finally {
        setWishlistLoading(false);
      }
    };

    getWishlist();
  }, []);


  return (
    <div className="products-page">
      <h1>Products</h1>

      {/* SEARCH AND FILTERS */}

      <div className="product-filters">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Books">Books</option>
          <option value="Home">Home</option>
        </select>
      </div>

      {/* LOADING */}

      {loading && <h2>Loading products...</h2>}

      {/* ERROR */}

      {error && <p className="error">{error}</p>}

      {/* EMPTY STATE */}

      {!loading && !error && products.length === 0 && (
        <p>No products found.</p>
      )}

      {/* PRODUCTS */}

      {!loading && !error && products.length > 0 && (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
                key={product._id}
                product={product}
                wishlisted={wishlistIds.includes(product._id)}
                wishlistLoading={wishlistLoading}
                onWishlistChange={(productId, added) => {
                  setWishlistIds((current) =>
                    added
                      ? [...current, productId]
                      : current.filter((id) => id !== productId)
                  );
                }}
            />
            ))}
        </div>
      )}
    </div>
  );
}

export default Products;