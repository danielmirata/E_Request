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
import { complaintsApi } from '../api/complaints';

interface ComplaintData {
  firstName: string;
  lastName: string;
  contactNumber: string;
  email: string;
  complainantAddress: string;
  complaintType: string;
  incidentDate: Date;
  incidentTime: Date;
  incidentLocation: string;
  complaintDescription: string;
  evidencePhoto: {
    uri: string;
    type: 'success';
    name: string | undefined;
  } | null;
  isDeclarationChecked: boolean;
}

export default function BarangayComplaintForm() {
  const [complaintData, setComplaintData] = useState<ComplaintData>({
    firstName: '',
    lastName: '',
    contactNumber: '',
    email: '',
    complainantAddress: '',
    complaintType: '',
    incidentDate: new Date(),
    incidentTime: new Date(),
    incidentLocation: '',
    complaintDescription: '',
    evidencePhoto: null,
    isDeclarationChecked: false
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof ComplaintData, value: ComplaintData[keyof ComplaintData]) => {
    setComplaintData({
      ...complaintData,
      [field]: value
    });
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || complaintData.incidentDate;
    setShowDatePicker(Platform.OS === 'ios');
    setComplaintData({
      ...complaintData,
      incidentDate: currentDate
    });
  };

  const handleTimeChange = (event: any, selectedTime: Date | undefined) => {
    const currentTime = selectedTime || complaintData.incidentTime;
    setShowTimePicker(Platform.OS === 'ios');
    setComplaintData({
      ...complaintData,
      incidentTime: currentTime
    });
  };

  const formatDate = (date: Date): string => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const formatTime = (time: Date): string => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload evidence photos.');
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
        setComplaintData({
          ...complaintData,
          evidencePhoto: {
            uri: pickedAsset.uri,
            type: 'success',
            name: pickedAsset.uri.split('/').pop()
          }
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    const requiredFields: (keyof ComplaintData)[] = [
      'firstName',
      'lastName',
      'contactNumber',
      'complainantAddress',
      'complaintType',
      'incidentDate',
      'incidentLocation',
      'complaintDescription'
    ];

    const missingFields = requiredFields.filter(field => !complaintData[field]);

    if (missingFields.length > 0 || !complaintData.isDeclarationChecked) {
      Alert.alert(
        'Missing Information',
        'Please fill in all required fields and check the declaration.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();

      // Add each field as a separate key
      formDataToSend.append('first_name', complaintData.firstName);
      formDataToSend.append('last_name', complaintData.lastName);
      formDataToSend.append('contact_number', complaintData.contactNumber);
      formDataToSend.append('email', complaintData.email);
      formDataToSend.append('complete_address', complaintData.complainantAddress);
      formDataToSend.append('complaint_type', complaintData.complaintType);
      // Format date as YYYY-MM-DD
      formDataToSend.append('incident_date', complaintData.incidentDate.toISOString().split('T')[0]);
      // Format time as HH:MM
      formDataToSend.append('incident_time', complaintData.incidentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      formDataToSend.append('incident_location', complaintData.incidentLocation);
      formDataToSend.append('complaint_description', complaintData.complaintDescription);
      formDataToSend.append('declaration', complaintData.isDeclarationChecked ? 'true' : 'false');

      // Add the evidence photo if it exists
      if (complaintData.evidencePhoto) {
        formDataToSend.append('evidence_photo', {
          uri: complaintData.evidencePhoto.uri,
          name: complaintData.evidencePhoto.name || 'evidence_photo.jpg',
          type: 'image/jpeg'
        } as any);
      }

      const data = await complaintsApi.submitComplaint(formDataToSend);

      if (data.status === 'success') {
        Alert.alert(
          'Success',
          'Your complaint has been submitted successfully!',
          [{ text: 'OK', onPress: () => router.push('/service') }]
        );
      } else {
        Alert.alert('Error', 'Failed to submit complaint: ' + (data.message || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Error submitting complaint:', error);
      Alert.alert('Error', `Failed to submit complaint: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const complaintTypes = [
    { label: 'Select Complaint Type', value: '' },
    { label: 'Noise Complaint', value: 'noise' },
    { label: 'Public Disturbance', value: 'disturbance' },
    { label: 'Property Dispute', value: 'property' },
    { label: 'Illegal Construction', value: 'construction' },
    { label: 'Environmental Concerns', value: 'environmental' },
    { label: 'Safety Hazard', value: 'safety' },
    { label: 'Vandalism', value: 'vandalism' },
    { label: 'Others', value: 'others' }
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
                <Text style={styles.formTitle}>Barangay Complaint Form</Text>
              </View>

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Complainant Information</Text>

                <View style={styles.rowContainer}>
                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <Text style={styles.inputLabel}>First Name *</Text>
                    <TextInput
                      style={styles.input}
                      value={complaintData.firstName}
                      onChangeText={(value) => handleInputChange('firstName', value)}
                      placeholder="Enter first name"
                      placeholderTextColor="#888"
                    />
                  </View>

                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <Text style={styles.inputLabel}>Last Name *</Text>
                    <TextInput
                      style={styles.input}
                      value={complaintData.lastName}
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
                      value={complaintData.contactNumber}
                      onChangeText={(value) => handleInputChange('contactNumber', value)}
                      placeholder="Enter contact number"
                      placeholderTextColor="#888"
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                      style={styles.input}
                      value={complaintData.email}
                      onChangeText={(value) => handleInputChange('email', value)}
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
                    value={complaintData.complainantAddress}
                    onChangeText={(value) => handleInputChange('complainantAddress', value)}
                    placeholder="Enter your complete address"
                    placeholderTextColor="#888"
                    multiline
                  />
                </View>
              </View>

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Complaint Details</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Complaint Type *</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={complaintData.complaintType}
                      onValueChange={(value) => handleInputChange('complaintType', value)}
                      style={styles.picker}
                      itemStyle={{ fontSize: 14, height: 120 }}
                    >
                      {complaintTypes.map((item, index) => (
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
                    <Text style={styles.inputLabel}>Incident Date *</Text>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text>{formatDate(complaintData.incidentDate)}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={complaintData.incidentDate}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                      />
                    )}
                  </View>

                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <Text style={styles.inputLabel}>Incident Time</Text>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowTimePicker(true)}
                    >
                      <Text>{formatTime(complaintData.incidentTime)}</Text>
                    </TouchableOpacity>
                    {showTimePicker && (
                      <DateTimePicker
                        value={complaintData.incidentTime}
                        mode="time"
                        display="default"
                        onChange={handleTimeChange}
                      />
                    )}
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Incident Location *</Text>
                  <TextInput
                    style={styles.input}
                    value={complaintData.incidentLocation}
                    onChangeText={(value) => handleInputChange('incidentLocation', value)}
                    placeholder="Enter incident location"
                    placeholderTextColor="#888"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Complaint Description *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={complaintData.complaintDescription}
                    onChangeText={(value) => handleInputChange('complaintDescription', value)}
                    placeholder="Please provide a detailed description of your complaint"
                    placeholderTextColor="#888"
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Evidence</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Upload Evidence Photo</Text>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={handleImagePick}
                  >
                    <Text style={styles.uploadButtonText}>
                      {complaintData.evidencePhoto ? complaintData.evidencePhoto.name : 'Choose Photo'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {complaintData.evidencePhoto && (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: complaintData.evidencePhoto.uri }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleInputChange('evidencePhoto', null)}
                    >
                      <Text style={styles.removeImageText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Declaration</Text>

                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      complaintData.isDeclarationChecked && styles.checkboxChecked
                    ]}
                    onPress={() => handleInputChange('isDeclarationChecked', !complaintData.isDeclarationChecked)}
                  >
                    {complaintData.isDeclarationChecked && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                  <Text style={styles.checkboxLabel}>
                    I declare that all information provided above is true and correct to the best of my knowledge
                  </Text>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => router.replace('/service')}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.submitButton,
                    (!complaintData.firstName || !complaintData.isDeclarationChecked) && styles.submitButtonDisabled
                  ]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Complaint</Text>
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
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
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
  imagePreviewContainer: {
    marginTop: 8,
    position: 'relative',
    alignItems: 'center',
    width: '100%',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  removeImageButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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