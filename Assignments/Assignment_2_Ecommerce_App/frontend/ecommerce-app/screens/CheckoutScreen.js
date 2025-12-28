import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, 
  TouchableOpacity, Alert 
} from 'react-native';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../services/api';

const CheckoutScreen = ({ navigation }) => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [loading, setLoading] = useState(false);

  // ✅ Fixed & enhanced checkout function
  const handleCheckout = async () => {
    // Validation
    if (!shippingInfo.fullName || !shippingInfo.address || !shippingInfo.city) {
      Alert.alert('Error', 'Please fill all shipping details');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.product_id || item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: getCartTotal(),
        shippingAddress: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.zipCode}, ${shippingInfo.country}`,
        paymentMethod: paymentMethod
      };

      const result = await orderAPI.createOrder(orderData);

      if (result.success) {
        await clearCart();
        // 🔄 Navigate to Order Confirmation page
        navigation.navigate('OrderConfirmation', { 
          orderId: result.orderId,
          orderData: orderData 
        });
      } else {
        Alert.alert('Error', 'Something went wrong while placing the order.');
      }

    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Checkout</Text>
      
      {/* Shipping Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Information</Text>

        <TextInput 
          style={styles.input} 
          placeholder="Full Name *" 
          value={shippingInfo.fullName} 
          onChangeText={(text) => setShippingInfo({ ...shippingInfo, fullName: text })} 
        />

        <TextInput 
          style={styles.input} 
          placeholder="Address *" 
          value={shippingInfo.address} 
          onChangeText={(text) => setShippingInfo({ ...shippingInfo, address: text })} 
        />

        <TextInput 
          style={styles.input} 
          placeholder="City *" 
          value={shippingInfo.city} 
          onChangeText={(text) => setShippingInfo({ ...shippingInfo, city: text })} 
        />

        <TextInput 
          style={styles.input} 
          placeholder="ZIP Code" 
          value={shippingInfo.zipCode} 
          onChangeText={(text) => setShippingInfo({ ...shippingInfo, zipCode: text })} 
          keyboardType="numeric"
        />

        <TextInput 
          style={styles.input} 
          placeholder="Country" 
          value={shippingInfo.country} 
          onChangeText={(text) => setShippingInfo({ ...shippingInfo, country: text })} 
        />
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>

        <TouchableOpacity 
          style={styles.paymentOption} 
          onPress={() => setPaymentMethod('credit_card')}
        >
          <Text style={styles.paymentText}>💳 Credit Card</Text>
          {paymentMethod === 'credit_card' && <Text style={styles.selected}>✓</Text>}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.paymentOption} 
          onPress={() => setPaymentMethod('paypal')}
        >
          <Text style={styles.paymentText}>📱 PayPal</Text>
          {paymentMethod === 'paypal' && <Text style={styles.selected}>✓</Text>}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.paymentOption} 
          onPress={() => setPaymentMethod('cod')}
        >
          <Text style={styles.paymentText}>💰 Cash on Delivery</Text>
          {paymentMethod === 'cod' && <Text style={styles.selected}>✓</Text>}
        </TouchableOpacity>
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>

        {cartItems.map(item => (
          <View key={item.id} style={styles.orderItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>${item.price} x {item.quantity}</Text>
          </View>
        ))}

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total: ${getCartTotal().toFixed(2)}</Text>
        </View>
      </View>

      {/* Checkout Button */}
      <TouchableOpacity 
        style={[styles.checkoutButton, loading && styles.disabledButton]}
        onPress={handleCheckout}
        disabled={loading}
      >
        <Text style={styles.checkoutButtonText}>
          {loading ? 'Processing...' : `Place Order - $${getCartTotal().toFixed(2)}`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  section: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 12, 
    borderRadius: 5, 
    marginBottom: 10,
    fontSize: 16
  },
  paymentOption: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  paymentText: { fontSize: 16 },
  selected: { color: 'green', fontWeight: 'bold' },
  orderItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 8 
  },
  itemName: { fontSize: 14, flex: 2 },
  itemPrice: { fontSize: 14, fontWeight: 'bold' },
  totalContainer: { 
    borderTopWidth: 1, 
    borderTopColor: '#eee', 
    paddingTop: 10, 
    marginTop: 10 
  },
  totalText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  checkoutButton: { 
    backgroundColor: '#FF6B6B', 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 20 
  },
  disabledButton: { backgroundColor: '#ccc' },
  checkoutButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});

export default CheckoutScreen;
