import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

interface Project {
  id: number;
  project_name: string;
  location: string;
  status: string;
  start_date: string;
  end_date: string;
  budget: number;
  funding_source: string;
  description: string;
  priority: string;
  notes: string;
  documents: any[];
}

const MapPage = () => {
  const webViewRef = useRef<WebView>(null);
  const params = useLocalSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  
  // Get coordinates from URL parameters or use default coordinates
  const lat = params.lat ? parseFloat(params.lat as string) : 9.280745008410356;
  const lng = params.lng ? parseFloat(params.lng as string) : 123.27235221862794;
  const zoom = params.zoom ? parseInt(params.zoom as string) : 17;

  // Fetch projects when component mounts
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(Array.isArray(data) ? data : data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // HTML content for the Leaflet map
  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
          }
          .project-popup {
            min-width: 300px;
          }
          .project-popup h5 {
            color: #0d6efd;
            margin-bottom: 15px;
            border-bottom: 2px solid #0d6efd;
            padding-bottom: 8px;
          }
          .project-status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            color: white;
            font-size: 0.9em;
            margin-bottom: 10px;
          }
          .status-completed { background-color: #198754; }
          .status-ongoing { background-color: #0d6efd; }
          .status-planning { background-color: #0dcaf0; }
          .status-onhold { background-color: #dc3545; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // Initialize the map with coordinates from URL parameters
          const map = L.map('map').setView([${lat}, ${lng}], ${zoom});

          // Add the OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // Add a marker at the initial location
          L.marker([${lat}, ${lng}])
            .addTo(map)
            .bindPopup('Current Location<br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}')
            .openPopup();

          // Function to create project marker
          function createProjectMarker(project) {
            const statusClass = {
              'Completed': 'status-completed',
              'Ongoing': 'status-ongoing',
              'Planning': 'status-planning',
              'On Hold': 'status-onhold'
            }[project.status] || '';

            const popupContent = \`
              <div class="project-popup">
                <h5>\${project.project_name}</h5>
                <div class="project-status \${statusClass}">\${project.status}</div>
                <p><strong>Location:</strong> \${project.location}</p>
                <p><strong>Timeline:</strong> \${formatDate(project.start_date)} - \${formatDate(project.end_date)}</p>
                <p><strong>Budget:</strong> ₱\${formatNumber(project.budget)}</p>
                <button onclick="viewProjectDetails(\${project.id})">View Details</button>
              </div>
            \`;

            const marker = L.marker([project.lat, project.lng])
              .addTo(map)
              .bindPopup(popupContent);

            return marker;
          }

          // Function to format dates
          function formatDate(dateString) {
            if (!dateString) return 'Not specified';
            return new Date(dateString).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          }

          // Function to format numbers
          function formatNumber(number) {
            if (!number) return '0.00';
            return new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(number);
          }

          // Function to handle project details view
          function viewProjectDetails(projectId) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'viewProject',
              projectId: projectId
            }));
          }

          // Add click event to get coordinates
          map.on('click', function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'coordinates',
              lat: lat,
              lng: lng
            }));

            L.marker([lat, lng])
              .addTo(map)
              .bindPopup('Lat: ' + lat.toFixed(6) + '<br>Lng: ' + lng.toFixed(6))
              .openPopup();
          });

          // Listen for messages from React Native
          window.addEventListener('message', function(event) {
            const data = JSON.parse(event.data);
            
            if (data.type === 'addProjects') {
              data.projects.forEach(project => {
                createProjectMarker(project);
              });
            }
          });
        </script>
      </body>
    </html>
  `;

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'coordinates') {
      console.log('Coordinates:', data.lat, data.lng);
    } else if (data.type === 'viewProject') {
      const project = projects.find(p => p.id === data.projectId);
      if (project) {
        setSelectedProject(project);
        setShowProjectModal(true);
      }
    }
  };

  // Send projects to WebView when they're loaded
  useEffect(() => {
    if (webViewRef.current && projects.length > 0) {
      webViewRef.current.injectJavaScript(`
        window.postMessage(${JSON.stringify({
          type: 'addProjects',
          projects: projects
        })}, '*');
      `);
    }
  }, [projects]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Barangay Map',
          headerStyle: {
            backgroundColor: '#800000',
          },
          headerTintColor: '#fff',
        }} 
      />
      <View style={styles.content}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          style={styles.map}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      </View>

      <Modal
        visible={showProjectModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProjectModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              {selectedProject && (
                <>
                  <Text style={styles.modalTitle}>{selectedProject.project_name}</Text>
                  <Text style={styles.statusText}>Status: {selectedProject.status}</Text>
                  <Text style={styles.sectionTitle}>Location</Text>
                  <Text style={styles.sectionContent}>{selectedProject.location}</Text>
                  <Text style={styles.sectionTitle}>Timeline</Text>
                  <Text style={styles.sectionContent}>
                    {new Date(selectedProject.start_date).toLocaleDateString()} - {new Date(selectedProject.end_date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.sectionTitle}>Budget</Text>
                  <Text style={styles.sectionContent}>₱{selectedProject.budget.toLocaleString()}</Text>
                  <Text style={styles.sectionTitle}>Funding Source</Text>
                  <Text style={styles.sectionContent}>{selectedProject.funding_source}</Text>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.sectionContent}>{selectedProject.description}</Text>
                  <Text style={styles.sectionTitle}>Priority</Text>
                  <Text style={styles.sectionContent}>{selectedProject.priority}</Text>
                  <Text style={styles.sectionTitle}>Notes</Text>
                  <Text style={styles.sectionContent}>{selectedProject.notes}</Text>
                </>
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowProjectModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0d6efd',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#333',
  },
  sectionContent: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#0d6efd',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MapPage; 