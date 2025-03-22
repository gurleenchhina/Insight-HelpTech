import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { searchAPI } from '../utils/api';

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([
    { 
      id: '1', 
      text: 'Hello! I\'m your pest control assistant. I can help identify pests and recommend appropriate products. How can I help you today?', 
      sender: 'bot' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [imageUploadVisible, setImageUploadVisible] = useState(false);
  
  const flatListRef = useRef();

  useEffect(() => {
    // Auto scroll to the bottom of the chat when new messages are added
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    if (inputText.trim() === '') return;

    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user'
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Call API for response
      const response = await searchAPI.textSearch(inputText);
      
      // Format AI response
      let botResponse = response.recommendation;
      
      // Add product recommendations if available
      if (response.products && (response.products.primary || response.products.alternative)) {
        botResponse += '\\n\\nRecommended Products:';
        if (response.products.primary) {
          botResponse += `\\n- Primary: ${response.products.primary}`;
        }
        if (response.products.alternative) {
          botResponse += `\\n- Alternative: ${response.products.alternative}`;
        }
      }
      
      // Add application advice if available
      if (response.applicationAdvice) {
        botResponse += `\\n\\nApplication Advice: ${response.applicationAdvice}`;
      }

      // Add bot response to chat
      setMessages(prevMessages => [
        ...prevMessages, 
        {
          id: (Date.now() + 1).toString(),
          text: botResponse,
          sender: 'bot'
        }
      ]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      setMessages(prevMessages => [
        ...prevMessages, 
        {
          id: (Date.now() + 1).toString(),
          text: 'Sorry, I encountered an error processing your request. Please try again.',
          sender: 'bot'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicPress = async () => {
    // This would be implemented with speech-to-text functionality
    // For now, we'll just show a placeholder message
    setIsRecording(!isRecording);
    if (isRecording) {
      // Stop recording logic would go here
      setInputText('What products should I use for carpenter ants?');
    }
  };

  const handleImageUpload = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        alert('Permission to access camera roll is required!');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        const base64Image = result.assets[0].base64;
        
        if (base64Image) {
          // Add a loading message
          setMessages(prevMessages => [
            ...prevMessages, 
            {
              id: Date.now().toString(),
              text: 'Analyzing image...',
              sender: 'bot',
              isLoading: true
            }
          ]);
          
          setIsLoading(true);
          
          try {
            // Call image search API
            const response = await searchAPI.imageSearch(base64Image);
            
            // Replace loading message with actual response
            setMessages(prevMessages => {
              const newMessages = [...prevMessages];
              const loadingIndex = newMessages.findIndex(m => m.isLoading);
              
              if (loadingIndex !== -1) {
                // Format AI response
                let botResponse = response.recommendation;
                
                // Add product recommendations if available
                if (response.products && (response.products.primary || response.products.alternative)) {
                  botResponse += '\\n\\nRecommended Products:';
                  if (response.products.primary) {
                    botResponse += `\\n- Primary: ${response.products.primary}`;
                  }
                  if (response.products.alternative) {
                    botResponse += `\\n- Alternative: ${response.products.alternative}`;
                  }
                }
                
                // Add application advice if available
                if (response.applicationAdvice) {
                  botResponse += `\\n\\nApplication Advice: ${response.applicationAdvice}`;
                }
                
                newMessages[loadingIndex] = {
                  id: newMessages[loadingIndex].id,
                  text: botResponse,
                  sender: 'bot'
                };
              }
              
              return newMessages;
            });
          } catch (error) {
            console.error('Error processing image:', error);
            
            // Replace loading message with error
            setMessages(prevMessages => {
              const newMessages = [...prevMessages];
              const loadingIndex = newMessages.findIndex(m => m.isLoading);
              
              if (loadingIndex !== -1) {
                newMessages[loadingIndex] = {
                  id: newMessages[loadingIndex].id,
                  text: 'Sorry, I encountered an error analyzing your image. Please try again.',
                  sender: 'bot'
                };
              }
              
              return newMessages;
            });
          } finally {
            setIsLoading(false);
          }
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('There was a problem selecting your image.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        alert('Permission to access camera is required!');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        const base64Image = result.assets[0].base64;
        
        if (base64Image) {
          // Implement same logic as handleImageUpload
          // For brevity, this would be similar to the image upload function
          setMessages(prevMessages => [
            ...prevMessages, 
            {
              id: Date.now().toString(),
              text: 'Analyzing image...',
              sender: 'bot',
              isLoading: true
            }
          ]);
          
          // Process image analysis (same as in handleImageUpload)
          // ...
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      alert('There was a problem capturing your image.');
    }
  };

  const toggleImageOptions = () => {
    setImageUploadVisible(!imageUploadVisible);
  };

  // Render message item for the chat
  const renderMessageItem = ({ item }) => {
    return (
      <View style={[
        styles.messageBubble, 
        item.sender === 'user' ? styles.userMessage : styles.botMessage
      ]}>
        {item.isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.messageText}>
            {item.text.split('\\n').map((line, i) => (
              <Text key={i}>{line}{i < item.text.split('\\n').length - 1 ? '\n' : ''}</Text>
            ))}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Image 
          source={require('../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Pest Control Assistant</Text>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={item => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
      />
      
      {isLoading && !messages.some(m => m.isLoading) && (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="large" color="#38a169" />
        </View>
      )}
      
      {imageUploadVisible && (
        <View style={styles.imageOptionsContainer}>
          <TouchableOpacity 
            style={styles.imageOption} 
            onPress={handleTakePhoto}
          >
            <Ionicons name="camera" size={24} color="#38a169" />
            <Text style={styles.imageOptionText}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.imageOption} 
            onPress={handleImageUpload}
          >
            <Ionicons name="image" size={24} color="#38a169" />
            <Text style={styles.imageOptionText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputContainer}
      >
        <TouchableOpacity 
          style={styles.attachButton}
          onPress={toggleImageOptions}
        >
          <Ionicons name="attach" size={24} color="#38a169" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        
        {inputText.trim() ? (
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={handleSend}
            disabled={isLoading}
          >
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.micButton, isRecording && styles.recordingButton]} 
            onPress={handleMicPress}
            disabled={isLoading}
          >
            <Ionicons name="mic" size={24} color={isRecording ? "#fff" : "#38a169"} />
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#38a169',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  logo: {
    width: 35,
    height: 35,
    marginRight: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageList: {
    flex: 1,
    padding: 10,
  },
  messageListContent: {
    paddingBottom: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginVertical: 5,
  },
  userMessage: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  botMessage: {
    backgroundColor: '#38a169',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    color: '#222', // Dark text for user messages
  },
  botMessage: {
    backgroundColor: '#38a169',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  userMessage: {
    backgroundColor: '#e2e8f0',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  messageText: {
    fontSize: 16, 
    color: '#222',
  },
  botMessage: {
    backgroundColor: '#38a169',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  botMessageText: {
    color: '#fff',
  },
  userMessage: {
    backgroundColor: '#e2e8f0',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  loadingIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  attachButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 5,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#38a169',
    borderRadius: 50,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 50,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingButton: {
    backgroundColor: '#ef4444',
  },
  imageOptionsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  imageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  imageOptionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#38a169',
  },
});

export default ChatbotScreen;