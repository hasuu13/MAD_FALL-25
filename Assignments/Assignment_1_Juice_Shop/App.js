import { Text, View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';

export default function App() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🍹 Juice Shop</Text>

      {/* Mango Juice */}
      <View style={styles.card}>
        <Image
          style={styles.image}
          source={{ uri: 'https://i.imgur.com/1bX5QH6.png' }}
        />
        <Text style={styles.juiceName}>Mango Juice</Text>
        <Text style={styles.price}>Rs. 250</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Order</Text>
        </TouchableOpacity>
      </View>

      {/* Orange Juice */}
      <View style={styles.card}>
        <Image
          style={styles.image}
          source={{ uri: 'https://i.imgur.com/YZ6FQ7b.png' }}
        />
        <Text style={styles.juiceName}>Orange Juice</Text>
        <Text style={styles.price}>Rs. 220</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Order</Text>
        </TouchableOpacity>
      </View>

      {/* Apple Juice */}
      <View style={styles.card}>
        <Image
          style={styles.image}
          source={{ uri: 'https://i.imgur.com/8Qf5Z0y.png' }}
        />
        <Text style={styles.juiceName}>Apple Juice</Text>
        <Text style={styles.price}>Rs. 300</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Order</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f2f2f2',
    padding: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  juiceName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    color: 'gray',
    marginVertical: 5,
  },
  button: {
    backgroundColor: '#ff9800',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
