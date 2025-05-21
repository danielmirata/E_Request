import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Link, router } from "expo-router";
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { documentsAPI } from '../api/documents';

interface FormData {
  documentType: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  emailAddress: string;
  completeAddress: string;
  dateNeeded: Date;
  purposeOfRequest: string;
  additionalNotes: string;
  idType: string;
  idPhoto: {
    uri: string;
    type: 'success';
    name: string | undefined;
  } | null;
  isDeclarationChecked: boolean;
}

export default function BarangayDocumentRequestForm() {
  const [formData, setFormData] = useState<FormData>({
    documentType: '',
    firstName: '',
    lastName: '',
    contactNumber: '',
    emailAddress: '',
    completeAddress: '',
    dateNeeded: new Date(),
    purposeOfRequest: '',
    additionalNotes: '',
    idType: '',
    idPhoto: null,
    isDeclarationChecked: false
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || formData.dateNeeded;
    setShowDatePicker(Platform.OS === 'ios');
    setFormData({
      ...formData,
      dateNeeded: currentDate
    });
  };

  const formatDate = (date: Date): string => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const handleDocumentPick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to upload an ID photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const pickedAsset = result.assets[0];
        setFormData({
          ...formData,
          idPhoto: {
            uri: pickedAsset.uri,
            type: 'success',
            name: pickedAsset.uri.split('/').pop()
          }
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to pick image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    const requiredFields: (keyof FormData)[] = [
      'documentType', 'firstName', 'lastName', 'contactNumber', 'completeAddress',
      'dateNeeded', 'purposeOfRequest', 'idType'
    ];

    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0 || !formData.isDeclarationChecked) {
      Alert.alert('Missing Information', 'Please fill in all required fields and check the declaration.');
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();

      // Add each field as a separate key
      formDataToSend.append('document_type', formData.documentType);
      formDataToSend.append('first_name', formData.firstName);
      formDataToSend.append('last_name', formData.lastName);
      formDataToSend.append('contact_number', formData.contactNumber);
      formDataToSend.append('email', formData.emailAddress);
      formDataToSend.append('address', formData.completeAddress);
      // Format date as YYYY-MM-DD
      formDataToSend.append('date_needed', formData.dateNeeded.toISOString().split('T')[0]);
      formDataToSend.append('purpose', formData.purposeOfRequest);
      formDataToSend.append('notes', formData.additionalNotes);
      formDataToSend.append('id_type', formData.idType);
      formDataToSend.append('declaration', formData.isDeclarationChecked ? 'true' : 'false');

      // Add the ID photo if it exists
      if (formData.idPhoto) {
        formDataToSend.append('id_photo', {
          uri: formData.idPhoto.uri,
          name: formData.idPhoto.name || 'id_photo.jpg',
          type: 'image/jpeg'
        } as any);
      }

      const data = await documentsAPI.submitDocumentRequest(formDataToSend);

      if (data.status === 'success') {
        Alert.alert(
          'Success',
          'Document request submitted successfully!',
          [{ text: 'OK', onPress: () => router.push('/service') }]
        );
      } else {
        Alert.alert('Error', 'Failed to submit document request: ' + (data.message || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Error submitting document request:', error);
      if (error.message === 'Not authenticated') {
        Alert.alert(
          'Authentication Error',
          'Please log in again to continue.',
          [{ text: 'OK', onPress: () => router.push('/login') }]
        );
      } else {
        Alert.alert('Error', `Failed to submit document request: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const documentTypes = [
    { label: 'Select Document Type', value: '' },
    { label: 'Barangay Clearance', value: 'Barangay Clearance' },
    { label: 'Certificate of Residency', value: 'Certificate of Residency' },
    { label: 'Certificate of Indigency', value: 'Certificate of Indigency' },
  ];

  const idTypes = [
    { label: 'Select ID Type', value: '' },
    { label: 'PhilSys ID', value: 'philsys' },
    { label: 'Driver\'s License', value: 'drivers_license' },
    { label: 'Passport', value: 'passport' },
    { label: 'Voter\'s ID', value: 'voters_id' },
    { label: 'SSS ID', value: 'sss_id' },
    { label: 'Postal ID', value: 'postal_id' }
  ];

  return (
    <ImageBackground
      source={require('../assets/images/background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.formContainer}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../assets/images/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.formTitle}>Barangay Document Request Form</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Document Type *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.documentType}
                    onValueChange={(value) => handleInputChange('documentType', value)}
                    style={styles.picker}
                    itemStyle={{ fontSize: 14, height: 120 }}
                  >
                    {documentTypes.map((item, index) => (
                      <Picker.Item
                        key={index}
                        label={item.label}
                        value={item.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.rowContainer}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>First Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(value) => handleInputChange('firstName', value)}
                    placeholder="Enter first name"
                    placeholderTextColor="#888"
                  />
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Last Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(value) => handleInputChange('lastName', value)}
                    placeholder="Enter last name"
                    placeholderTextColor="#888"
                  />
                </View>
              </View>

              <View style={styles.rowContainer}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Contact Number *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.contactNumber}
                    onChangeText={(value) => handleInputChange('contactNumber', value)}
                    placeholder="Enter contact number"
                    placeholderTextColor="#888"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.emailAddress}
                    onChangeText={(value) => handleInputChange('emailAddress', value)}
                    placeholder="Enter email address"
                    placeholderTextColor="#888"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Complete Address *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.completeAddress}
                  onChangeText={(value) => handleInputChange('completeAddress', value)}
                  placeholder="Enter complete address"
                  placeholderTextColor="#888"
                  multiline
                />
              </View>

              <View style={styles.rowContainer}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Date Needed *</Text>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text>{formatDate(formData.dateNeeded)}</Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={formData.dateNeeded}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                    />
                  )}
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Purpose of Request *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.purposeOfRequest}
                    onChangeText={(value) => handleInputChange('purposeOfRequest', value)}
                    placeholder="Enter purpose"
                    placeholderTextColor="#888"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Additional Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.additionalNotes}
                  onChangeText={(value) => handleInputChange('additionalNotes', value)}
                  placeholder="Enter additional notes or special requests"
                  placeholderTextColor="#888"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>ID Verification</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Valid ID Type *</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.idType}
                      onValueChange={(value) => handleInputChange('idType', value)}
                      style={styles.picker}
                      itemStyle={{ fontSize: 14, height: 120 }}
                    >
                      {idTypes.map((item, index) => (
                        <Picker.Item
                          key={index}
                          label={item.label}
                          value={item.value}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Upload ID Photo *</Text>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={handleDocumentPick}
                  >
                    <Text style={styles.uploadButtonText}>
                      {formData.idPhoto ? formData.idPhoto.name : 'Choose File'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Declaration</Text>

                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      formData.isDeclarationChecked && styles.checkboxChecked
                    ]}
                    onPress={() => handleInputChange('isDeclarationChecked', !formData.isDeclarationChecked)}
                  >
                    {formData.isDeclarationChecked && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                  <Text style={styles.checkboxLabel}>
                    I declare that all information provided above is true and correct
                  </Text>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => router.push('/service')}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.submitButton,
                    (!formData.documentType || !formData.firstName || !formData.isDeclarationChecked) && styles.submitButtonDisabled
                  ]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Request</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <Link href="/service" asChild>
                  <TouchableOpacity>
                    <Text style={styles.linkText}>Return to Dashboard</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    width: '100%',
  },
  keyboardAvoidingView: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
    width: '100%',
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(250, 241, 241, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#800000',
  },
  sectionContainer: {
    width: '100%',
    backgroundColor: 'rgba(245, 245, 245, 0.7)',
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 12,
    width: '100%',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    flexWrap: 'wrap',
  },
  halfWidth: {
    width: '48%',
    minWidth: 150,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  input: {
    height: 46,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  picker: {
    minHeight: 46,
    color: '#444',
    fontSize: 14,
    width: '100%',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#f9f9f9',
    height: 52,
    justifyContent: 'center',
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    height: 52,
    justifyContent: 'center',
  },
  uploadButtonText: {
    color: '#666',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#800000',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#800000',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#444',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 12,
    gap: 12,
    width: '100%',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 46,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#800000',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccaaa9',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    color: '#3498db',
    fontWeight: '600',
    fontSize: 14,
  }
});