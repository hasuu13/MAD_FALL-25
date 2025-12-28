import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { useAuth } from '../context/AuthContext'; // ✅ Import Auth Context
import { orderAPI } from '../services/api';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth(); // ✅ Access user + logout from context

  const [localUser, setLocalUser] = useState(user || {
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(localUser);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await orderAPI.getUserOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setLocalUser(editedUser);
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleCancel = () => {
    setEditedUser(localUser);
    setIsEditing(false);
  };

  // ✅ Logout handler
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout(); // ✅ Clears auth data
            // Navigation automatically handled by RootNavigator
          },
        },
      ]
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Delivered':
        return styles.statusDelivered;
      case 'Processing':
        return styles.statusProcessing;
      case 'Shipped':
        return styles.statusShipped;
      default:
        return styles.statusPending;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>My Profile</Text>

      {/* Profile Information */}
      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        {isEditing ? (
          <>
            <TextInput
              style={styles.input}
              value={editedUser.name}
              onChangeText={(text) => setEditedUser({ ...editedUser, name: text })}
              placeholder="Full Name"
            />
            <TextInput
              style={styles.input}
              value={editedUser.email}
              onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
              placeholder="Email"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              value={editedUser.phone}
              onChangeText={(text) => setEditedUser({ ...editedUser, phone: text })}
              placeholder="Phone"
              keyboardType="phone-pad"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editedUser.address}
              onChangeText={(text) => setEditedUser({ ...editedUser, address: text })}
              placeholder="Address"
              multiline
              numberOfLines={3}
            />

            <View style={styles.editButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{localUser.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{localUser.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{localUser.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{localUser.address}</Text>
            </View>

            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Order History */}
      <View style={styles.ordersSection}>
        <Text style={styles.sectionTitle}>Order History</Text>
        {orders.length === 0 ? (
          <Text style={styles.noOrdersText}>No orders yet</Text>
        ) : (
          orders.map(order => (
            <View key={order.id} style={styles.orderItem}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{order.id}</Text>
                <Text style={styles.orderDate}>
                  {new Date(order.order_date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.orderDetails}>
                <Text style={styles.orderTotal}>${order.total_amount}</Text>
                <Text style={styles.orderItems}>{order.item_count} items</Text>
                <Text style={[styles.orderStatus, getStatusStyle(order.status)]}>
                  {order.status}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Account Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Payment Methods</Text>
        </TouchableOpacity>

        {/* ✅ Logout Button */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 15, color: '#333' },
  profileSection: { backgroundColor: 'white', padding: 20, margin: 15, borderRadius: 8, elevation: 2 },
  ordersSection: { backgroundColor: 'white', padding: 20, margin: 15, borderRadius: 8, elevation: 2 },
  actionsSection: { backgroundColor: 'white', padding: 20, margin: 15, borderRadius: 8, marginBottom: 30, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  label: { fontSize: 16, color: '#666', fontWeight: '500' },
  value: { fontSize: 16, color: '#333', flex: 1, textAlign: 'right' },
  input: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 6, marginBottom: 12, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  editButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  editButton: { backgroundColor: '#007bff', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 10 },
  saveButton: { backgroundColor: '#28a745', padding: 12, borderRadius: 6, flex: 1, marginRight: 10, alignItems: 'center' },
  cancelButton: { backgroundColor: '#6c757d', padding: 12, borderRadius: 6, flex: 1, marginLeft: 10, alignItems: 'center' },
  editButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  cancelButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  orderItem: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 6, marginBottom: 10 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderId: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  orderDate: { fontSize: 14, color: '#666' },
  orderDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotal: { fontSize: 16, fontWeight: 'bold', color: '#007bff' },
  orderItems: { fontSize: 14, color: '#666' },
  orderStatus: { fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusDelivered: { backgroundColor: '#d4edda', color: '#155724' },
  statusProcessing: { backgroundColor: '#fff3cd', color: '#856404' },
  statusShipped: { backgroundColor: '#cce7ff', color: '#004085' },
  statusPending: { backgroundColor: '#f8d7da', color: '#721c24' },
  noOrdersText: { textAlign: 'center', color: '#666', fontSize: 16, marginVertical: 20 },
  actionButton: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  actionText: { fontSize: 16, color: '#333' },
  logoutButton: { borderBottomWidth: 0, marginTop: 10 },
  logoutText: { color: '#dc3545', fontWeight: 'bold' },
});

export default ProfileScreen;
