import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { API_CONFIG } from '../api/config';

// Mock data for demonstration
const MOCK_COMPLAINTS = [
  {
    id: 'C-2025-0001',
    complaintType: 'Noise Complaint',
    submittedDate: '2025-05-03T10:30:00Z',
    status: 'Under Review',
    description: 'Loud construction noise during quiet hours from the building next door.',
    incidentLocation: 'Block 5, Lot 23, Sunshine Village',
    hasEvidence: true,
    comments: [
      { date: '2025-05-04T09:15:00Z', text: 'Complaint received and assigned to Officer Santos.', author: 'Admin' },
      { date: '2025-05-05T14:20:00Z', text: 'Site inspection scheduled for May 7, 2025.', author: 'Officer Santos' }
    ]
  },
  {
    id: 'C-2025-0045',
    complaintType: 'Property Dispute',
    submittedDate: '2025-04-27T15:45:00Z',
    status: 'Scheduled for Mediation',
    description: 'Boundary dispute with neighbor regarding fence placement.',
    incidentLocation: 'Block 3, Lot 17, Sunshine Village',
    hasEvidence: true,
    comments: [
      { date: '2025-04-28T11:00:00Z', text: 'Complaint received and assigned to Officer Reyes.', author: 'Admin' },
      { date: '2025-04-29T16:30:00Z', text: 'Initial assessment completed. Mediation recommended.', author: 'Officer Reyes' },
      { date: '2025-05-02T10:00:00Z', text: 'Mediation scheduled for May 10, 2025 at 2:00 PM.', author: 'Admin' }
    ]
  },
  {
    id: 'C-2025-0087',
    complaintType: 'Environmental Concerns',
    submittedDate: '2025-04-15T09:20:00Z',
    status: 'Resolved',
    description: 'Improper garbage disposal by commercial establishment causing odor issues.',
    incidentLocation: 'Commercial Area, Main Street',
    hasEvidence: true,
    comments: [
      { date: '2025-04-16T08:45:00Z', text: 'Complaint received and assigned to Officer Mendoza.', author: 'Admin' },
      { date: '2025-04-17T13:20:00Z', text: 'Site inspection completed. Notice issued to establishment.', author: 'Officer Mendoza' },
      { date: '2025-04-22T09:30:00Z', text: 'Follow-up inspection conducted. Proper waste management now in place.', author: 'Officer Mendoza' },
      { date: '2025-04-23T10:15:00Z', text: 'Case resolved. Thank you for your report.', author: 'Admin' }
    ]
  },
  {
    id: 'C-2025-0102',
    complaintType: 'Public Disturbance',
    submittedDate: '2025-05-06T22:15:00Z',
    status: 'New',
    description: 'Group of individuals causing disturbance at the community park after hours.',
    incidentLocation: 'Sunshine Village Community Park',
    hasEvidence: false,
    comments: []
  }
];

interface Complaint {
  id: string;
  complaintType: string;
  submittedDate: string;
  status: string;
  description: string;
  incidentLocation: string;
  hasEvidence: boolean;
  evidencePhoto?: string;
  comments: Array<{
    date: string;
    text: string;
    author: string;
  }>;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'New':
      return '#007bff'; // Blue
    case 'Under Review':
      return '#ff9800'; // Orange
    case 'Scheduled for Mediation':
      return '#9c27b0'; // Purple
    case 'In Progress':
      return '#ffc107'; // Amber
    case 'Resolved':
      return '#4caf50'; // Green
    case 'Rejected':
      return '#f44336'; // Red
    default:
      return '#757575'; // Grey
  }
};

