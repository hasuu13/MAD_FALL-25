import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);

  const addTask = () => {
    if(task.trim() === '') return;
    setTasks([...tasks, task]);
    setTask('');
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 To-Do List</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter task"
        value={task}
        onChangeText={setTask}
      />
      <TouchableOpacity style={styles.button} onPress={addTask}>
        <Text style={styles.buttonText}>Add Task</Text>
      </TouchableOpacity>
      <ScrollView style={styles.list}>
        {tasks.map((t, index) => (
          <TouchableOpacity key={index} onPress={() => removeTask(index)} style={styles.taskItem}>
            <Text>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, marginTop:40 },
  title: { fontSize:24, fontWeight:'bold', marginBottom:20, textAlign:'center' },
  input: { borderWidth:1, padding:10, marginBottom:10, borderRadius:5 },
  button: { backgroundColor:'#007bff', padding:10, borderRadius:5, marginBottom:20, alignItems:'center' },
  buttonText: { color:'#fff', fontWeight:'bold' },
  list: { marginTop:10 },
  taskItem: { padding:10, borderBottomWidth:1, borderColor:'#ddd' },
});
