import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import Root from './components/Root'
import Login from './pages/Login'
import Register from './pages/Register'
import Unauthorized from './pages/Unauthorized'
import ProtectedRoutes from './utils/ProtectedRoutes'
import Dasboard from './pages/Dasboard'
import Categories from './components/Categories'
import Supplier from './components/Supplier'
import Product from './components/Product'
import Home from './components/Home'
import Users from './components/Users'
import UserProfile from './components/UserProfile'
import GuestRoutes from './utils/GuestRoutes'
import Logout from './pages/Logout'
import { processQueue } from "./utils/syncManager";

const App = () => {
  useEffect(() => {
    processQueue(); // Try syncing any saved data on startup
  }, []);
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoutes>
              <Login />
            </GuestRoutes>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<h1>Unauthorized</h1>} />
        <Route path="/" element={<Root />} />
        {/* <Route path="/customer/dashboard" element={<h1>Admin Dashboard</h1>} /> */}

        {/* Admin Routes  */}

        <Route
          path="/admin/dashboard"
          element={
            // <ProtectedRoutes requiredRole={["admin", "customer"]}>
            //   <Dasboard />
            // </ProtectedRoutes>
            <Dasboard />
          }
        >
          {/* child route that renders inside <Outlet /> */}
          <Route
            index
            element={<Home />}
          />
          <Route
            path="categories"
            element={<Categories />}
          />
          <Route
            path="products"
            element={<Product />}
          />
          <Route
            path="suppliers"
            element={<Supplier />}
          />

          <Route
            path="users"
            element={
              <ProtectedRoutes requiredRole={["admin"]}>
                <Users />
              </ProtectedRoutes>} />


          <Route
            path="profile"
            element={<UserProfile />}
          />
          <Route
            path="logout"
            element={<Logout />}
          />
        </Route>
      </Routes>
    </Router>
  )
}

export default App