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
import { documentsAPI } from '../api/documents';

interface Document {
  id: string;
  documentType: string;
  submittedDate: string;
  status: string;
  description: string;
  relatedTo: string;
  fileSize: string;
  fileType: string;
  location?: string;
  lastUpdate?: string;
  estimatedCompletion?: string;
  idPhoto?: string;
  comments: Array<{
    date: string;
    text: string;
    author: string;
  }>;
}

interface DocumentResponse {
  request_id: string;
  document_type: string;
  created_at: string;
  status: string;
  purpose: string;
  remarks: string | null;
  updated_at: string;
}

// Mock data for demonstration
const MOCK_DOCUMENTS = [
  {
    id: 'DOC-2025-0073',
    documentType: 'Property Deed',
    submittedDate: '2025-05-01T09:45:00Z',
    status: 'Verified',
    description: 'Property deed for Lot 42, Block 7 in Sunshine Village.',
    relatedTo: 'Property Registration',
    fileSize: '2.4 MB',
    fileType: 'PDF',
    comments: [
      { date: '2025-05-01T10:30:00Z', text: 'Document received and queued for verification.', author: 'Admin' },
      { date: '2025-05-02T14:15:00Z', text: 'Document verified. Digital copy added to property records.', author: 'Officer Garcia' }
    ]
  },
  {
    id: 'DOC-2025-0089',
    documentType: 'Building Permit',
    submittedDate: '2025-04-25T11:20:00Z',
    status: 'Under Review',
    description: 'Application for home renovation permit including kitchen and bathroom remodeling.',
    relatedTo: 'Construction Permits',
    fileSize: '5.7 MB',
    fileType: 'PDF',
    comments: [
      { date: '2025-04-25T13:00:00Z', text: 'Document received and assigned to Engineering Department.', author: 'Admin' },
      { date: '2025-04-27T09:30:00Z', text: 'Initial assessment completed. Additional review required for electrical work.', author: 'Engineer Patel' },
      { date: '2025-05-03T15:45:00Z', text: 'Electrical plans under review by specialist.', author: 'Engineer Rodriguez' }
    ]
  },
  {
    id: 'DOC-2025-0112',
    documentType: 'Business License',
    submittedDate: '2025-04-18T10:00:00Z',
    status: 'Approved',
    description: 'Annual renewal for business license for Sunshine Café on Main Street.',
    relatedTo: 'Business Licensing',
    fileSize: '1.8 MB',
    fileType: 'PDF',
    comments: [
      { date: '2025-04-18T11:30:00Z', text: 'Renewal application received and processed.', author: 'Admin' },
      { date: '2025-04-19T14:20:00Z', text: 'All requirements verified. Renewal approved.', author: 'Officer Chen' },
      { date: '2025-04-20T09:15:00Z', text: 'License certificate generated and available for download.', author: 'Admin' }
    ]
  },
  {
    id: 'DOC-2025-0137',
    documentType: 'Zoning Approval',
    submittedDate: '2025-05-06T16:30:00Z',
    status: 'Submitted',
    description: 'Request for zoning approval for change of property use from residential to mixed use.',
    relatedTo: 'Zoning and Planning',
    fileSize: '8.2 MB',
    fileType: 'ZIP',
    comments: []
  }
];

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pending':
      return '#FFA500';
    case 'approved':
      return '#4CAF50';
    case 'rejected':
      return '#F44336';
    case 'processing':
      return '#2196F3';
    default:
      return '#757575';
  }
};

