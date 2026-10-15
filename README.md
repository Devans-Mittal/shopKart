# ShopKart — MERN Stack E-Commerce Application

ShopKart is a full-stack e-commerce application built with MongoDB, Express.js, React, and Node.js (MERN). It demonstrates customer authentication, product browsing, a persistent wishlist and shopping cart, Redux Toolkit state management, order creation, and Razorpay payment integration.

## Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Run the Application](#run-the-application)
- [Application Workflows](#application-workflows)
- [API Routes](#api-routes)
- [Redux Cart State](#redux-cart-state)
- [Authentication and Security](#authentication-and-security)
- [Payment and Order Consistency](#payment-and-order-consistency)
- [Testing Checklist](#testing-checklist)
- [Troubleshooting](#troubleshooting)
- [Limitations and Future Improvements](#limitations-and-future-improvements)
- [Learning Outcomes](#learning-outcomes)

## Features

### Customer accounts
- Customer registration and login.
- Password hashing with bcrypt.
- JWT-based authentication using cookies.
- Protected endpoints for the current customer, cart, wishlist, and orders.
- Logout and password-change endpoints.

### Products
- Retrieve all products.
- Retrieve a product by ID.
- Create a product through the backend product endpoint.
- Product details can include name, description, category, price, image, and stock, depending on the product schema.

### Wishlist
- Add a product to the wishlist.
- Retrieve the current customer's wishlist.
- Remove a product from the wishlist.
- Authentication middleware protects wishlist routes.
- Product references can be expanded into product documents using Mongoose `populate()`.

### Shopping cart
- Add products to the cart.
- Retrieve the current customer's cart.
- Update item quantities.
- Remove items from the cart.
- Persist cart data in MongoDB so it can be retrieved again after a page refresh.
- Validate requested quantities against product stock on the backend.

### Frontend state management
- Redux Toolkit store and cart slice.
- Asynchronous cart operations in `cartThunks.js`.
- Loading, success, and error handling for asynchronous requests.
- Shared cart state for components such as the navbar and cart page.

### Orders and payments
- Create an order from the customer's cart.
- Create a Razorpay payment order.
- Verify payment through a backend endpoint.
- Convert rupees to paise when creating a Razorpay order.
- Handle payment cancellation and unsuccessful attempts in the frontend.
- Update order, cart, and inventory state after successful verification.
- Protect against duplicate processing of an already-paid order.

## Technology Stack

| Area | Technology | Role |
|---|---|---|
| Frontend | React | Component-based user interface |
| Development/build tool | Vite | Local development server and production build |
| Routing | React Router DOM | Client-side navigation |
| State management | Redux Toolkit | Shared cart state |
| Backend runtime | Node.js | Runs the API server |
| Backend framework | Express.js | Routes, middleware, and controllers |
| Database | MongoDB | Persistent application data |
| ODM | Mongoose | Schemas, models, and database queries |
| Authentication | JSON Web Token (JWT) | Signed authentication tokens |
| Password hashing | bcrypt | Hashes passwords |
| Cookie parsing | cookie-parser | Reads cookies in Express |
| Payments | Razorpay | Payment gateway integration |
| Environment variables | dotenv | Loads server configuration |

See `server/package.json` and `client/vite-Frontend/package.json` for the exact dependency versions.

## Architecture

```text
Browser
  |
  v
React pages and components
  |
  +--> React Router
  |
  +--> Redux Toolkit
  |      +--> store.js
  |      +--> cartSlice.js
  |      +--> cartThunks.js
  |
  v
API helper / HTTP requests
  |
  v
Vite development proxy (during local development)
  |
  v
Express server (port 5000)
  |
  +--> Routes
  +--> Authentication middleware
  +--> Controllers
  |
  +--> MongoDB via Mongoose
  |
  +--> Razorpay API
```

**Frontend:** Renders pages, collects input, sends requests, and displays API results.

**Backend:** Validates requests, enforces access control, performs business logic, and communicates with MongoDB and Razorpay.

**MongoDB:** Stores persistent customer, product, cart, wishlist, and order data according to the models.

**Redux:** Holds client-side state for shared UI. It is not a substitute for persistent database storage.

**Razorpay:** Handles payment checkout and payment processing. The backend remains responsible for verifying payment information before finalizing the order.

## Project Structure

Based on the current project structure:

```text
SHOPPING/
├── server/
│   ├── controllers/
│   │   ├── cart.controller.js
│   │   ├── customer.controller.js
│   │   ├── order.controller.js
│   │   ├── product.controller.js
│   │   └── wishlist.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── customer.model.js
│   │   ├── order.model.js
│   │   └── product.model.js
│   ├── routes/
│   │   ├── cart.routes.js
│   │   ├── customer.routes.js
│   │   ├── order.routes.js
│   │   ├── product.routes.js
│   │   └── wishlist.routes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── .env                 # Create locally; do not commit
│   ├── index.js
│   └── package.json
│
└── client/
    └── vite-Frontend/
        ├── src/
        │   ├── app/
        │   │   └── store.js
        │   ├── components/
        │   │   ├── Layout.jsx
        │   │   ├── Navbar.jsx
        │   │   ├── ProductCard.jsx
        │   │   └── ProtectedRoute.jsx
        │   ├── features/
        │   │   └── cart/
        │   │       ├── cartSlice.js
        │   │       └── cartThunks.js
        │   ├── pages/
        │   │   ├── Cart.jsx
        │   │   ├── Checkout.jsx
        │   │   ├── Home.jsx
        │   │   ├── Login.jsx
        │   │   ├── Payment.jsx
        │   │   ├── ProductDetails.jsx
        │   │   ├── Products.jsx
        │   │   ├── Register.jsx
        │   │   └── Wishlist.jsx
        │   ├── services/
        │   │   └── api.js
        │   ├── App.jsx
        │   ├── App.css
        │   ├── index.css
        │   └── main.jsx
        ├── vite.config.js
        ├── package.json
        └── README.md
```

This tree reflects the files visible in the supplied screenshots. If the repository contains additional files, update this tree as needed.

## Prerequisites

Install:

- [Node.js](https://nodejs.org/) and npm.
- A MongoDB database: MongoDB Atlas or a local MongoDB instance.
- A [Razorpay account](https://razorpay.com/) for Test Mode credentials.
- Git, if cloning the repository.

Verify Node.js and npm:

```bash
node --version
npm --version
```

## Local Setup

### 1. Clone the repository

Replace the placeholder URL with the actual repository URL:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd SHOPPING
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

The backend package uses CommonJS and defines this development script:

```bash
npm run dev
```

It runs `nodemon index.js`.

### 3. Configure backend environment variables

Create `server/.env`. The names below are a template; make sure they match the names read by your current backend code.

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
NODE_ENV=development
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

**Important:**
- Replace all example values with your own.
- For MongoDB Atlas, configure database access and add your development IP address to the Network Access allowlist.
- Use Razorpay **Test Mode** credentials for local testing.
- Never commit `.env`, database credentials, JWT secrets, or Razorpay secret keys.
- Check `server/index.js` and `server/controllers/order.controller.js` for the exact environment variable names used by the implementation.

### 4. Install frontend dependencies

Open a second terminal from the project root:

```bash
cd client/vite-Frontend
npm install
```

### 5. Check the Vite proxy

The current `vite.config.js` proxies both `/customers` and `/api` to the backend at `http://localhost:5000`. This lets frontend requests use those paths during local development.

Example configuration shape:

```js
server: {
  proxy: {
    "/customers": {
      target: "http://localhost:5000",
      changeOrigin: true
    },
    "/api": {
      target: "http://localhost:5000",
      changeOrigin: true
    }
  }
}
```

If your `api.js` calls a different origin directly, make sure the backend CORS and cookie settings support that arrangement. Avoid mixing direct cross-origin requests and proxy-based requests without a clear reason.

## Run the Application

Use two terminals.

**Terminal 1 — Backend**

```bash
cd SHOPPING/server
npm run dev
```

The backend currently hardcodes port `5000` with `const PORT = 5000` in `server/index.js`; setting `PORT` in `.env` will not change it unless the code is updated. The current code starts listening before MongoDB finishes connecting, so the server can log that it is running even if the database connection subsequently fails. Confirm both the server log and the MongoDB connection log before testing database-backed endpoints.

**Terminal 2 — Frontend**

```bash
cd SHOPPING/client/vite-Frontend
npm run dev
```

Vite prints the local URL, commonly `http://localhost:5173`. Open the exact URL shown in the terminal.

For a production frontend build:

```bash
npm run build
```

Run this command from `client/vite-Frontend`.

## Application Workflows

### Authentication

1. A customer submits registration or login details.
2. The backend validates the request.
3. Registration stores a bcrypt password hash, not the plain-text password.
4. Login checks the submitted password against the stored hash.
5. The server creates a JWT and sets the authentication cookie.
6. Protected routes use authentication middleware to verify the token and identify the current user.
7. Controllers use the authenticated user's identity to access customer-specific resources.

### Wishlist

1. The frontend sends a request to add a product.
2. Authentication middleware identifies the customer.
3. The wishlist controller validates the product and checks for duplicates.
4. The customer's wishlist is updated in MongoDB.
5. The wishlist endpoint retrieves saved items, optionally using Mongoose `populate()` to load product details.
6. Removing an item updates the saved wishlist.

### Cart and Redux

1. A customer adds, updates, or removes a cart item.
2. The backend validates the product and requested quantity.
3. MongoDB stores the updated cart.
4. The frontend dispatches a thunk such as `fetchCart()` to request the current cart.
5. `cartThunks.js` performs the asynchronous API call.
6. `cartSlice.js` responds to pending, fulfilled, or rejected actions and updates cart/loading/error state.
7. Components read the shared state from Redux.
8. After a refresh, the frontend fetches the cart again from the backend, which retrieves the persisted data.

### Checkout and Payment

1. The backend creates an order from the customer's cart.
2. The backend calculates the total from current database prices.
3. The backend creates a Razorpay order using the amount in paise (₹1 = 100 paise).
4. The frontend opens Razorpay Checkout.
5. After the payment attempt, the frontend sends the verification data to the backend.
6. The backend verifies the Razorpay signature and checks the payment against the original order.
7. If verification succeeds and the payment is captured, the backend updates order status, deducts stock, and clears the cart.
8. Duplicate verification must not deduct stock a second time.
9. If checkout is cancelled, the frontend displays a message; the pending order should not cause stock deduction or cart clearing.

A captured payment and a database transaction are separate systems. If payment succeeds but a database update fails, the application needs reconciliation and refund handling rather than assuming the payment itself was rolled back.

## API Routes

The following paths are based on the route files supplied for this project. All routes below are mounted at their respective base paths by the backend. Product routes shown here do not have authentication middleware in the supplied `product.routes.js`; protect product creation separately if it is intended to be admin-only.

### Customer routes — base path `/customers`

| Method | Path | Authentication | Purpose |
|---|---|---|---|
| `POST` | `/customers/register` | Public | Register a customer |
| `POST` | `/customers/login` | Public | Log in |
| `GET` | `/customers/me` | Required | Get the current customer |
| `POST` | `/customers/logout` | Required | Log out |
| `PATCH` | `/customers/change-password` | Required | Change password |

### Product routes — base path `/api/products`

The base path is confirmed by `server/index.js`, which mounts `product.routes.js` at `/api/products`.

| Method | Path | Authentication | Purpose |
|---|---|---|---|
| `POST` | `/api/products` | No auth middleware in the supplied router | Create a product |
| `GET` | `/api/products` | Public | Get products |
| `GET` | `/api/products/:id` | Public | Get one product |

**Security note:** The supplied product router does not protect `POST /api/products`. Add admin authorization if product creation should not be public.

### Cart routes — base path `/api/cart`

The base path is confirmed by `server/index.js`, which mounts `cart.routes.js` at `/api/cart`.

| Method | Path | Authentication | Purpose |
|---|---|---|---|
| `POST` | `/api/cart/:productId` | Required | Add a product to the cart |
| `GET` | `/api/cart` | Required | Get the cart |
| `PATCH` | `/api/cart/:productId` | Required | Update item quantity |
| `DELETE` | `/api/cart/:productId` | Required | Remove a cart item |

### Wishlist routes — base path `/api/wishlist`

The base path is confirmed by `server/index.js`, which mounts `wishlist.routes.js` at `/api/wishlist`.

| Method | Path | Authentication | Purpose |
|---|---|---|---|
| `POST` | `/api/wishlist/:productId` | Required | Add to wishlist |
| `GET` | `/api/wishlist` | Required | Get wishlist |
| `DELETE` | `/api/wishlist/:productId` | Required | Remove from wishlist |

### Order routes — base path `/api/orders`

The base path is confirmed by `server/index.js`, which mounts `order.routes.js` at `/api/orders`.

| Method | Path | Authentication | Purpose |
|---|---|---|---|
| `POST` | `/api/orders` | Required | Create an order |
| `POST` | `/api/orders/:orderId/payment` | Required | Create a Razorpay order |
| `POST` | `/api/orders/:orderId/verify-payment` | Required | Verify payment |

All protected routes require a valid authentication cookie. Exact response shapes and validation status codes are defined by the controllers.

## Database Models

The current Mongoose schemas establish these relationships and fields.

### Customer (`customer.model.js`)

- `fullName`, `email`, `password`, and `phone` are required.
- `email` is unique.
- `wishlist` is an array of Product ObjectId references.
- `cart` is an array of entries, each containing a Product reference and a quantity (default `1`, minimum `1`).
- `timestamps: true` adds `createdAt` and `updatedAt`.

The application should store a bcrypt hash in `password`, not the original password.

### Product (`product.model.js`)

- `name`, `description`, `category`, and `image` are required strings.
- `price` is required and must be greater than or equal to `0.01`.
- `stock` is required and must be zero or greater.
- `timestamps: true` adds creation and update timestamps.

### Order (`order.model.js`)

- `customer` references a Customer and is indexed.
- `items` stores product references alongside a snapshot of each item's name, price, and quantity.
- `deliveryAddress` stores the recipient and delivery address fields.
- `totalAmount` stores the order total.
- `paymentStatus` can be `pending`, `paid`, or `failed`.
- `orderStatus` can be `pending`, `confirmed`, `shipped`, `delivered`, or `cancelled`.
- `razorpayOrderId` and `razorpayPaymentId` store payment references when assigned.
- `stockDeducted` records whether inventory was deducted, helping guard against duplicate processing.
- `timestamps: true` adds `createdAt` and `updatedAt`.

The order's item name and price snapshots help preserve what was purchased even if the product's current details later change.

## Redux Cart State

### `client/vite-Frontend/src/app/store.js`

Configures the Redux store and registers the cart reducer.

### `client/vite-Frontend/src/features/cart/cartSlice.js`

Defines cart state and the reducers that update it. It commonly handles:
- Initial state.
- Synchronous cart actions, if defined.
- Loading and error state.
- `extraReducers` for asynchronous thunk lifecycle actions.

### `client/vite-Frontend/src/features/cart/cartThunks.js`

Defines asynchronous operations such as `fetchCart()`. A thunk can make an API request and dispatch lifecycle actions:

- **Pending:** Request is in progress.
- **Fulfilled:** Request succeeded.
- **Rejected:** Request failed.

The slice responds to these actions to update the Redux state. Redux holds client-side state; MongoDB remains the persistent source of truth for saved cart data.

## Authentication and Security

- Passwords should be hashed before storage.
- JWTs should be verified on the backend.
- Protected controllers should use the authenticated user's ID, not a client-supplied customer ID.
- Backend validation is required even when the frontend validates input.
- Stock and order totals should be computed or checked on the backend.
- Razorpay payment signatures must be verified using the server-side secret.
- Keep secrets out of source control.
- Configure cookies, CORS, and HTTPS appropriately for the deployment environment.
- Product creation is currently exposed without authentication in the supplied product router. If this is not intentional, add authorization (for example, an admin-only middleware) before deploying.

## Payment and Order Consistency

The payment flow should check the Razorpay signature and compare the returned payment details with the server-created order, including the order ID, amount, currency, and captured status.

Database transactions can ensure related database changes succeed together or roll back together. They cannot reverse an external payment already captured by Razorpay. If a payment is captured but the database operation fails, the system should record and reconcile the discrepancy and support a refund or other resolution.

MongoDB transactions require a deployment configuration that supports transactions, such as a replica set. Confirm the database environment supports this feature.

## Testing Checklist

### Authentication
- [ ] Register a new customer.
- [ ] Test duplicate registration.
- [ ] Log in with valid and invalid credentials.
- [ ] Access a protected route without a valid cookie.
- [ ] Log out and verify protected access is denied.

### Products and wishlist
- [ ] Retrieve the product list and a product by ID.
- [ ] Add and remove a wishlist item.
- [ ] Attempt to add the same wishlist item twice.
- [ ] Attempt to use a nonexistent product ID.
- [ ] Verify one customer cannot access another customer's private data.

### Cart
- [ ] Add, retrieve, update, and remove a cart item.
- [ ] Try requesting more units than available stock.
- [ ] Confirm a rejected stock request does not change the cart.
- [ ] Refresh the page and confirm the cart is retrieved again.
- [ ] Confirm navbar and cart page state remain consistent.

### Orders and payments
- [ ] Create an order from a non-empty cart.
- [ ] Verify the amount is converted to paise for Razorpay.
- [ ] Complete a successful Test Mode payment.
- [ ] Cancel checkout and confirm the cart and stock remain unchanged.
- [ ] Test invalid payment verification data.
- [ ] Repeat verification for an already-paid order and confirm stock is not deducted twice.
- [ ] Test database or stock failures after payment capture.

## Troubleshooting

### MongoDB connection errors
- Check `MONGO_URI` in `server/.env`.
- Verify Atlas network access and database credentials.
- Ensure the database service is running if using a local MongoDB instance.
- Confirm the backend loads environment variables before connecting.

### `ECONNREFUSED` or API requests failing
- Make sure the backend is running on port `5000`.
- Check that Vite proxies the request prefix (`/customers` or `/api`) to `http://localhost:5000`.
- Check the route prefixes mounted in `server/index.js`.
- Restart Vite after changing `vite.config.js`.

### Authentication cookie not sent
- Confirm the frontend API helper includes credentials where required.
- Check cookie settings and CORS if frontend and backend use different origins.
- Verify the JWT secret is configured consistently.
- Check whether the cookie has expired or was cleared during logout.

### Razorpay order creation or payment verification fails
- Use Test Mode credentials.
- Confirm the backend's key ID and secret environment variable names match the code.
- Verify the backend amount is sent in paise.
- Check that the order ID, amount, currency, and payment status match the payment being verified.
- Never expose the Razorpay secret in frontend code.

## Limitations and Future Improvements

Possible future improvements include:
- Admin-only product management.
- Product search, category filters, and pagination.
- Customer order history and order tracking.
- Email notifications for orders and refunds.
- Automated unit and integration tests.
- More robust payment reconciliation and refund handling.
- Improved concurrent stock reservation for simultaneous purchases.
- Production deployment, monitoring, and structured logging.

Only list a feature as implemented if it is present in the current codebase.

## Learning Outcomes

ShopKart provides practical experience with:
- MERN stack architecture.
- React components and routing.
- Express routes, middleware, and controllers.
- MongoDB and Mongoose models.
- JWT authentication and cookie-based sessions.
- REST APIs and HTTP status codes.
- Redux Toolkit and asynchronous thunks.
- Backend validation of stock, prices, and user ownership.
- Razorpay order creation and server-side payment verification.
- Database transactions and duplicate-processing protection.
- Debugging and testing full-stack workflows.


---

ShopKart is a learning project intended to demonstrate full-stack e-commerce concepts. Review authentication, authorization, payment reconciliation, inventory concurrency, and deployment security before using it for real customers.
