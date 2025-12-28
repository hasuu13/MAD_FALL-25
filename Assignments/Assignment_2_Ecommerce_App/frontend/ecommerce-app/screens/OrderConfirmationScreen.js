import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const OrderConfirmationScreen = ({ route, navigation }) => {
  const { orderId, orderData } = route.params || {
    orderId: Math.floor(Math.random() * 1000),
    orderData: {
      items: [],
      totalAmount: 0,
      shippingAddress: 'Default Address',
      paymentMethod: 'Credit Card'
    }
  };
  
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#28a745" barStyle="light-content" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Success Icon */}
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#28a745" />
          <Text style={styles.successTitle}>Order Confirmed!</Text>
          <Text style={styles.successSubtitle}>Thank you for your purchase</Text>
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order ID:</Text>
            <Text style={styles.detailValue}>#{orderId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Date:</Text>
            <Text style={styles.detailValue}>{new Date().toLocaleDateString()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount:</Text>
            <Text style={styles.detailValue}>${orderData.totalAmount?.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method:</Text>
            <Text style={styles.detailValue}>{orderData.paymentMethod}</Text>
          </View>
        </View>

        {/* Delivery Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          <View style={styles.deliveryInfo}>
            <Ionicons name="location" size={20} color="#666" />
            <Text style={styles.deliveryAddress}>{orderData.shippingAddress}</Text>
          </View>
          <View style={styles.deliveryInfo}>
            <Ionicons name="calendar" size={20} color="#666" />
            <Text style={styles.deliveryDate}>
              Estimated Delivery: {estimatedDelivery.toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {orderData.items?.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              <Text style={styles.itemPrice}>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ✅ FIXED: Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.primaryButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.secondaryButtonText}>View Order History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 100,
  },
  successContainer: { 
    alignItems: 'center', 
    padding: 30, 
    backgroundColor: 'white', 
    borderRadius: 10, 
    marginBottom: 20 
  },
  successTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#28a745', 
    marginTop: 10 
  },
  successSubtitle: { 
    fontSize: 16, 
    color: '#666', 
    marginTop: 5 
  },
  section: { 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 15 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 15 
  },
  detailRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 8 
  },
  detailLabel: { 
    fontSize: 14, 
    color: '#666' 
  },
  detailValue: { 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  deliveryInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  deliveryAddress: { 
    marginLeft: 10, 
    fontSize: 14, 
    flex: 1 
  },
  deliveryDate: { 
    marginLeft: 10, 
    fontSize: 14 
  },
  orderItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 8, 
    paddingBottom: 8, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0' 
  },
  itemName: { 
    fontSize: 14, 
    flex: 2 
  },
  itemQuantity: { 
    fontSize: 14, 
    color: '#666' 
  },
  itemPrice: { 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  actionButtons: { 
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  primaryButton: { 
    backgroundColor: '#FF6B6B', 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 10 
  },
  primaryButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  secondaryButton: { 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#FF6B6B' 
  },
  secondaryButtonText: { 
    color: '#FF6B6B', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});

export default OrderConfirmationScreen;