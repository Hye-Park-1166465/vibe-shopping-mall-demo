import { useState } from 'react';
import MainPage from './pages/MainPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/admin/AdminPage';
import ProductRegisterPage from './pages/admin/ProductRegisterPage';
import ProductManagePage from './pages/admin/ProductManagePage';
import OrderManagePage from './pages/admin/OrderManagePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderFailPage from './pages/OrderFailPage';
import OrderListPage from './pages/OrderListPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [orderError, setOrderError] = useState(null);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setCurrentPage('product-detail');
  };

  const handleLogout = () => {
    setCurrentPage('home');
  };

  return (
    <div className="app">
      {currentPage === 'home' ? (
        <MainPage 
          onSignupClick={() => setCurrentPage('signup')}
          onLoginClick={() => setCurrentPage('login')}
          onAdminClick={() => setCurrentPage('admin')}
          onCartClick={() => setCurrentPage('cart')}
          onLogout={handleLogout}
          onProductSelect={handleProductSelect}
          onViewOrders={() => setCurrentPage('order-list')}
        />
      ) : currentPage === 'signup' ? (
        <RegisterPage 
          onBack={() => setCurrentPage('home')}
          onLoginClick={() => setCurrentPage('login')}
        />
      ) : currentPage === 'login' ? (
        <LoginPage 
          onBack={() => setCurrentPage('home')}
          onSignupClick={() => setCurrentPage('signup')}
        />
      ) : currentPage === 'product-register' ? (
        <ProductRegisterPage 
          onBack={() => setCurrentPage('admin')}
        />
      ) : currentPage === 'product-manage' ? (
        <ProductManagePage 
          onBack={() => setCurrentPage('admin')}
          onProductRegister={() => setCurrentPage('product-register')}
        />
      ) : currentPage === 'order-manage' ? (
        <OrderManagePage 
          onBack={() => setCurrentPage('admin')}
          onSignupClick={() => setCurrentPage('signup')}
          onLoginClick={() => setCurrentPage('login')}
          onAdminClick={() => setCurrentPage('admin')}
          onLogout={handleLogout}
          onViewOrders={() => setCurrentPage('order-list')}
        />
      ) : currentPage === 'product-detail' ? (
        <ProductDetailPage 
          product={selectedProduct}
          onBack={() => setCurrentPage('home')}
          onCartClick={() => setCurrentPage('cart')}
          onSignupClick={() => setCurrentPage('signup')}
          onLoginClick={() => setCurrentPage('login')}
          onAdminClick={() => setCurrentPage('admin')}
          onLogout={handleLogout}
          onViewOrders={() => setCurrentPage('order-list')}
        />
      ) : currentPage === 'cart' ? (
        <CartPage 
          onBack={() => setCurrentPage('home')}
          onSignupClick={() => setCurrentPage('signup')}
          onLoginClick={() => setCurrentPage('login')}
          onAdminClick={() => setCurrentPage('admin')}
          onLogout={handleLogout}
          onOrderClick={() => setCurrentPage('checkout')}
          onViewOrders={() => setCurrentPage('order-list')}
        />
      ) : currentPage === 'checkout' ? (
        <CheckoutPage 
          onBack={() => setCurrentPage('cart')}
          onSignupClick={() => setCurrentPage('signup')}
          onLoginClick={() => setCurrentPage('login')}
          onAdminClick={() => setCurrentPage('admin')}
          onLogout={handleLogout}
          onOrderSuccess={(data) => {
            setOrderData(data);
            setCurrentPage('order-success');
          }}
          onOrderFail={(error) => {
            setOrderError(error);
            setCurrentPage('order-fail');
          }}
          onViewOrders={() => setCurrentPage('order-list')}
        />
      ) : currentPage === 'order-success' ? (
        <OrderSuccessPage 
          orderData={orderData}
          onBack={() => {
            setOrderData(null);
            setCurrentPage('home');
          }}
          onViewOrders={() => {
            setOrderData(null);
            setCurrentPage('order-list');
          }}
          onSignupClick={() => setCurrentPage('signup')}
          onLoginClick={() => setCurrentPage('login')}
          onAdminClick={() => setCurrentPage('admin')}
          onLogout={handleLogout}
        />
      ) : currentPage === 'order-list' ? (
        <OrderListPage 
          onBack={() => setCurrentPage('home')}
          onSignupClick={() => setCurrentPage('signup')}
          onLoginClick={() => setCurrentPage('login')}
          onAdminClick={() => setCurrentPage('admin')}
          onLogout={handleLogout}
          onViewOrderDetail={(order) => {
            setOrderData(order);
            setCurrentPage('order-success');
          }}
          onViewOrders={() => setCurrentPage('order-list')}
        />
      ) : currentPage === 'order-fail' ? (
        <OrderFailPage 
          errorMessage={orderError}
          onBack={() => {
            setOrderError(null);
            setCurrentPage('checkout');
          }}
          onRetry={() => {
            setOrderError(null);
            setCurrentPage('checkout');
          }}
          onSignupClick={() => setCurrentPage('signup')}
          onLoginClick={() => setCurrentPage('login')}
          onAdminClick={() => setCurrentPage('admin')}
          onLogout={handleLogout}
          onViewOrders={() => setCurrentPage('order-list')}
        />
      ) : currentPage === 'admin' ? (
        <AdminPage 
          onBack={() => setCurrentPage('home')}
          onProductRegister={() => setCurrentPage('product-register')}
          onProductManage={() => setCurrentPage('product-manage')}
          onOrderManage={() => setCurrentPage('order-manage')}
          onLogout={handleLogout}
          onSignupClick={() => setCurrentPage('signup')}
          onLoginClick={() => setCurrentPage('login')}
          onAdminClick={() => setCurrentPage('admin')}
          onCartClick={() => setCurrentPage('cart')}
          onViewOrders={() => setCurrentPage('order-list')}
        />
      ) : null}
    </div>
  );
}

export default App;


