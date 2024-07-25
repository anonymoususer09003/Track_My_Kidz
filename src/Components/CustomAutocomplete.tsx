import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Colors from '@/Theme/Colors';
import { Icon } from '@ui-kitten/components';

interface AutocompleteProps {
    label?:any;
  data?: any[];
  onSelect: (item: any) => void;
  icon?: any | React.ReactNode; // Define the icon prop as optional
  value?: string; // Optional prop for value
  disabled?: boolean; // Optional prop for disabled
  placeholder?: string; // Optional prop for placeholder
  style?:any
  disableColor?:any
}

const Autocomplete: React.FC<AutocompleteProps> = ({ data, onSelect, icon, value = '', disabled = false, placeholder = 'Type to search...' ,label,style,disableColor}) => {
  const textInputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState<string>(value);
  const [filteredData, setFilteredData] = useState<any>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  useEffect(() => {

      setQuery(value);
    
  }, [value]);

  const handleInputChange = (text: string) => {
    setQuery(text);
    if (text) {
      const filtered = data?.filter(
        (item) => {
          if (item?.name) {
            return item?.name?.toLowerCase().includes(text.toLowerCase());
          } else {
            return item?.toLowerCase().includes(text.toLowerCase());
          }
        }
      );
      setFilteredData(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredData([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectItem = (item: any) => {
    setQuery(item?.name || item);
    setFilteredData([]);
    setShowSuggestions(false);
    onSelect(item);
    textInputRef.current?.blur();
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={{ zIndex: 1 }} activeOpacity={1} onPress={() => handleSelectItem(item)}>
      <Text style={styles.suggestionItem}>{typeof (item) === 'string' ? item : item?.name}</Text>
    </TouchableOpacity>
  );

  const handleTouchOutside = () => {
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback style={{opacity:0.1}} disabled={disabled} onPress={handleTouchOutside}>
        
      <View style={[styles.container,style?.container&&style?.container
    //   disabled&&{  opacity:0.35,
    // borderWidth:0.195,
    // elevation:1,
    // borderRadius:4,
    // width:'100%'}
    ]}>
       {label&&label()}
        <View style={[styles.inputContainer,style?.input&&style.input]}>
          {/* Icon */}
          {icon && icon()}
          {/* TextInput */}
          <TextInput

            ref={textInputRef}
            style={[styles.input, disabled && { backgroundColor: 'transparent',opacity:0.2 }]}
            value={query}
            onChangeText={handleInputChange}
            placeholder={placeholder}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {setShowSuggestions(false)
  
            }}
            editable={!disabled}
            
          />
        </View>
        {showSuggestions && (
          <FlatList
            nestedScrollEnabled
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            style={[styles.suggestionsContainer,style?.list&&style.list]}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    position: 'relative',
    // opacity:0.35,
    // borderWidth:0.195,
    elevation:1,
    // borderRadius:4,
    // width:'100%'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 6,
    elevation: 1,
    height: 40,
    width: '100%',
    paddingHorizontal: 10,
    borderWidth: 0.1,
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: 'black',
    paddingLeft: 10,
    
  },
  suggestionsContainer: {
    borderColor: 'gray',
    borderTopWidth: 0,
    borderRadius: 4,
    maxHeight: 150, // Adjust this to control the height of the suggestions list
    backgroundColor: Colors.white,
   
  },
  suggestionItem: {
    padding: 8,
    borderBottomColor: 'gray',
    color: Colors.black,
  },
});

export default Autocomplete;
