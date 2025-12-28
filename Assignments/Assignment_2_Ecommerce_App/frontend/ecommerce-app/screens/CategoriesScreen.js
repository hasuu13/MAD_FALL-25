import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  TextInput, ActivityIndicator, Alert, StatusBar, Image 
} from 'react-native';
import { productAPI } from '../services/api';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      
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

const CategoriesScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCategoriesAndProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery]);

  const loadCategoriesAndProducts = async () => {
    try {
      setLoading(true);
      const [categoriesData, productsData] = await Promise.all([
        productAPI.getCategories(),
        productAPI.getAllProducts()
      ]);
      
      setCategories(categoriesData);
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load categories and products');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategoriesAndProducts();
    setRefreshing(false);
  };

  const filterProducts = async () => {
    try {
      let filtered = products;

      if (selectedCategory !== 'All') {
        const categoryProducts = await productAPI.getProductsByCategory(selectedCategory);
        filtered = categoryProducts;
      }

      if (searchQuery) {
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setFilteredProducts(filtered);
    } catch (error) {
      console.error('Error filtering products:', error);
    }
  };

  const handleProductPress = useCallback((product) => {
    navigation.navigate('ProductDetails', { product });
  }, [navigation]);

  const handleAddToCart = async (productId) => {
    try {
      Alert.alert('Success', 'Product added to cart!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add product to cart');
    }
  };

  const handleCategoryPress = useCallback(async (category) => {
    setSelectedCategory(category);
    setLoading(true);
    try {
      let productsData;
      if (category === 'All') {
        productsData = await productAPI.getAllProducts();
      } else {
        productsData = await productAPI.getProductsByCategory(category);
      }
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading category products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const renderCategoryItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item && styles.selectedCategory
      ]}
      onPress={() => handleCategoryPress(item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item && styles.selectedCategoryText
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  ), [selectedCategory, handleCategoryPress]);

  const renderProductItem = useCallback(({ item }) => (
    <ProductCard 
      item={item}
      onPress={handleProductPress}
      onAddToCart={handleAddToCart}
    />
  ), [handleProductPress, handleAddToCart]);

  const categoryKeyExtractor = useCallback((item, index) => `category-${index}-${item}`, []);
  const productKeyExtractor = useCallback((item) => `product-${item.id}`, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading amazing products...</Text>
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
        <Text style={styles.headerTitle}>Categories</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Categories */}
      <Text style={styles.sectionTitle}>Shop by Category</Text>
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={categoryKeyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesList}
        contentContainerStyle={styles.categoriesContent}
      />

      {/* Product Count */}
      <Text style={styles.resultsText}>
        {filteredProducts.length} products found in {selectedCategory === 'All' ? 'all categories' : selectedCategory}
      </Text>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={productKeyExtractor}
        showsVerticalScrollIndicator={false}
        style={styles.productsList}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={60} color="#CCC" />
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>Try changing your search or category</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  headerPlaceholder: { width: 24 },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#333' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginHorizontal: 15, color: '#333' },

  // ✅ FIXED: Category Item Styles - Proper size
  categoriesList: { marginBottom: 15 },
  categoriesContent: { paddingHorizontal: 10 },
  categoryItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedCategory: { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' },
  selectedCategoryText: { color: 'white', fontWeight: '600' },

  resultsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    marginHorizontal: 15,
    textAlign: 'center',
  },

  productsList: { flex: 1, paddingHorizontal: 10 },
  productRow: { justifyContent: 'space-between', marginBottom: 10 },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  productImage: { width: '100%', height: 120, borderRadius: 8, marginBottom: 10, backgroundColor: '#F8F9FA' },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#333', lineHeight: 18 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  ratingText: { fontSize: 12, color: '#666', marginLeft: 4, marginRight: 4, fontWeight: '500' },
  reviews: { fontSize: 11, color: '#999' },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#FF6B6B', marginBottom: 4 },
  productCategory: { fontSize: 11, color: '#666', marginBottom: 8, textTransform: 'capitalize' },
  addToCartBtn: { backgroundColor: '#FF6B6B', padding: 8, borderRadius: 6, alignItems: 'center' },
  addToCartText: { color: 'white', fontSize: 12, fontWeight: 'bold' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
  emptyText: { fontSize: 18, color: '#666', marginTop: 10, fontWeight: '600' },
  emptySubtext: { fontSize: 14, color: '#999', marginTop: 5, textAlign: 'center' },
});

export default CategoriesScreen;