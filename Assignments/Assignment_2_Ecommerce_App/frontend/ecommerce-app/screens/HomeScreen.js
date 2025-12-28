import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, 
  TextInput, ActivityIndicator, Alert, Modal, ScrollView 
} from 'react-native';
import { useProduct } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

// ✅ Filter Modal Component
const FilterModal = ({ visible, onClose, onApply, categories }) => {
  const [filters, setFilters] = useState({
    category: 'All',
    minPrice: '',
    maxPrice: '',
    sortBy: 'name'
  });

  const applyFilters = () => {
    onApply(filters);
    onClose();
  };

  const resetFilters = () => {
    setFilters({
      category: 'All',
      minPrice: '',
      maxPrice: '',
      sortBy: 'name'
    });
    onApply({
      category: 'All',
      minPrice: '',
      maxPrice: '',
      sortBy: 'name'
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Products</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            {/* Category Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      filters.category === cat && styles.selectedCategoryChip
                    ]}
                    onPress={() => setFilters({...filters, category: cat})}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      filters.category === cat && styles.selectedCategoryChipText
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Price Range</Text>
              <View style={styles.priceInputs}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChangeText={(text) => setFilters({...filters, minPrice: text})}
                  keyboardType="numeric"
                />
                <Text style={styles.priceSeparator}>to</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChangeText={(text) => setFilters({...filters, maxPrice: text})}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Sort By</Text>
              {['name', 'price_low', 'price_high', 'rating'].map(option => (
                <TouchableOpacity
                  key={option}
                  style={styles.sortOption}
                  onPress={() => setFilters({...filters, sortBy: option})}
                >
                  <Ionicons 
                    name={filters.sortBy === option ? "radio-button-on" : "radio-button-off"} 
                    size={20} 
                    color="#FF6B6B" 
                  />
                  <Text style={styles.sortOptionText}>
                    {option === 'name' && 'Name (A-Z)'}
                    {option === 'price_low' && 'Price: Low to High'}
                    {option === 'price_high' && 'Price: High to Low'}
                    {option === 'rating' && 'Highest Rated'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ✅ Product Card
const ProductCard = memo(({ item, onPress, onAddToCart }) => (
  <TouchableOpacity 
    style={styles.productCard}
    onPress={() => onPress(item)}
  >
    <Image 
      source={{ uri: item.image_url }} 
      style={styles.productImage}
      resizeMode="contain"
    />
    <View style={styles.productInfo}>
      <Text style={styles.productName} numberOfLines={2}>
        {item.name}
      </Text>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={14} color="#FFD700" />
        <Text style={styles.ratingText}>{item.rating?.toFixed(1) || '4.5'}</Text>
        <Text style={styles.reviews}>({item.reviews || '100'}+)</Text>
      </View>
      <Text style={styles.productPrice}>${item.price}</Text>
      <Text style={styles.productCategory}>
        {item.category?.charAt(0).toUpperCase() + item.category?.slice(1)}
      </Text>
      <TouchableOpacity 
        style={styles.addToCartBtn}
        onPress={() => onAddToCart(item.id)}
      >
        <Text style={styles.addToCartText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
));

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  
  const { products, categories, loading, error, loadProducts } = useProduct();
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { filterProducts(); }, [products, searchQuery, activeFilters]);

  const filterProducts = () => {
    let filtered = [...products];
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeFilters.category && activeFilters.category !== 'All') {
      filtered = filtered.filter(p => 
        p.category?.toLowerCase() === activeFilters.category.toLowerCase()
      );
    }
    if (activeFilters.minPrice) {
      filtered = filtered.filter(p => p.price >= parseFloat(activeFilters.minPrice));
    }
    if (activeFilters.maxPrice) {
      filtered = filtered.filter(p => p.price <= parseFloat(activeFilters.maxPrice));
    }
    if (activeFilters.sortBy === 'price_low') filtered.sort((a,b)=>a.price-b.price);
    else if (activeFilters.sortBy === 'price_high') filtered.sort((a,b)=>b.price-a.price);
    else if (activeFilters.sortBy === 'rating') filtered.sort((a,b)=>(b.rating||0)-(a.rating||0));
    else filtered.sort((a,b)=>a.name.localeCompare(b.name));

    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (productId) => {
    try {
      const success = await addToCart(productId, 1);
      if (success) Alert.alert('Success', 'Product added to cart!');
    } catch (e) {
      Alert.alert('Error', 'Failed to add product to cart');
    }
  };

  const handleProductPress = useCallback((product) => {
    navigation.navigate('ProductDetails', { product });
  }, [navigation]);

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    setShowFilters(false);
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#FF6B6B" />
      <Text style={styles.loadingText}>Loading products...</Text>
    </View>
  );

  if (error) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>Error: {error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ✅ Updated Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>ShopEasy</Text>
          <Text style={styles.headerSubtitle}>
            {user ? `Welcome, ${user.name}!` : 'Shopping as Guest'}
          </Text>
        </View>

        {!user ? (
          <View style={styles.authButtons}>
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.signupButton}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.signupButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters and Products */}
      <Text style={styles.resultsText}>
        {filteredProducts.length} products found
      </Text>

      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => (
          <ProductCard 
            item={item}
            onPress={handleProductPress}
            onAddToCart={handleAddToCart}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={60} color="#CCC" />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        categories={categories}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 10 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FF6B6B' },
  headerSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },

  // ✅ Added Auth Buttons
  authButtons: { flexDirection: 'row', alignItems: 'center' },
  loginButton: { backgroundColor: '#FF6B6B', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6, marginRight: 8 },
  loginButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  signupButton: { backgroundColor: 'transparent', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: '#FF6B6B' },
  signupButtonText: { color: '#FF6B6B', fontSize: 14, fontWeight: 'bold' },

  filterButton: { padding: 8, backgroundColor: '#F8F9FA', borderRadius: 8 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', margin: 10, paddingHorizontal: 15, borderRadius: 25, borderWidth: 1, borderColor: '#E0E0E0' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#333' },

  resultsText: { fontSize: 14, color: '#666', marginHorizontal: 15, marginBottom: 10 },
  row: { justifyContent: 'space-between', paddingHorizontal: 5 },
  productCard: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 15, width: '48%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4, borderWidth: 1, borderColor: '#F0F0F0' },
  productImage: { width: '100%', height: 120, borderRadius: 8, marginBottom: 10, backgroundColor: '#F8F9FA' },
  productInfo: { flex: 1 },
  productName: { fontSize: 13, fontWeight: '600', marginBottom: 6, color: '#333' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  ratingText: { fontSize: 12, color: '#666', marginLeft: 4, marginRight: 4, fontWeight: '500' },
  reviews: { fontSize: 11, color: '#999' },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#FF6B6B', marginBottom: 4 },
  productCategory: { fontSize: 11, color: '#888', marginBottom: 8, textTransform: 'capitalize' },
  addToCartBtn: { backgroundColor: '#FF6B6B', padding: 8, borderRadius: 6, alignItems: 'center' },
  addToCartText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
  emptyText: { fontSize: 18, color: '#666', marginTop: 10, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  filterContent: { padding: 20 },
  filterSection: { marginBottom: 25 },
  filterLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  categoryChip: { backgroundColor: '#F8F9FA', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#E0E0E0' },
  selectedCategoryChip: { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' },
  categoryChipText: { fontSize: 14, color: '#333', fontWeight: '500' },
  selectedCategoryChipText: { color: 'white', fontWeight: '600' },
  priceInputs: { flexDirection: 'row', alignItems: 'center' },
  priceInput: { flex: 1, borderWidth: 1, borderColor: '#E0E0E0', padding: 12, borderRadius: 8, fontSize: 16 },
  priceSeparator: { marginHorizontal: 10, color: '#666' },
  sortOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  sortOptionText: { fontSize: 16, color: '#333', marginLeft: 10 },
  modalActions: { flexDirection: 'row', padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  resetButton: { flex: 1, padding: 15, backgroundColor: '#6C757D', borderRadius: 8, alignItems: 'center', marginRight: 10 },
  resetButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  applyButton: { flex: 2, padding: 15, backgroundColor: '#FF6B6B', borderRadius: 8, alignItems: 'center' },
  applyButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default HomeScreen;
