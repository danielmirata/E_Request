import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { authAPI } from '../api/auth';
import ErrorBoundary from '../components/ErrorBoundary';
import LoadingScreen from '../components/LoadingScreen';
import { AuthProvider } from '../context/AuthContext';

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuthenticated = await authAPI.isAuthenticated();
      const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup';

      if (!isAuthenticated && !inAuthGroup) {
        // Redirect to the sign-in page if not authenticated
        router.replace('/login');
      } else if (isAuthenticated && inAuthGroup) {
        // Redirect to the home page if authenticated
        router.replace('/homepage');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.replace('/login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading your data..." />;
  }

  return (
    <AuthProvider>
      <ErrorBoundary>
        <Stack>
          <Stack.Screen name="index"
            options={{
              headerTitle: "Home"
            }}
          />
          <Stack.Screen name="login"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen name="signup"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen name="service"
            options={{
              headerTitle: "Service"
            }}
          />
          <Stack.Screen name="homepage"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen name="document"
            options={{
              headerTitle: "Document"
            }}
          />
          <Stack.Screen name="request"
            options={{
              headerTitle: "Request"
            }}
          />
          <Stack.Screen name="complain"
            options={{
              headerTitle: "Complain"
            }}
          />
          <Stack.Screen name="trackdocs"
            options={{
              headerTitle: "TrackDocs"
            }}
          />
          <Stack.Screen name="trackcomp"
            options={{
              headerTitle: "TrackComplain"
            }}
          />
          <Stack.Screen name="profile"
            options={{
              headerTitle: "Profile"
            }}
          />
          <Stack.Screen name="about"
            options={{
              headerTitle: "About Us"
            }}
          />
        </Stack>
      </ErrorBoundary>
    </AuthProvider>
  );
}
