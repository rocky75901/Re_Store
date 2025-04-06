import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Viewproductcard.css";
import Layout from "../components/layout";
import { toast, Toaster } from "react-hot-toast";
import { addToCart } from "../services/addtocartservice";
import restoreLogo from "../assets/Re_store_logo_login.png";
import { createOrGetChat } from "../chat/chatService";

const ViewProductCard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [sellerName, setSellerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [user, setUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const thumbnailsPerView = 3;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const BACKEND_URL =
          import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
        const response = await fetch(`${BACKEND_URL}/api/v1/products/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await response.json();

        if (data?.status === "success" && data?.data?.product) {
          const productData = data.data.product;

          // Log image paths specifically for debugging

          if (productData.images && productData.images.length > 0) {
          }

          setProduct(productData);
          setCurrentImage(productData.imageCover);

          // Set seller name directly from product data
          if (productData.sellerName) {
            setSellerName(productData.sellerName);
          }
        } else {
          throw new Error("Product not found");
        }
      } catch (error) {
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("user"));
    if (userData) {
      setUser(userData);
    }
  }, []);

  const handleAddToCart = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to add items to cart");
      return;
    }

    // Check if current user is the seller
    const currentUser = JSON.parse(sessionStorage.getItem("user"));

    if (
      currentUser &&
      product &&
      product.seller &&
      currentUser._id === product.seller._id
    ) {
      toast.error("You cannot buy your own product");
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(id);
      toast.success("Added to cart");
    } catch (error) {
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleContactSeller = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to contact seller");
      return;
    }

    try {
      // Get seller ID from all possible locations
      let sellerId;

      // Try to get seller ID in order of most likely locations
      if (
        product.seller &&
        typeof product.seller === "object" &&
        product.seller._id
      ) {
        sellerId = product.seller._id;
      } else if (
        product.sellerId &&
        typeof product.sellerId === "object" &&
        product.sellerId._id
      ) {
        sellerId = product.sellerId._id;
      } else if (typeof product.seller === "string") {
        sellerId = product.seller;
      } else if (typeof product.sellerId === "string") {
        sellerId = product.sellerId;
      }

      if (!sellerId) {
        toast.error("Could not find seller information");
        return;
      }

      // Create or get existing chat
      const chat = await createOrGetChat(sellerId);
      if (!chat) {
        toast.error("Failed to initialize chat");
        return;
      }

      // Navigate to messages with chat information
      navigate("/messages", {
        state: {
          sellerId: sellerId,
          sellerName:
            product.sellerName || product.seller?.username || "Seller",
          chatId: chat._id,
          openChat: true,
        },
      });
    } catch (error) {
      if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(error.message || "Failed to start chat with seller");
      }
    }
  };

  const handleDeleteProduct = async () => {
    if (!user || !product?.sellerId) return;

    try {
      setIsDeleting(true);
      const token = sessionStorage.getItem("token");
      const BACKEND_URL =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

      const response = await fetch(`${BACKEND_URL}/api/v1/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      toast.success("Product deleted successfully");
      navigate("/home");
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return restoreLogo;
    }

    const BACKEND_URL =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

    // Check if the path already includes http:// or https://
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    // Handle product-*-cover.jpeg pattern
    if (imagePath.startsWith("product-")) {
      const fullUrl = `${BACKEND_URL}/img/products/${imagePath}`;
      return fullUrl;
    }

    // Handle imageCover property which might be just a filename
    if (!imagePath.includes("/")) {
      const fullUrl = `${BACKEND_URL}/uploads/products/${imagePath}`;
      return fullUrl;
    }

    // Make sure path starts with /
    const formattedPath = imagePath.startsWith("/")
      ? imagePath
      : `/${imagePath}`;
    const fullUrl = `${BACKEND_URL}${formattedPath}`;
    return fullUrl;
  };

  if (loading) {
    return (
      <div className="loading-container-sell">
        <div className="loading-spinner-sell"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-container-sell">
        <p>{error || "Product not found"}</p>
      </div>
    );
  }

  return (
    <div className="product-details-container-sell">
      <Toaster position="top-right" />
      <div className="product-details-container-left-half-sell">
        <div className="product-header-sell">
          <h1>{product?.name || "Untitled Product"}</h1>
          {user && product?.sellerId && product.sellerId._id === user._id && (
            <button
              className="delete-product-btn-sell"
              onClick={handleDeleteProduct}
              disabled={isDeleting}
            >
              <i className="fas fa-trash"></i>
              {isDeleting ? "Deleting..." : "Delete Product"}
            </button>
          )}
        </div>

        <div className="main-image-container-sell">
          <img
            src={getImageUrl(currentImage || product?.imageCover)}
            alt={product?.name || "Product Image"}
            className="main-image-sell"
            onError={(e) => {
              const BACKEND_URL =
                import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
              const imgPath = currentImage || product?.imageCover;

              // Try a series of different paths if not already tried
              if (imgPath) {
                // If current URL is from img/products, try uploads/products
                if (e.target.src.includes("/img/products/")) {
                  e.target.src = `${BACKEND_URL}/uploads/products/${imgPath}`;
                  return;
                }

                // If current URL is from uploads/products, try images folder
                if (e.target.src.includes("/uploads/products/")) {
                  e.target.src = `${BACKEND_URL}/images/${imgPath}`;
                  return;
                }

                // If current URL is from images folder, try API endpoint
                if (e.target.src.includes("/images/")) {
                  e.target.src = `${BACKEND_URL}/api/v1/images/${imgPath}`;
                  return;
                }
              }

              // If all attempts fail, use fallback logo
              e.target.src = restoreLogo;
              e.target.onerror = null; // Prevent infinite loop
            }}
          />
        </div>

        <div className="thumbnail-container-sell">
          <div className="thumbnail-wrapper-sell">
            <div
              className="thumbnail-slider-sell"
              style={{
                display: "flex",
                overflowX: "auto",
                gap: "10px",
                padding: "10px 0",
                scrollbarWidth: "thin",
                scrollbarColor: "#4152b3 #f1f1f1",
                msOverflowStyle: "none",
                "&::-webkit-scrollbar": {
                  height: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#f1f1f1",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "linear-gradient(to right, #4152b3, #5a6bc3)",
                  borderRadius: "4px",
                  border: "2px solid #f1f1f1",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: "linear-gradient(to right, #5a6bc3, #4152b3)",
                },
              }}
            >
              {product?.imageCover && (
                <div
                  className={`thumbnail-sell ${
                    currentImage === product.imageCover ? "active" : ""
                  }`}
                  onClick={() => setCurrentImage(product.imageCover)}
                  style={{ flex: "0 0 auto" }}
                >
                  <img
                    src={getImageUrl(product.imageCover)}
                    alt="Product cover"
                    onError={(e) => {
                      e.target.src = restoreLogo;
                      e.target.onerror = null;
                    }}
                  />
                </div>
              )}
              {product?.images?.map((image, index) => (
                <div
                  key={index}
                  className={`thumbnail-sell ${
                    currentImage === image ? "active" : ""
                  }`}
                  onClick={() => setCurrentImage(image)}
                  style={{ flex: "0 0 auto" }}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`Product view ${index + 1}`}
                    onError={(e) => {
                      e.target.src = restoreLogo;
                      e.target.onerror = null;
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="product-info-section-sell">
        <div className="price-section-sell">
          <h2>₹{product.sellingPrice}</h2>
          {product.buyingPrice && (
            <p className="original-price-sell">
              Original Price: ₹{product.buyingPrice}
            </p>
          )}
        </div>

        <div className="product-description-sell">
          <h3>Description</h3>
          <p>{product?.description || "No description available"}</p>
        </div>

        <div className="seller-info-sell">
          <h3>Product Details</h3>
          <p>
            <i className="fas fa-user"></i> Seller:{" "}
            {product.sellerName ||
              (product.seller && typeof product.seller === "object"
                ? product.seller.username
                : "Unknown Seller")}
          </p>
          <p>
            <i className="fas fa-box"></i> Condition: {product.condition}
          </p>
          <p>
            <i className="fas fa-clock"></i> Used for: {product.usedFor} months
          </p>
        </div>

        <div className="action-buttons-sell">
          <button
            className="contact-seller-sell"
            onClick={handleContactSeller}
            disabled={addingToCart}
          >
            <i className="fas fa-envelope"></i>
            Contact Seller
          </button>
          <button
            className="add-to-cart-sell"
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            <i className="fas fa-shopping-cart"></i>
            {addingToCart ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewProductCard;
