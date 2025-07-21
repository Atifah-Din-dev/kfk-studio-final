import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);

    // Load cart from localStorage on initial render
useEffect(() => {
  const savedCart = localStorage.getItem('kfkCart');
  console.log('Loading cart from localStorage:', savedCart);
  if (savedCart) {
    try {
      const parsedCart = JSON.parse(savedCart);
      console.log('Parsed cart:', parsedCart);
      setCart(parsedCart);
    } catch (error) {
      console.error('Error parsing cart from localStorage:', error);
      setCart([]);
    }
  }
}, []);




    
;

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('kfkCart', JSON.stringify(cart));
    }, [cart]);

const addToCart = (item) => {
    const id = `${item.serviceId}-${item.bookingDate}-${item.bookingTime}`;
    setCart(prevCart => [...prevCart, { ...item, id }]);
    setCartOpen(true);
};


    const removeFromCart = (itemId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + parseFloat(item.price), 0);
    };

    const getCartCount = () => {
        return cart.length;
    };

    const toggleCart = () => {
  setCartOpen(prev => {
    console.log('Cart open state toggled to:', !prev);
    return !prev;
  });
};


    return (
        <CartContext.Provider value={{
            cart,
            cartOpen,
            addToCart,
            removeFromCart,
            clearCart,
            getCartTotal,
            getCartCount,
            toggleCart,
            setCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;