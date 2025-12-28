import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, 
  Alert, Share, StatusBar 
} from 'react-native';
import { useCart } from '../context/CartContext'; // ✅ Using Cart Context
import Ionicons from 'react-native-vector-icons/Ionicons';

const ProductDetailsScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // ✅ Using context instead of cartAPI
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    try {
      console.log('Adding to cart:', product.id, quantity);
      const success = await addToCart(product.id, quantity);
      if (success) {
        Alert.alert('Success', 'Product added to cart!');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add product to cart');
    }
  };

  // ✅ FIXED: navigate to 'CartTab' instead of 'Cart'
  const handleBuyNow = async () => {
    try {
      const success = await addToCart(product.id, quantity);
      if (success) {
        navigation.navigate('CartTab'); // ✅ Navigate to Cart tab
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add product to cart');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing product: ${product.name} - $${product.price}`,
        url: product.image_url,
        title: product.name
      });
    } catch (error) {
      console.error('Error sharing product:', error);
    }
  };

  const updateQuantity = (change) => {
    const newQuantity = Math.max(1, Math.min(product.stock || 50, quantity + change));
    setQuantity(newQuantity);
  };

  // Multiple images simulation
  const productImages = [
    product.image_url,
    product.image_url,
    product.image_url
  ];

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
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Product Images */}
        <View style={styles.imageSection}>
          <Image 
            source={{ uri: productImages[selectedImage] }} 
            style={styles.mainImage}
            resizeMode="contain"
          />
          
          {/* Image Thumbnails */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailsContainer}>
            {productImages.map((image, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.thumbnail,
                  selectedImage === index && styles.selectedThumbnail
                ]}
                onPress={() => setSelectedImage(index)}
              >
                <Image 
                  source={{ uri: image }} 
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Product Info */}
        <View style={styles.detailsContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          
          {/* Rating and Reviews */}
          <View style={styles.ratingContainer}>
            <View style={styles.ratingStars}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Ionicons name="star" size={16} color="#FFD700" />
              <Ionicons name="star" size={16} color="#FFD700" />
              <Ionicons name="star" size={16} color="#FFD700" />
              <Ionicons name="star-half" size={16} color="#FFD700" />
            </View>
            <Text style={styles.ratingText}>{product.rating || 4.5} • 1.2k reviews</Text>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>${product.price}</Text>
            <Text style={styles.originalPrice}>${(product.price * 1.2).toFixed(2)}</Text>
            <Text style={styles.discount}>(16% OFF)</Text>
          </View>

          {/* Delivery Info */}
          <View style={styles.deliveryInfo}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.deliveryText}>Delivery by Tomorrow • FREE</Text>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(-1)}
                disabled={quantity <= 1}
              >
                <Text style={[
                  styles.quantityButtonText,
                  quantity <= 1 && styles.disabledButtonText
                ]}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantity}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(1)}
                disabled={quantity >= (product.stock || 50)}
              >
                <Text style={[
                  styles.quantityButtonText,
                  quantity >= (product.stock || 50) && styles.disabledButtonText
                ]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Product Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Product Description</Text>
            <Text style={styles.productDescription}>
              {product.description || 'High-quality product with excellent features. Perfect for everyday use with premium materials and craftsmanship.'}
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.featuresList}>
              <Text style={styles.feature}>• Premium Quality Material</Text>
              <Text style={styles.feature}>• 1 Year Warranty</Text>
              <Text style={styles.feature}>• Free Delivery</Text>
              <Text style={styles.feature}>• Easy Returns</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.wishlistButton]}
          onPress={() => Alert.alert('Added to Wishlist')}
        >
          <Ionicons name="heart-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.addToCartButton]}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.buyNowButton]}
          onPress={handleBuyNow}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 15, paddingVertical: 15, paddingTop: 50,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  shareButton: { padding: 5 },
  imageSection: { backgroundColor: '#F8F9FA', paddingVertical: 20 },
  mainImage: { width: '100%', height: 300, marginBottom: 15 },
  thumbnailsContainer: { paddingHorizontal: 15 },
  thumbnail: {
    width: 60, height: 60, borderRadius: 8, marginRight: 10,
    borderWidth: 2, borderColor: 'transparent', overflow: 'hidden',
  },
  selectedThumbnail: { borderColor: '#FF6B6B' },
  thumbnailImage: { width: '100%', height: '100%', borderRadius: 6 },
  detailsContainer: { padding: 20, paddingBottom: 100 },
  productName: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10, lineHeight: 28 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  ratingStars: { flexDirection: 'row', marginRight: 8 },
  ratingText: { fontSize: 14, color: '#666' },
  priceContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  currentPrice: { fontSize: 24, fontWeight: 'bold', color: '#FF6B6B', marginRight: 10 },
  originalPrice: { fontSize: 18, color: '#999', textDecorationLine: 'line-through', marginRight: 8 },
  discount: { fontSize: 14, color: '#28a745', fontWeight: 'bold' },
  deliveryInfo: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA',
    padding: 12, borderRadius: 8, marginBottom: 20,
  },
  deliveryText: { fontSize: 14, color: '#666', marginLeft: 8 },
  quantitySection: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  quantitySelector: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA',
    borderRadius: 8, padding: 5, alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center', elevation: 2,
  },
  quantityButtonText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  disabledButtonText: { color: '#CCC' },
  quantity: { marginHorizontal: 20, fontSize: 18, fontWeight: 'bold', color: '#333' },
  descriptionSection: { marginBottom: 20 },
  productDescription: { fontSize: 14, lineHeight: 20, color: '#666' },
  featuresSection: { marginBottom: 20 },
  featuresList: { backgroundColor: '#F8F9FA', padding: 15, borderRadius: 8 },
  feature: { fontSize: 14, color: '#666', marginBottom: 5 },
  actionButtons: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 15,
    borderTopWidth: 1, borderTopColor: '#F0F0F0', elevation: 5,
  },
  actionButton: {
    flex: 1, paddingVertical: 15, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', marginHorizontal: 5,
  },
  wishlistButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FF6B6B', flex: 0.2 },
  addToCartButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FF6B6B', flex: 1 },
  buyNowButton: { backgroundColor: '#FF6B6B', flex: 1 },
  addToCartText: { color: '#FF6B6B', fontSize: 16, fontWeight: 'bold' },
  buyNowText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default ProductDetailsScreen;
