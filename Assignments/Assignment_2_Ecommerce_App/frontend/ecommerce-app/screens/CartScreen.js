import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, 
  Alert, ActivityIndicator, StatusBar 
} from 'react-native';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../services/api';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CartItem = memo(({ item, onUpdateQuantity, onRemove }) => (
  <View style={styles.cartItem}>
    <Image 
      source={{ uri: item.image_url }} 
      style={styles.itemImage}
      resizeMode="contain"
    />
    <View style={styles.itemDetails}>
      <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.itemCategory}>{item.category}</Text>
      <Text style={styles.itemPrice}>${item.price}</Text>
      
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item.id, -1)}
        >
          <Text style={styles.quantityText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item.id, 1)}
        >
          <Text style={styles.quantityText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
    <TouchableOpacity
      style={styles.removeButton}
      onPress={() => onRemove(item.id)}
    >
      <Ionicons name="trash-outline" size={20} color="#ff4444" />
    </TouchableOpacity>
  </View>
));

const CartScreen = ({ navigation }) => {
  const { 
    cartItems, 
    loading, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal,
    getCartItemsCount 
  } = useCart();
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const getTotalItems = () => {
    return getCartItemsCount();
  };

  const handleUpdateQuantity = async (id, change) => {
    const item = cartItems.find(item => item.id === id);
    const newQuantity = Math.max(1, item.quantity + change);
    await updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = async (id) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeFromCart(id);
          },
        },
      ]
    );
  };

  // ✅ FIXED: Checkout navigation
  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId || item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: getTotalPrice(),
        shippingAddress: 'Default Address'
      };

      await orderAPI.createOrder(orderData);
      
      // ✅ FIXED: Navigate to OrderConfirmation in same stack
      navigation.navigate('OrderConfirmation', { 
        orderId: Math.floor(Math.random() * 1000),
        orderData: orderData 
      });
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Error', 'Failed to place order');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const getTotalPrice = () => {
    return getCartTotal();
  };

  const getDeliveryCharge = () => {
    return getTotalPrice() > 50 ? 0 : 4.99;
  };

  const getFinalTotal = () => {
    return getTotalPrice() + getDeliveryCharge();
  };

  const handleUpdateQuantityCallback = useCallback((id, change) => {
    handleUpdateQuantity(id, change);
  }, [handleUpdateQuantity]);

  const handleRemoveCallback = useCallback((id) => {
    handleRemoveItem(id);
  }, [handleRemoveItem]);

  const renderCartItem = useCallback(({ item }) => (
    <CartItem 
      item={item}
      onUpdateQuantity={handleUpdateQuantityCallback}
      onRemove={handleRemoveCallback}
    />
  ), [handleUpdateQuantityCallback, handleRemoveCallback]);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading your cart...</Text>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <View style={styles.emptyContent}>
          <Ionicons name="cart-outline" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add some amazing products to your cart</Text>
          {/* ✅ FIXED: Navigate to Home tab */}
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <Text style={styles.itemCount}>{getTotalItems()} items</Text>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={keyExtractor}
        style={styles.cartList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cartListContent}
      />

      {/* Price Summary */}
      <View style={styles.priceSummary}>
        <Text style={styles.summaryTitle}>Price Details</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Price ({getTotalItems()} items)</Text>
          <Text style={styles.priceValue}>${getTotalPrice().toFixed(2)}</Text>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Delivery Charges</Text>
          <Text style={styles.priceValue}>
            {getDeliveryCharge() === 0 ? 'FREE' : `$${getDeliveryCharge().toFixed(2)}`}
          </Text>
        </View>
        
        {getDeliveryCharge() === 0 && (
          <View style={styles.freeDelivery}>
            <Ionicons name="checkmark-circle" size={16} color="#28a745" />
            <Text style={styles.freeDeliveryText}>You saved $4.99 on delivery</Text>
          </View>
        )}
        
        <View style={styles.divider} />
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>${getFinalTotal().toFixed(2)}</Text>
        </View>
      </View>

      {/* Checkout Button */}
      <View style={styles.checkoutSection}>
        <TouchableOpacity 
          style={[
            styles.checkoutButton,
            checkoutLoading && styles.checkoutButtonDisabled
          ]}
          onPress={handleCheckout}
          disabled={checkoutLoading}
        >
          {checkoutLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.checkoutText}>
              Proceed to Checkout • ${getFinalTotal().toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  emptyContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  emptyContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, marginTop: 60 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 20, marginBottom: 10 },
  emptySubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  shopButton: { backgroundColor: '#FF6B6B', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 8 },
  shopButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 15, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  itemCount: { fontSize: 14, color: '#666' },
  cartList: { flex: 1 },
  cartListContent: { paddingHorizontal: 15, paddingBottom: 20 },
  cartItem: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 10, marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' },
  itemImage: { width: 80, height: 80, borderRadius: 8, marginRight: 15, backgroundColor: '#F8F9FA' },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', marginBottom: 4, color: '#333', lineHeight: 20 },
  itemCategory: { fontSize: 12, color: '#666', marginBottom: 6, textTransform: 'capitalize' },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#FF6B6B', marginBottom: 8 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: { backgroundColor: '#F8F9FA', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0' },
  quantityText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  quantity: { marginHorizontal: 15, fontSize: 16, fontWeight: 'bold', color: '#333', minWidth: 20, textAlign: 'center' },
  removeButton: { padding: 5, alignSelf: 'flex-start' },
  priceSummary: { backgroundColor: '#F8F9FA', margin: 15, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0' },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceLabel: { fontSize: 14, color: '#666' },
  priceValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  freeDelivery: { flexDirection: 'row', alignItems: 'center', marginTop: 5, marginBottom: 10 },
  freeDeliveryText: { fontSize: 12, color: '#28a745', marginLeft: 5 },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#FF6B6B' },
  checkoutSection: { padding: 15, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  checkoutButton: { backgroundColor: '#FF6B6B', padding: 18, borderRadius: 8, alignItems: 'center' },
  checkoutButtonDisabled: { backgroundColor: '#CCC' },
  checkoutText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default CartScreen;