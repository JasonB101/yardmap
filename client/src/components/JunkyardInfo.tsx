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
      p: 1, 
      pb: 0.5,
      minWidth:25, 
      maxWidth: 325, 
      backgroundColor: 'transparent',
      borderRadius: 0,
      position: 'relative',
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
        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
        fontSize: '1.25rem'
      }}>
        {junkyard.name}
      </Typography>

      <Box sx={{ mb: 1 }}>
        <Typography variant="body2" sx={{ 
          color: '#E0E0E0',
          lineHeight: 1.5,
          fontSize: '0.9rem'
        }}>
          {junkyard.address}
          <br />
          {junkyard.city}, {junkyard.state} {junkyard.zipCode}
        </Typography>
      </Box>

      <Box sx={{ mb: 1 }}>
        {junkyard.phone && (
          <Typography variant="body2" sx={{ 
            color: '#E0E0E0',
            fontSize: '0.9rem',
            '& strong': {
              color: '#B0B0B0',
              fontWeight: 500
            }
          }}>
            <strong>Phone:</strong> {formatPhone(junkyard.phone)}
          </Typography>
        )}
        {junkyard.email && (
          <Typography variant="body2" sx={{ 
            color: '#E0E0E0',
            fontSize: '0.9rem',
            '& strong': {
              color: '#B0B0B0',
              fontWeight: 500
            }
          }}>
            <strong>Email:</strong> {junkyard.email}
          </Typography>
        )}
      </Box>

      {junkyard.estimatedSize > 0 && (
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ 
            color: '#E0E0E0',
            fontSize: '0.9rem',
            '& strong': {
              color: '#B0B0B0',
              fontWeight: 500
            }
          }}>
            <strong>Estimated Size:</strong> {junkyard.estimatedSize.toLocaleString()} vehicles
          </Typography>
        </Box>
      )}

      {junkyard.costRating && (
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ 
              color: '#B0B0B0',
              fontWeight: 500,
              fontSize: '0.9rem'
            }}>Cost Rating:</Typography>
            <Typography variant="body2" sx={{ 
              color: '#E0E0E0',
              fontSize: '0.9rem'
            }}>
              {Array(parseInt(junkyard.costRating)).fill('$').join('')}
            </Typography>
          </Box>
        </Box>
      )}

      {junkyard.description && (
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ 
            color: '#E0E0E0',
            fontSize: '0.9rem',
            lineHeight: 1.5
          }}>
            {junkyard.description}
          </Typography>
        </Box>
      )}

      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ 
          fontWeight: 'bold', 
          mb: 0.5,
          color: '#B0B0B0',
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
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
              <Typography variant="body2" sx={{ 
                color: '#B0B0B0',
                fontSize: '0.85rem',
                fontWeight: 500
              }}>
                {group.days.length > 1 
                  ? `${group.days[0]} - ${group.days[group.days.length - 1]}`
                  : group.days[0]}:
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#E0E0E0',
                fontSize: '0.85rem'
              }}>
                {formatHours(group.hours)}
              </Typography>
            </React.Fragment>
          ))}
        </Box>
      </Box>

      <Box sx={{ 
        height: '1px', 
        backgroundColor: '#4A4A4A', 
        my: 1.5,
        width: '100%',
        opacity: 0
      }} />

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
          mt: 0.5
        }
      }}>
        {junkyard.inventoryLink && (
          <Button
            variant="contained"
            size="small"
            href={junkyard.inventoryLink}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              backgroundColor: '#FFFFFF',
              color: '#252525',
              '&:hover': {
                backgroundColor: '#F5F5F5'
              }
            }}
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
            sx={{
              borderColor: '#4A4A4A',
              color: '#E0E0E0',
              '&:hover': {
                borderColor: '#5A5A5A',
                backgroundColor: 'rgba(255,255,255,0.05)'
              }
            }}
          >
            View Price List
          </Button>
        )}
        {junkyard.website && (
          <Button
            variant="outlined"
            size="small"
            href={junkyard.website}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              borderColor: '#4A4A4A',
              color: '#E0E0E0',
              '&:hover': {
                borderColor: '#5A5A5A',
                backgroundColor: 'rgba(255,255,255,0.05)'
              }
            }}
          >
            Visit Website
          </Button>
        )}
        <Button
          variant="outlined"
          color="info"
          startIcon={<RouteIcon sx={{ color: '#1976d2' }} />}
          onClick={onCalculateDistance}
          size="small"
          sx={{ 
            width: '250px',
            borderColor: '#4A4A4A',
            color: '#E0E0E0',
            '&:hover': {
              borderColor: '#5A5A5A',
              backgroundColor: 'rgba(255,255,255,0.05)'
            }
          }}
        >
          Calculate Distance
        </Button>
        {distanceInfo && (
          <Box 
            sx={{ 
              p: 0.75, 
              pb: 0,
              bgcolor: '#2D2D2D', 
              borderRadius: 0,
              position: 'relative',
              mt: 0.5,
              width: '250px',
              alignSelf: 'center',
              mb: 0,
              '& .MuiBox-root': {
                mb: 0
              },
              '& > *': {
                mb: 0
              },
              '& > *:last-child': {
                mb: 0
              }
            }}
          >
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 0,
                color: '#E0E0E0',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                pr: 4,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              <RouteIcon fontSize="small" />
              Route Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, mb: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0 }}>
                <Typography variant="body2" sx={{ 
                  color: '#B0B0B0', 
                  minWidth: '80px', 
                  mb: 0,
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}>
                  Distance:
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontWeight: 'medium', 
                  color: '#E0E0E0', 
                  mb: 0,
                  fontSize: '0.85rem'
                }}>
                  {distanceInfo.distance}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0 }}>
                <Typography variant="body2" sx={{ 
                  color: '#B0B0B0', 
                  minWidth: '80px', 
                  mb: 0,
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}>
                  Duration:
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontWeight: 'medium', 
                  color: '#E0E0E0', 
                  mb: 0,
                  fontSize: '0.85rem'
                }}>
                  {distanceInfo.duration}
                </Typography>
              </Box>
            </Box>
            <Button
              className="close-button"
              onClick={() => {
                if (onClearRoute) {
                  onClearRoute();
                }
              }}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                minWidth: '32px',
                height: '32px',
                padding: 0,
                fontSize: '20px',
                color: '#B0B0B0',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.05)'
                }
              }}
            >
              ×
            </Button>
          </Box>
        )}
        <Box sx={{ 
          display: 'flex', 
          gap: 0.5, 
          justifyContent: 'center',
          width: '100%',
          mt: 0.5
        }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => setEditDialogOpen(true)}
            size="small"
            className="action-button"
            sx={{ 
              width: '120px', 
              py: 0.25,
              borderColor: '#4A4A4A',
              color: '#E0E0E0',
              '&:hover': {
                borderColor: '#5A5A5A',
                backgroundColor: 'rgba(255,255,255,0.05)'
              }
            }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon sx={{ color: '#d32f2f' }} />}
            onClick={() => setDeleteDialogOpen(true)}
            size="small"
            className="action-button"
            sx={{ 
              width: '120px', 
              py: 0.25,
              borderColor: '#4A4A4A',
              color: '#E0E0E0',
              '&:hover': {
                borderColor: '#5A5A5A',
                backgroundColor: 'rgba(255,255,255,0.05)'
              }
            }}
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