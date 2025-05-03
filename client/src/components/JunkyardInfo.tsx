import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Route as RouteIcon, AttachMoney as AttachMoneyIcon } from '@mui/icons-material';
import axios from 'axios';
import { IJunkyard } from '../types/junkyard';
import AddJunkyardForm from './AddJunkyardForm';

interface JunkyardInfoProps {
  junkyard: IJunkyard;
  onClose: () => void;
  onDelete?: () => void;
  onUpdate?: (updatedJunkyard: IJunkyard) => void;
  onCalculateDistance?: () => void;
  distanceInfo?: {
    distance: string;
    duration: string;
  } | null;
  onClearRoute?: () => void;
}

const JunkyardInfo: React.FC<JunkyardInfoProps> = ({ 
  junkyard, 
  onClose, 
  onDelete, 
  onUpdate, 
  onCalculateDistance,
  distanceInfo,
  onClearRoute
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      onDelete?.();
      onClose();
    } catch (error) {
      console.error('Error deleting junkyard:', error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleUpdate = async (updatedJunkyard: Partial<IJunkyard>) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/junkyards/${junkyard._id}`, updatedJunkyard);
      onUpdate?.(response.data);
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating junkyard:', error);
    }
  };

  const formatTime = (time: string) => {
    if (!time || time === 'Closed') return 'Closed';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatHours = (hours: string) => {
    if (!hours || hours === 'Closed') return 'Closed';
    const [open, close] = hours.split('-');
    return `${formatTime(open)} - ${formatTime(close)}`;
  };

  const days = [
    { name: 'Monday', key: 'monday' },
    { name: 'Tuesday', key: 'tuesday' },
    { name: 'Wednesday', key: 'wednesday' },
    { name: 'Thursday', key: 'thursday' },
    { name: 'Friday', key: 'friday' },
    { name: 'Saturday', key: 'saturday' },
    { name: 'Sunday', key: 'sunday' }
  ];

  const getGroupedHours = () => {
    const grouped: { days: string[], hours: string }[] = [];
    let currentGroup: string[] = [];
    let currentHours = '';

    days.forEach((day, index) => {
      const hours = junkyard.hours[day.key as keyof typeof junkyard.hours];
      if (hours === currentHours) {
        currentGroup.push(day.name);
      } else {
        if (currentGroup.length > 0) {
          grouped.push({ days: [...currentGroup], hours: currentHours });
        }
        currentGroup = [day.name];
        currentHours = hours;
      }
    });

    if (currentGroup.length > 0) {
      grouped.push({ days: [...currentGroup], hours: currentHours });
    }

    return grouped;
  };

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  return (
    <Box sx={{ 
      p: 2, 
      pb: 1,
      minWidth:25, 
      maxWidth: 325, 
      backgroundColor: '#3D3D3D',
      borderRadius: 1,
      '& > *': {
        border: 'none',
        mb: 1
      },
      '& .MuiBox-root': {
        border: 'none',
        mb: 1
      },
      '& .MuiTypography-root': {
        border: 'none'
      }
    }}>
      <Typography variant="h6" component="h2" sx={{ 
        mb: 1, 
        fontWeight: 'bold',
        color: 'white',
        textShadow: '0 1px 2px rgba(0,0,0,0.2)'
      }}>
        {junkyard.name}
      </Typography>

      <Box sx={{ mb: 1 }}>
        <Typography variant="body2" sx={{ color: 'white' }}>
          {junkyard.address}
          <br />
          {junkyard.city}, {junkyard.state} {junkyard.zipCode}
        </Typography>
      </Box>

      <Box sx={{ mb: 1 }}>
        {junkyard.phone && (
          <Typography variant="body2" sx={{ color: 'white' }}>
            <strong>Phone:</strong> {formatPhone(junkyard.phone)}
          </Typography>
        )}
        {junkyard.email && (
          <Typography variant="body2" sx={{ color: 'white' }}>
            <strong>Email:</strong> {junkyard.email}
          </Typography>
        )}
      </Box>

      {junkyard.estimatedSize > 0 && (
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ color: 'white' }}>
            <strong>Estimated Size:</strong> {junkyard.estimatedSize.toLocaleString()} vehicles
          </Typography>
        </Box>
      )}

      {junkyard.costRating && (
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'white' }}>Cost Rating:</Typography>
            <Typography variant="body2" sx={{ color: 'white' }}>
              {Array(parseInt(junkyard.costRating)).fill('$').join('')}
            </Typography>
          </Box>
        </Box>
      )}

      {junkyard.description && (
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ color: 'white' }}>
            {junkyard.description}
          </Typography>
        </Box>
      )}

      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ 
          fontWeight: 'bold', 
          mb: 0.5,
          color: 'white',
          textShadow: '0 1px 2px rgba(0,0,0,0.2)'
        }}>
          Business Hours
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: 0.5,
          fontSize: '0.875rem'
        }}>
          {getGroupedHours().map((group, index) => (
            <React.Fragment key={index}>
              <Typography variant="body2" sx={{ color: 'white' }}>
                {group.days.length > 1 
                  ? `${group.days[0]} - ${group.days[group.days.length - 1]}`
                  : group.days[0]}:
              </Typography>
              <Typography variant="body2" sx={{ color: 'white' }}>
                {formatHours(group.hours)}
              </Typography>
            </React.Fragment>
          ))}
        </Box>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1,
        '& .MuiButton-root': {
          minWidth: 'auto',
          width: 'fit-content',
          alignSelf: 'center',
          px: 2
        },
        '& .MuiButton-root:not(.action-button):not(.close-button)': {
          width: '250px'
        },
        '& .action-button': {
          mt: 2
        }
      }}>
        {junkyard.website && (
          <Button
            variant="contained"
            size="small"
            href={junkyard.website}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit Website
          </Button>
        )}
        {junkyard.inventoryLink && (
          <Button
            variant="outlined"
            size="small"
            href={junkyard.inventoryLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Inventory
          </Button>
        )}
        {junkyard.priceListLink && (
          <Button
            variant="outlined"
            size="small"
            href={junkyard.priceListLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Price List
          </Button>
        )}
        <Button
          variant="outlined"
          color="info"
          startIcon={<RouteIcon />}
          onClick={onCalculateDistance}
          size="small"
          sx={{ width: '250px' }}
        >
          Calculate Distance
        </Button>
        {distanceInfo && (
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'background.paper', 
              borderRadius: 1,
              position: 'relative',
              mt: 1,
              width: '250px',
              alignSelf: 'center'
            }}
          >
            <Button
              className="close-button"
              onClick={() => {
                if (onClearRoute) {
                  onClearRoute();
                }
              }}
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                minWidth: '32px',
                height: '32px',
                padding: 0,
                fontSize: '20px',
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              ×
            </Button>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 1,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                pr: 4
              }}
            >
              <RouteIcon fontSize="small" />
              Route Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: '80px' }}>
                  Distance:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {distanceInfo.distance}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: '80px' }}>
                  Duration:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {distanceInfo.duration}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          mt: 0.5,
          justifyContent: 'center',
          width: '100%'
        }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => setEditDialogOpen(true)}
            size="small"
            className="action-button"
            sx={{ width: '120px', py: 0.5 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
            size="small"
            className="action-button"
            sx={{ width: '120px', py: 0.5 }}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Junkyard</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {junkyard.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Junkyard</DialogTitle>
        <DialogContent>
          <AddJunkyardForm 
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            initialData={junkyard}
            onSubmit={handleUpdate}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default JunkyardInfo; 