const Navigation = () => {
  return (
    <View style={styles.navigationContainer}>
      <Link href="/service" asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonText}>Services</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/" asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonText}>Home</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default function DocumentsTrackingPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await documentsAPI.getMyRequests();

      if (response.status === 'success') {
        const formattedDocuments: Document[] = response.data.map((doc: any) => ({
          id: doc.request_id,
          documentType: doc.document_type,
          submittedDate: doc.created_at,
          status: doc.status,
          description: doc.purpose,
          relatedTo: doc.document_type,
          fileSize: 'N/A',
          fileType: 'Document',
          idPhoto: doc.id_photo ? `${API_CONFIG.BASE_URL}/uploads/${doc.id_photo}` : undefined,
          comments: doc.remarks ? [{
            date: doc.updated_at,
            text: doc.remarks,
            author: 'Admin'
          }] : []
        }));

        setDocuments(formattedDocuments);
        setFilteredDocuments(formattedDocuments);
      }
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      if (error.message === 'Not authenticated') {
        Alert.alert(
          'Authentication Error',
          'Please log in again to continue.',
          [{ text: 'OK', onPress: () => router.push('/login') }]
        );
      } else {
        Alert.alert('Error', 'Failed to fetch documents');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDocuments();
    setRefreshing(false);
  };

  const handleFilter = (filterType: string) => {
    setActiveFilter(filterType);

    if (filterType === 'All') {
      setFilteredDocuments(documents);
    } else {
      const filtered = documents.filter(document => document.status === filterType);
      setFilteredDocuments(filtered);
    }
  };

  const viewDocumentDetails = (document: Document) => {
    setSelectedDocument(document);
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

  const renderDocumentItem = ({ item }: { item: Document }) => (
    <TouchableOpacity
      style={styles.documentCard}
      onPress={() => viewDocumentDetails(item)}
    >
      <View style={styles.documentHeader}>
        <Text style={styles.documentId}>{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.documentInfo}>
        <Text style={styles.documentType}>{item.documentType}</Text>
        <Text style={styles.documentDate}>Submitted: {formatDate(item.submittedDate)}</Text>
        <Text
          style={styles.documentDescription}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      </View>

      <View style={styles.documentFooter}>
        <View style={styles.fileInfoContainer}>
          <Text style={styles.fileInfo}>{item.fileType} · {item.fileSize}</Text>
        </View>
        <View style={styles.footerRight}>
          <Text style={styles.commentsCount}>
            {item.comments.length} {item.comments.length === 1 ? 'update' : 'updates'}
          </Text>
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

  const DocumentDetailModal = () => {
    if (!selectedDocument) return null;

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
              <Text style={styles.modalTitle}>Document Details</Text>
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
                  <Text style={styles.detailHeaderValue}>{selectedDocument.id}</Text>
                </View>

                <View style={[styles.statusRow, { backgroundColor: getStatusColor(selectedDocument.status) + '20' }]}>
                  <Text style={styles.statusLabel}>Current Status:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedDocument.status) }]}>
                    <Text style={styles.statusText}>{selectedDocument.status}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Document Information</Text>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type:</Text>
                  <Text style={styles.detailValue}>{selectedDocument.documentType}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date Submitted:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedDocument.submittedDate)}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Related To:</Text>
                  <Text style={styles.detailValue}>{selectedDocument.relatedTo}</Text>
                </View>

                <View style={styles.descriptionBox}>
                  <Text style={styles.detailLabel}>Description:</Text>
                  <Text style={styles.descriptionText}>{selectedDocument.description}</Text>
                </View>

                {selectedDocument.idPhoto && (
                  <View style={styles.idPhotoSection}>
                    <Text style={styles.detailLabel}>ID Photo:</Text>
                    <Image
                      source={{ uri: selectedDocument.idPhoto }}
                      style={styles.idPhoto}
                      resizeMode="cover"
                    />
                  </View>
                )}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Processing History</Text>

                {selectedDocument.comments.length > 0 ? (
                  <View style={styles.timelineContainer}>
                    {selectedDocument.comments.map((comment, index) => (
                      <View key={index} style={styles.timelineItem}>
                        <View style={styles.timelineDot} />
                        {index < selectedDocument.comments.length - 1 && (
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
                  <Text style={styles.noUpdatesText}>No processing updates yet. Your document has been received and will be processed shortly.</Text>
                )}
              </View>

              <View style={styles.helpSection}>
                <Text style={styles.helpText}>Need assistance with this document?</Text>
                <TouchableOpacity
                  style={styles.helpButton}
                  onPress={() => {
                    setDetailModalVisible(false);
                    Alert.alert('Contact Support', 'This would connect you to the document processing team.');
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

  const handleTrackDocument = async () => {
    if (!trackingNumber.trim()) {
      Alert.alert('Error', 'Please enter a tracking number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost/Cantil-E/php/track_document.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request_id: trackingNumber }),
      });

      const data = await response.json();

      if (data.success) {
        const formattedDocument: Document = {
          id: data.request.request_id,
          documentType: data.request.document_type,
          submittedDate: data.request.created_at,
          status: data.request.status,
          description: data.request.purpose,
          relatedTo: data.request.document_type,
          fileSize: 'N/A',
          fileType: 'Document',
          idPhoto: data.request.id_photo ? `${API_CONFIG.BASE_URL}/uploads/${data.request.id_photo}` : undefined,
          comments: data.request.remarks ? [{
            date: data.request.updated_at,
            text: data.request.remarks,
            author: 'Admin'
          }] : []
        };
        setTrackingResult(formattedDocument);
      } else {
        Alert.alert('Not Found', data.message || 'Document not found');
      }
    } catch (error) {
      console.error('Error tracking document:', error);
      Alert.alert('Error', 'Failed to track document');
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
            <Text style={styles.pageTitle}>My Documents</Text>
          </View>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollView}
          >
            {renderFilterButton('All')}
            {renderFilterButton('Submitted')}
            {renderFilterButton('Under Review')}
            {renderFilterButton('Needs Revision')}
            {renderFilterButton('In Progress')}
            {renderFilterButton('Verified')}
            {renderFilterButton('Approved')}
            {renderFilterButton('Rejected')}
          </ScrollView>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loadingText}>Loading your documents...</Text>
          </View>
        ) : (
          <>
            {filteredDocuments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Text style={styles.emptyIcon}>📄</Text>
                </View>
                <Text style={styles.emptyTitle}>No documents found</Text>
                <Text style={styles.emptyText}>
                  {activeFilter === 'All'
                    ? "You haven't uploaded any documents yet."
                    : `You don't have any documents with '${activeFilter}' status.`}
                </Text>
                {activeFilter !== 'All' && (
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => handleFilter('All')}
                  >
                    <Text style={styles.viewAllText}>View All Documents</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <FlatList
                data={filteredDocuments}
                renderItem={renderDocumentItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.documentsList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#2E7D32']}
                  />
                }
              />
            )}
          </>
        )}

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
              onPress={handleTrackDocument}
              disabled={loading}
            >
              <Text style={styles.searchButtonText}>
                {loading ? 'Searching...' : 'Track Document'}
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
                <Text style={styles.resultText}>{trackingResult.documentType}</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Related To:</Text>
                <Text style={styles.resultText}>{trackingResult.relatedTo}</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Last Update:</Text>
                <Text style={styles.resultText}>{formatDate(trackingResult.submittedDate)}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Link href="/service" asChild>
            <TouchableOpacity style={styles.footerButton}>
              <Text style={styles.footerButtonText}>Return to Dashboard</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <DocumentDetailModal />
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
    backgroundColor: '#2E7D32',
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
    color: '#2E7D32',
    fontWeight: '600',
  },
  documentsList: {
    paddingBottom: 20,
  },
  documentCard: {
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
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentId: {
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
  documentInfo: {
    marginBottom: 12,
  },
  documentType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  documentDescription: {
    fontSize: 14,
    color: '#444',
  },
  documentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  fileInfoContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  fileInfo: {
    fontSize: 12,
    color: '#666',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentsCount: {
    fontSize: 12,
    color: '#666',
    marginRight: 10,
  },
  viewDetails: {
    color: '#2E7D32',
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
    color: '#2E7D32',
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
    backgroundColor: '#2E7D32',
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
    color: '#2E7D32',
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
    marginTop: 20,
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  helpButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  helpButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  trackingContainer: {
    marginTop: 20,
  },
  searchBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 20,
  },
  searchLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  searchButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    marginTop: 20,
  },
  navButton: {
    backgroundColor: '#800000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    minWidth: 120,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  idPhotoSection: {
    marginTop: 16,
  },
  idPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  resultCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#800000',
    marginBottom: 15,
    textAlign: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  resultText: {
    fontSize: 16,
    color: '#333',
  },
  searchButtonDisabled: {
    backgroundColor: '#cccccc',
  },
});