export default function ComplaintTrackingPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  const fetchComplaints = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPLAINTS}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.success) {
        const formattedComplaints = data.complaints.map((complaint: any) => {
          // Log the evidence photo path
          console.log('Evidence photo path:', complaint.evidence_photo);

          // Remove the duplicate evidence_photos directory from the path
          const evidencePhotoUrl = complaint.evidence_photo
            ? `${API_CONFIG.BASE_URL}/uploads/evidence_photos/${complaint.evidence_photo.replace('evidence_photos/', '')}`
            : undefined;

          // Log the full evidence photo URL
          console.log('Evidence photo URL:', evidencePhotoUrl);

          return {
            id: complaint.complaint_id,
            complaintType: complaint.complaint_type,
            submittedDate: complaint.created_at,
            status: complaint.status,
            description: complaint.description,
            incidentLocation: complaint.location,
            hasEvidence: complaint.has_evidence === '1',
            evidencePhoto: evidencePhotoUrl,
            comments: complaint.remarks ? [{
              date: complaint.updated_at,
              text: complaint.remarks,
              author: 'Admin'
            }] : []
          };
        });
        setComplaints(formattedComplaints);
        setFilteredComplaints(formattedComplaints);

        if (formattedComplaints.length === 0) {
          Alert.alert('Info', 'No complaints found');
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch complaints');
      }
    } catch (error: any) {
      console.error('Error fetching complaints:', error);
      if (error.message === 'Not authenticated') {
        Alert.alert(
          'Authentication Error',
          'Please log in again to continue.',
          [{ text: 'OK', onPress: () => router.push('/login') }]
        );
      } else {
        Alert.alert('Error', 'Failed to fetch complaints. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchComplaints();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints().finally(() => {
      setRefreshing(false);
    });
  };

  const handleFilter = (filterType: string) => {
    setActiveFilter(filterType);

    if (filterType === 'All') {
      setFilteredComplaints(complaints);
    } else {
      const filtered = complaints.filter(complaint => complaint.status === filterType);
      setFilteredComplaints(filtered);
    }
  };

  const viewComplaintDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setDetailModalVisible(true);
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const renderComplaintItem = ({ item }: { item: Complaint }) => (
    <TouchableOpacity
      style={styles.complaintCard}
      onPress={() => viewComplaintDetails(item)}
    >
      <View style={styles.complaintHeader}>
        <Text style={styles.complaintId}>{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.complaintInfo}>
        <Text style={styles.complaintType}>{item.complaintType}</Text>
        <Text style={styles.complaintDate}>Submitted: {formatDate(item.submittedDate)}</Text>
        <Text
          style={styles.complaintDescription}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      </View>

      <View style={styles.complaintFooter}>
        <Text style={styles.commentsCount}>
          {item.comments.length} {item.comments.length === 1 ? 'update' : 'updates'}
        </Text>
        <View style={styles.footerRight}>
          {item.hasEvidence && (
            <View style={styles.evidenceBadge}>
              <Text style={styles.evidenceText}>Evidence</Text>
            </View>
          )}
          <Text style={styles.viewDetails}>View Details</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === label && styles.activeFilterButton
      ]}
      onPress={() => handleFilter(label)}
    >
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === label && styles.activeFilterText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const ComplaintDetailModal = () => {
    if (!selectedComplaint) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complaint Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDetailModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <Text style={styles.detailHeaderText}>Reference Number</Text>
                  <Text style={styles.detailHeaderValue}>{selectedComplaint.id}</Text>
                </View>

                <View style={[styles.statusRow, { backgroundColor: getStatusColor(selectedComplaint.status) + '20' }]}>
                  <Text style={styles.statusLabel}>Current Status:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedComplaint.status) }]}>
                    <Text style={styles.statusText}>{selectedComplaint.status}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Complaint Information</Text>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type:</Text>
                  <Text style={styles.detailValue}>{selectedComplaint.complaintType}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date Submitted:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedComplaint.submittedDate)}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Location:</Text>
                  <Text style={styles.detailValue}>{selectedComplaint.incidentLocation}</Text>
                </View>

                <View style={styles.descriptionBox}>
                  <Text style={styles.detailLabel}>Description:</Text>
                  <Text style={styles.descriptionText}>{selectedComplaint.description}</Text>
                </View>

                {selectedComplaint.hasEvidence && selectedComplaint.evidencePhoto && (
                  <View style={styles.evidenceSection}>
                    <Text style={styles.detailLabel}>Evidence Photo:</Text>
                    {!imageError ? (
                      <Image
                        source={{ uri: selectedComplaint.evidencePhoto }}
                        style={styles.evidenceImage}
                        resizeMode="cover"
                        onError={() => {
                          console.error('Error loading image:', selectedComplaint.evidencePhoto);
                          setImageError(true);
                        }}
                      />
                    ) : (
                      <View style={styles.evidenceErrorContainer}>
                        <Text style={styles.evidenceErrorText}>Failed to load image</Text>
                        <TouchableOpacity
                          style={styles.retryButton}
                          onPress={() => setImageError(false)}
                        >
                          <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Case Updates</Text>

                {selectedComplaint.comments.length > 0 ? (
                  <View style={styles.timelineContainer}>
                    {selectedComplaint.comments.map((comment, index) => (
                      <View key={index} style={styles.timelineItem}>
                        <View style={styles.timelineDot} />
                        {index < selectedComplaint.comments.length - 1 && (
                          <View style={styles.timelineLine} />
                        )}
                        <View style={styles.timelineContent}>
                          <Text style={styles.timelineDate}>{formatDate(comment.date)}</Text>
                          <Text style={styles.timelineAuthor}>{comment.author}</Text>
                          <Text style={styles.timelineText}>{comment.text}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noUpdatesText}>No updates yet. Your complaint has been received and will be processed shortly.</Text>
                )}
              </View>

              <View style={styles.helpSection}>
                <Text style={styles.helpText}>Need help or have questions about your complaint?</Text>
                <TouchableOpacity
                  style={styles.helpButton}
                  onPress={() => {
                    setDetailModalVisible(false);
                    Alert.alert('Contact Support', 'This would connect you to the support team.');
                  }}
                >
                  <Text style={styles.helpButtonText}>Contact Support</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const handleTrackComplaint = async () => {
    if (!trackingNumber.trim()) {
      Alert.alert('Error', 'Please enter a tracking number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://192.168.1.14/CANTIL_ESYSTEM2.0/public/api/complaints/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ complaint_id: trackingNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.success) {
        const formattedComplaint = {
          id: data.complaint.complaint_id,
          complaintType: data.complaint.complaint_type,
          submittedDate: data.complaint.created_at,
          status: data.complaint.status,
          description: data.complaint.description,
          incidentLocation: data.complaint.location,
          hasEvidence: data.complaint.has_evidence === '1',
          evidencePhoto: data.complaint.evidence_photo ? `${API_CONFIG.BASE_URL}/uploads/evidence_photos/${data.complaint.evidence_photo}` : undefined,
          comments: data.complaint.remarks ? [{
            date: data.complaint.updated_at,
            text: data.complaint.remarks,
            author: 'Admin'
          }] : []
        };
        setTrackingResult(formattedComplaint);
      } else {
        Alert.alert('Not Found', data.message || 'Complaint not found');
      }
    } catch (error: any) {
      console.error('Error tracking complaint:', error);
      Alert.alert('Error', error.message || 'Failed to track complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.pageTitle}>My Complaints</Text>
          </View>

          <Link href="/complain" asChild>
            <TouchableOpacity style={styles.newComplaintButton}>
              <Text style={styles.newComplaintText}>+ New Complaint</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollView}
          >
            {renderFilterButton('All')}
            {renderFilterButton('New')}
            {renderFilterButton('Under Review')}
            {renderFilterButton('Scheduled for Mediation')}
            {renderFilterButton('In Progress')}
            {renderFilterButton('Resolved')}
            {renderFilterButton('Rejected')}
          </ScrollView>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#800000" />
            <Text style={styles.loadingText}>Loading your complaints...</Text>
          </View>
        ) : (
          <>
            {filteredComplaints.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Text style={styles.emptyIcon}>📝</Text>
                </View>
                <Text style={styles.emptyTitle}>No complaints found</Text>
                <Text style={styles.emptyText}>
                  {activeFilter === 'All'
                    ? "You haven't submitted any complaints yet."
                    : `You don't have any complaints with '${activeFilter}' status.`}
                </Text>
                {activeFilter !== 'All' && (
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => handleFilter('All')}
                  >
                    <Text style={styles.viewAllText}>View All Complaints</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <FlatList
                data={filteredComplaints}
                renderItem={renderComplaintItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.complaintsList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#800000']}
                  />
                }
              />
            )}
          </>
        )}

        <View style={styles.footer}>
          <Link href="/service" asChild>
            <TouchableOpacity style={styles.footerButton}>
              <Text style={styles.footerButtonText}>Return to Dashboard</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <ComplaintDetailModal />

        <View style={styles.trackingContainer}>
          <View style={styles.searchBox}>
            <Text style={styles.searchLabel}>Enter Tracking Number:</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter your tracking number here"
              value={trackingNumber}
              onChangeText={setTrackingNumber}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={[styles.searchButton, loading && styles.searchButtonDisabled]}
              onPress={handleTrackComplaint}
              disabled={loading}
            >
              <Text style={styles.searchButtonText}>
                {loading ? 'Searching...' : 'Track Complaint'}
              </Text>
            </TouchableOpacity>
          </View>

          {trackingResult && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Tracking Result</Text>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Status:</Text>
                <Text style={styles.resultText}>{trackingResult.status}</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Type:</Text>
                <Text style={styles.resultText}>{trackingResult.complaintType}</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Location:</Text>
                <Text style={styles.resultText}>{trackingResult.incidentLocation}</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Last Update:</Text>
                <Text style={styles.resultText}>{formatDate(trackingResult.submittedDate)}</Text>
              </View>
            </View>
          )}
        </View>
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  newComplaintButton: {
    backgroundColor: '#800000',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  newComplaintText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filtersScrollView: {
    paddingVertical: 8,
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  activeFilterButton: {
    backgroundColor: '#800000',
  },
  filterButtonText: {
    color: '#333',
    fontWeight: '500',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#FFF',
    fontWeight: '500',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: 20,
    borderRadius: 50,
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FFF',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  viewAllButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  viewAllText: {
    color: '#800000',
    fontWeight: '600',
  },
  complaintsList: {
    paddingBottom: 20,
  },
  complaintCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    padding: 16,
    marginBottom: 16,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  complaintId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  complaintInfo: {
    marginBottom: 12,
  },
  complaintType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  complaintDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  complaintDescription: {
    fontSize: 14,
    color: '#444',
  },
  complaintFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  commentsCount: {
    fontSize: 12,
    color: '#666',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  evidenceBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 10,
  },
  evidenceText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '500',
  },
  viewDetails: {
    color: '#800000',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerButton: {
    paddingVertical: 8,
  },
  footerButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    width: '90%',
    maxHeight: '85%',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#800000',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  modalScrollView: {
    padding: 16,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailHeaderText: {
    fontSize: 14,
    color: '#666',
  },
  detailHeaderValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 100,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  descriptionBox: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
  },
  evidenceSection: {
    marginTop: 12,
  },
  evidencePlaceholder: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  evidencePlaceholderText: {
    fontSize: 14,
    color: '#666',
  },
  timelineContainer: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#800000',
    marginTop: 4,
    marginRight: 12,
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    left: 7,
    top: 16,
    width: 2,
    height: '100%',
    backgroundColor: '#ddd',
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  timelineDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  timelineAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#800000',
    marginBottom: 4,
  },
  timelineText: {
    fontSize: 14,
    color: '#333',
  },
  noUpdatesText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  helpSection: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  helpButton: {
    backgroundColor: '#800000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  helpButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  trackingContainer: {
    padding: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  searchButton: {
    backgroundColor: '#800000',
    padding: 12,
    borderRadius: 8,
  },
  searchButtonDisabled: {
    backgroundColor: '#ccc',
  },
  searchButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  resultCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  evidenceImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  evidenceErrorContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  evidenceErrorText: {
    color: '#666',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#800000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});