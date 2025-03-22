import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, HelpCircle, MapPin, Mic, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define permission types
type PermissionType = 'geolocation' | 'microphone' | 'camera';

interface PermissionState {
  status: 'granted' | 'denied' | 'prompt' | 'unsupported';
  requested: boolean;
}

interface PermissionsManagerProps {
  onPermissionChange?: (type: PermissionType, status: PermissionState['status']) => void;
}

const PermissionsManager: React.FC<PermissionsManagerProps> = ({ 
  onPermissionChange 
}) => {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Record<PermissionType, PermissionState>>({
    geolocation: { status: 'prompt', requested: false },
    microphone: { status: 'prompt', requested: false },
    camera: { status: 'prompt', requested: false }
  });

  // Check if the browser supports the Permissions API
  const permissionsApiSupported = 'permissions' in navigator;

  // Check geolocation permission
  const checkGeolocationPermission = async () => {
    try {
      // Request geolocation to trigger the permission prompt
      navigator.geolocation.getCurrentPosition(
        () => {
          setPermissions(prev => ({
            ...prev,
            geolocation: { status: 'granted', requested: true }
          }));
          if (onPermissionChange) {
            onPermissionChange('geolocation', 'granted');
          }
        },
        (error) => {
          // Permission denied
          if (error.code === error.PERMISSION_DENIED) {
            setPermissions(prev => ({
              ...prev,
              geolocation: { status: 'denied', requested: true }
            }));
            if (onPermissionChange) {
              onPermissionChange('geolocation', 'denied');
            }
          }
        }
      );
    } catch (error) {
      console.error('Error checking geolocation permission:', error);
      setPermissions(prev => ({
        ...prev,
        geolocation: { status: 'unsupported', requested: true }
      }));
    }
  };

  // Check device permission using the Permissions API
  const checkDevicePermission = async (type: 'microphone' | 'camera') => {
    if (!permissionsApiSupported) {
      setPermissions(prev => ({
        ...prev,
        [type]: { status: 'unsupported', requested: true }
      }));
      return;
    }

    try {
      // Convert our permission type to the correct Permissions API name
      const permissionName = type === 'microphone' ? 'microphone' : 'camera';
      
      // Query the permission
      const { state } = await navigator.permissions.query({ name: permissionName as PermissionName });
      
      setPermissions(prev => ({
        ...prev,
        [type]: { status: state as PermissionState['status'], requested: true }
      }));
      
      if (onPermissionChange) {
        onPermissionChange(type, state as PermissionState['status']);
      }
    } catch (error) {
      console.error(`Error checking ${type} permission:`, error);
      
      // If an error occurs, try to detect permission using the media devices API
      try {
        const constraints = type === 'microphone' 
          ? { audio: true } 
          : { video: true };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // If we get here, permission is granted
        stream.getTracks().forEach(track => track.stop()); // Stop tracks after check
        
        setPermissions(prev => ({
          ...prev,
          [type]: { status: 'granted', requested: true }
        }));
        
        if (onPermissionChange) {
          onPermissionChange(type, 'granted');
        }
      } catch (mediaError) {
        // If there's an error with getUserMedia, permission is likely denied
        setPermissions(prev => ({
          ...prev,
          [type]: { status: 'denied', requested: true }
        }));
        
        if (onPermissionChange) {
          onPermissionChange(type, 'denied');
        }
      }
    }
  };

  // Request a permission
  const requestPermission = async (type: PermissionType) => {
    try {
      if (type === 'geolocation') {
        checkGeolocationPermission();
      } else if (type === 'microphone' || type === 'camera') {
        // For media permissions, we need to request access
        const constraints = type === 'microphone' 
          ? { audio: true, video: false } 
          : { audio: false, video: true };
        
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          
          // If we get here, permission is granted
          stream.getTracks().forEach(track => track.stop()); // Stop tracks after permission is granted
          
          setPermissions(prev => ({
            ...prev,
            [type]: { status: 'granted', requested: true }
          }));
          
          if (onPermissionChange) {
            onPermissionChange(type, 'granted');
          }
          
          toast({
            title: "Permission Granted",
            description: `Access to ${type} has been granted.`
          });
        } catch (error) {
          console.error(`Error requesting ${type} permission:`, error);
          
          setPermissions(prev => ({
            ...prev,
            [type]: { status: 'denied', requested: true }
          }));
          
          if (onPermissionChange) {
            onPermissionChange(type, 'denied');
          }
          
          toast({
            title: "Permission Denied",
            description: `${type} access was denied. Please enable it in your browser settings.`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
      toast({
        title: "Permission Error",
        description: `Could not request ${type} permission.`,
        variant: "destructive"
      });
    }
  };

  // Check permissions on component mount
  useEffect(() => {
    // Only check permissions if the browser supports the necessary APIs
    if (navigator.geolocation) {
      checkGeolocationPermission();
    } else {
      setPermissions(prev => ({
        ...prev,
        geolocation: { status: 'unsupported', requested: false }
      }));
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      checkDevicePermission('microphone');
      checkDevicePermission('camera');
    } else {
      setPermissions(prev => ({
        ...prev,
        microphone: { status: 'unsupported', requested: false },
        camera: { status: 'unsupported', requested: false }
      }));
    }
  }, []);

  // Get status badge component
  const getStatusBadge = (status: PermissionState['status']) => {
    switch (status) {
      case 'granted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Granted</Badge>;
      case 'denied':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><AlertTriangle className="w-3 h-3 mr-1" /> Denied</Badge>;
      case 'prompt':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><HelpCircle className="w-3 h-3 mr-1" /> Not Requested</Badge>;
      case 'unsupported':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Unsupported</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get description text based on permission status
  const getPermissionDescription = (type: PermissionType, status: PermissionState['status']) => {
    switch (status) {
      case 'granted':
        return `${type} access is enabled.`;
      case 'denied':
        return `${type} access is blocked. Please enable it in your browser settings.`;
      case 'prompt':
        return `App needs ${type} access for full functionality.`;
      case 'unsupported':
        return `Your browser doesn't support ${type} access.`;
      default:
        return `Unknown ${type} permission status.`;
    }
  };

  // Get icon for each permission type
  const getPermissionIcon = (type: PermissionType) => {
    switch (type) {
      case 'geolocation':
        return <MapPin className="h-8 w-8 text-muted-foreground" />;
      case 'microphone':
        return <Mic className="h-8 w-8 text-muted-foreground" />;
      case 'camera':
        return <Camera className="h-8 w-8 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>App Permissions</CardTitle>
        <CardDescription>
          Manage access to device features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Geolocation Permission */}
          <div className="flex items-start space-x-4 p-3 border rounded-lg">
            <div className="flex-shrink-0">
              {getPermissionIcon('geolocation')}
            </div>
            <div className="flex-grow space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Location</h3>
                {getStatusBadge(permissions.geolocation.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                {getPermissionDescription('geolocation', permissions.geolocation.status)}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => requestPermission('geolocation')}
                disabled={permissions.geolocation.status === 'granted' || permissions.geolocation.status === 'unsupported'}
              >
                {permissions.geolocation.requested ? 'Check Again' : 'Enable'}
              </Button>
            </div>
          </div>

          {/* Microphone Permission */}
          <div className="flex items-start space-x-4 p-3 border rounded-lg">
            <div className="flex-shrink-0">
              {getPermissionIcon('microphone')}
            </div>
            <div className="flex-grow space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Microphone</h3>
                {getStatusBadge(permissions.microphone.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                {getPermissionDescription('microphone', permissions.microphone.status)}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => requestPermission('microphone')}
                disabled={permissions.microphone.status === 'granted' || permissions.microphone.status === 'unsupported'}
              >
                {permissions.microphone.requested ? 'Check Again' : 'Enable'}
              </Button>
            </div>
          </div>

          {/* Camera Permission */}
          <div className="flex items-start space-x-4 p-3 border rounded-lg">
            <div className="flex-shrink-0">
              {getPermissionIcon('camera')}
            </div>
            <div className="flex-grow space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Camera</h3>
                {getStatusBadge(permissions.camera.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                {getPermissionDescription('camera', permissions.camera.status)}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => requestPermission('camera')}
                disabled={permissions.camera.status === 'granted' || permissions.camera.status === 'unsupported'}
              >
                {permissions.camera.requested ? 'Check Again' : 'Enable'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionsManager;