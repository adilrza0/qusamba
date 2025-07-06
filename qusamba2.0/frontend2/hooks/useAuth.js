import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import api from '../services/api';
import { useMutation, useApi } from './useApi';

// Auth Context
const AuthContext = createContext({});

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const response = await api.auth.login(credentials);
      const { token, user: userData } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const response = await api.auth.register(userData);
      const { token, user: newUser } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Auth hooks
export const useAuth = () => {
  return useAuthContext();
};

export const useLogin = () => {
  const { login } = useAuth();
  return useMutation(login);
};

export const useRegister = () => {
  const { register } = useAuth();
  return useMutation(register);
};

export const useLogout = () => {
  const { logout } = useAuth();
  return logout;
};

export const useForgotPassword = () => {
  return useMutation(api.auth.forgotPassword);
};

export const useResetPassword = () => {
  return useMutation(api.auth.resetPassword);
};

export const useProfile = () => {
  const { user, updateUser } = useAuth();
  
  const { data, loading, error, execute } = useApi(api.auth.getProfile);
  
  const updateProfile = useMutation(async (profileData) => {
    const response = await api.auth.updateProfile(profileData);
    updateUser(response.user);
    return response;
  });
  
  const changePassword = useMutation(api.auth.changePassword);
  
  return {
    user,
    profile: data,
    loading,
    error,
    getProfile: execute,
    updateProfile,
    changePassword,
  };
};

export const useAddresses = () => {
  const { user, updateUser } = useAuth();
  
  const addAddress = useMutation(async (addressData) => {
    const response = await api.auth.addAddress(addressData);
    updateUser(response.user);
    return response;
  });
  
  const updateAddress = useMutation(async (addressId, addressData) => {
    const response = await api.auth.updateAddress(addressId, addressData);
    updateUser(response.user);
    return response;
  });
  
  const deleteAddress = useMutation(async (addressId) => {
    const response = await api.auth.deleteAddress(addressId);
    updateUser(response.user);
    return response;
  });
  
  return {
    addresses: user?.addresses || [],
    addAddress,
    updateAddress,
    deleteAddress,
  };
};

export const useWishlist = () => {
  const { user, updateUser } = useAuth();
  
  const { data: wishlist, loading, error, execute: getWishlist } = useApi(
    api.auth.getWishlist
  );
  
  const addToWishlist = useMutation(async (productId) => {
    const response = await api.auth.addToWishlist(productId);
    updateUser(response.user);
    return response;
  });
  
  const removeFromWishlist = useMutation(async (productId) => {
    const response = await api.auth.removeFromWishlist(productId);
    updateUser(response.user);
    return response;
  });
  
  const clearWishlist = useMutation(async () => {
    const response = await api.auth.clearWishlist();
    updateUser(response.user);
    return response;
  });
  
  return {
    wishlist: wishlist || user?.wishlist || [],
    loading,
    error,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
  };
};

export const useCart = () => {
  const { user, updateUser } = useAuth();
  
  const { data: cart, loading, error, execute: getCart } = useApi(
    api.auth.getCart
  );
  
  const addToCart = useMutation(async (productId, quantity = 1, variant = null) => {
    const response = await api.auth.addToCart(productId, quantity, variant);
    updateUser(response.user);
    return response;
  });
  
  const updateCartItem = useMutation(async (productId, quantity, variant = null) => {
    const response = await api.auth.updateCartItem(productId, quantity, variant);
    updateUser(response.user);
    return response;
  });
  
  const removeFromCart = useMutation(async (productId, variant = null) => {
    const response = await api.auth.removeFromCart(productId, variant);
    updateUser(response.user);
    return response;
  });
  
  const clearCart = useMutation(async () => {
    const response = await api.auth.clearCart();
    updateUser(response.user);
    return response;
  });
  
  const cartItems = cart?.items || user?.cart || [];
  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  
  return {
    cart: cartItems,
    cartTotal,
    cartCount,
    loading,
    error,
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };
};

// Higher-order component for protected routes
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
      return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <div>Please log in to access this page.</div>;
    }
    
    return <Component {...props} />;
  };
};

// Higher-order component for admin routes
export const withAdmin = (Component) => {
  return function AdminComponent(props) {
    const { user, isAuthenticated, loading } = useAuth();
    
    if (loading) {
      return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <div>Please log in to access this page.</div>;
    }
    
    if (user?.role !== 'admin') {
      return <div>You don't have permission to access this page.</div>;
    }
    
    return <Component {...props} />;
  };
};

export default {
  useAuth,
  useLogin,
  useRegister,
  useLogout,
  useForgotPassword,
  useResetPassword,
  useProfile,
  useAddresses,
  useWishlist,
  useCart,
  AuthProvider,
  withAuth,
  withAdmin,
};
