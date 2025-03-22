import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [recentSearches, setRecentSearches] = useState([
    'Ants in kitchen',
    'Spiders in basement',
    'Wasps near window'
  ]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      setSearchResults({
        pestType: 'Ants',
        recommendation: 'For kitchen ant infestations, a targeted approach is recommended.',
        products: {
          primary: 'Greenway Ant Gel',
          alternative: 'Maxforce Quantum'
        },
        applicationAdvice: 'Apply in small dots along ant trails and entry points. Keep away from food preparation areas.'
      });
      
      // Add to recent searches if it's not already there
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches(prev => [searchQuery, ...prev].slice(0, 5));
      }
      
      setIsSearching(false);
    }, 1500);
  };

  const handleRecentSearch = (query) => {
    setSearchQuery(query);
    // Optionally trigger search immediately
  };

  const SearchResult = ({ result }) => {
    if (!result) return null;
    
    return (
      <View style={styles.resultCard}>
        <Text style={styles.pestType}>{result.pestType}</Text>
        <Text style={styles.recommendation}>{result.recommendation}</Text>
        
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Recommended Products:</Text>
          {result.products.primary && (
            <View style={styles.productItem}>
              <Text style={styles.primaryProduct}>Primary: {result.products.primary}</Text>
            </View>
          )}
          {result.products.alternative && (
            <View style={styles.productItem}>
              <Text style={styles.alternativeProduct}>Alternative: {result.products.alternative}</Text>
            </View>
          )}
        </View>
        
        {result.applicationAdvice && (
          <View style={styles.adviceSection}>
            <Text style={styles.sectionTitle}>Application Advice:</Text>
            <Text style={styles.adviceText}>{result.applicationAdvice}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>View Product Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchContainer}>
          <Text style={styles.title}>What's bugging you?</Text>
          
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Describe the pest situation..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity 
              style={[styles.searchButton, !searchQuery.trim() && styles.searchButtonDisabled]} 
              onPress={handleSearch}
              disabled={!searchQuery.trim()}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
          
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#38a169" />
              <Text style={styles.loadingText}>Searching for solutions...</Text>
            </View>
          ) : searchResults ? (
            <SearchResult result={searchResults} />
          ) : (
            <View style={styles.recentSearchesContainer}>
              <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
              {recentSearches.map((query, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.recentSearchItem}
                  onPress={() => handleRecentSearch(query)}
                >
                  <Text style={styles.recentSearchText}>{query}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9ff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  searchContainer: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchInputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  searchButton: {
    marginLeft: 8,
    height: 50,
    paddingHorizontal: 20,
    backgroundColor: '#38a169',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#a0aec0',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4a5568',
  },
  recentSearchesContainer: {
    marginTop: 20,
  },
  recentSearchesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a5568',
    marginBottom: 12,
  },
  recentSearchItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  recentSearchText: {
    fontSize: 16,
    color: '#2d3748',
  },
  resultCard: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  pestType: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#38a169',
    marginBottom: 8,
  },
  recommendation: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 16,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  productsSection: {
    marginBottom: 16,
  },
  productItem: {
    backgroundColor: '#f7fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  primaryProduct: {
    fontSize: 16,
    color: '#2d3748',
    fontWeight: '600',
  },
  alternativeProduct: {
    fontSize: 16,
    color: '#4a5568',
  },
  adviceSection: {
    marginBottom: 16,
  },
  adviceText: {
    fontSize: 16,
    color: '#4a5568',
    lineHeight: 22,
    backgroundColor: '#f7fafc',
    padding: 12,
    borderRadius: 8,
  },
  detailsButton: {
    backgroundColor: '#3182ce',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SearchScreen;