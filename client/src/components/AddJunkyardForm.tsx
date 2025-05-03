import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  CircularProgress,
  Typography,
  Divider,
  FormControlLabel,
  Checkbox,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Radio,
  RadioGroup,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { IJunkyard } from '../types/junkyard';
import axios from 'axios';
import { convertTo24Hour, convertTo12Hour } from '../utils/timeUtils';

interface AddJunkyardFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (junkyard: Partial<IJunkyard>) => Promise<void>;
  initialData?: IJunkyard;
  isEditing?: boolean;
}

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const DAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

interface JunkyardFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  inventoryLink: string;
  priceListLink: string;
  estimatedSize: number;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  costRating: '1' | '2' | '3';
}

const AddJunkyardForm: React.FC<AddJunkyardFormProps> = ({ open, onClose, onSubmit, initialData, isEditing = false }) => {
  const [formData, setFormData] = useState<JunkyardFormData>({
    name: initialData?.name || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zipCode: initialData?.zipCode || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    website: initialData?.website || '',
    inventoryLink: initialData?.inventoryLink || '',
    priceListLink: initialData?.priceListLink || '',
    estimatedSize: initialData?.estimatedSize || 0,
    description: initialData?.description || '',
    location: initialData?.location || { lat: 0, lng: 0 },
    hours: initialData?.hours || {
      monday: '9:00-17:00',
      tuesday: '9:00-17:00',
      wednesday: '9:00-17:00',
      thursday: '9:00-17:00',
      friday: '9:00-17:00',
      saturday: '9:00-17:00',
      sunday: '9:00-17:00'
    },
    costRating: initialData?.costRating || '1'
  });
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [closedDays, setClosedDays] = useState<Record<string, boolean>>({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // If the number starts with 1 (like +1 or 1), remove it
    const normalizedDigits = digits.startsWith('1') ? digits.slice(1) : digits;
    
    // If we have more than 10 digits, take only the last 10
    if (normalizedDigits.length > 10) {
      return normalizedDigits.slice(-10);
    }
    
    return normalizedDigits;
  };

  const formatPhoneDisplay = (phone: string): string => {
    if (!phone) return '';
    const digits = formatPhoneNumber(phone);
    if (digits.length !== 10) return phone;
    
    // Format as (XXX) XXX-XXXX
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData((prev) => ({
        ...prev,
        [name]: formattedPhone,
      }));
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHoursChange = (day: string, startTime: Date | null, endTime: Date | null) => {
    if (startTime && endTime) {
      const formatTime = (date: Date) => {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      };
      
      setFormData((prev) => ({
        ...prev,
        hours: {
          ...prev.hours,
          [day]: `${formatTime(startTime)}-${formatTime(endTime)}`,
        },
      }));
    }
  };

  const handleClosedChange = (day: string, isClosed: boolean) => {
    setClosedDays((prev) => ({
      ...prev,
      [day]: isClosed,
    }));

    setFormData((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: isClosed ? 'Closed' : '8:00-17:00',
      },
    }));
  };

  const handleCopyHours = (sourceDay: string) => {
    const sourceHours = formData.hours[sourceDay as keyof typeof formData.hours];
    const newHours = { ...formData.hours };
    const newClosedDays = { ...closedDays };
    const isSourceClosed = sourceHours === 'Closed';

    DAYS.forEach((day) => {
      if (day !== sourceDay) {
        newHours[day as keyof typeof newHours] = sourceHours;
        newClosedDays[day] = isSourceClosed;
      }
    });

    setFormData((prev) => ({
      ...prev,
      hours: newHours,
    }));
    setClosedDays(newClosedDays);
  };

  const geocodeAddress = async () => {
    try {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? '/api/junkyards/geocode'
        : `${window.location.protocol}//${window.location.hostname}:5000/api/junkyards/geocode`;

      const response = await axios.post(apiUrl, {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode
      });
      const { lat, lng } = response.data;
      setFormData(prev => ({
        ...prev,
        location: { lat, lng }
      }));
      return { lat, lng };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to geocode address');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Geocode the address first
      const geocodeResponse = await geocodeAddress();

      if (!geocodeResponse) {
        setGeocodingError('Could not find location for this address');
        return;
      }

      const submitData = {
        ...formData,
        location: {
          lat: geocodeResponse.lat,
          lng: geocodeResponse.lng
        }
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error saving junkyard:', error);
      setGeocodingError('Failed to create junkyard. Please try again.');
    }
  };

  const parseAddress = (address: string) => {
    // Remove any extra whitespace
    const cleanAddress = address.trim().replace(/\s+/g, ' ');
    
    // Common patterns for US addresses
    const patterns = [
      // Pattern 1: Street, City, State ZIP
      /^(.+),\s*([^,]+),\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)$/i,
      // Pattern 2: Street, City, State
      /^(.+),\s*([^,]+),\s*([A-Z]{2})$/i,
      // Pattern 3: Street, City
      /^(.+),\s*([^,]+)$/i,
    ];

    for (const pattern of patterns) {
      const match = cleanAddress.match(pattern);
      if (match) {
        const [, street, city, state, zip] = match;
        return {
          address: street.trim(),
          city: city?.trim() || '',
          state: state?.trim().toUpperCase() || '',
          zipCode: zip?.trim() || '',
        };
      }
    }

    // If no pattern matches, return the full address
    return {
      address: cleanAddress,
      city: '',
      state: '',
      zipCode: '',
    };
  };

  const handleAddressPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault(); // Prevent the default paste behavior
    const pastedText = e.clipboardData.getData('text');
    const parsedAddress = parseAddress(pastedText);
    
    setFormData(prev => ({
      ...prev,
      address: parsedAddress.address,
      city: parsedAddress.city,
      state: parsedAddress.state,
      zipCode: parsedAddress.zipCode,
    }));
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

  const getTimeValue = (day: string, isStart: boolean) => {
    const hours = formData.hours[day as keyof typeof formData.hours];
    if (hours === 'Closed') return null;
    const time = isStart ? hours.split('-')[0] : hours.split('-')[1];
    // Ensure time has minutes
    const [hoursStr, minutesStr] = time.split(':');
    const formattedTime = `${hoursStr.padStart(2, '0')}:${(minutesStr || '00').padStart(2, '0')}`;
    return new Date(`2000-01-01T${formattedTime}:00`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogContent>
        <Grid container spacing={2}>
          {/* Left Column - Basic Info */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Business Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onPaste={handleAddressPaste}
                  required
                  helperText="Paste a full address to automatically fill in the fields below"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="ZIP"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Phone"
                  name="phone"
                  value={formatPhoneDisplay(formData.phone)}
                  onChange={handleChange}
                  required
                  helperText="Format: (XXX) XXX-XXXX"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Inventory Link"
                  name="inventoryLink"
                  value={formData.inventoryLink}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Price List Link"
                  name="priceListLink"
                  value={formData.priceListLink}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Estimated Size (vehicles)"
                  type="number"
                  value={formData.estimatedSize}
                  onChange={(e) => setFormData({ ...formData, estimatedSize: parseInt(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Cost Rating</Typography>
                  <RadioGroup
                    row
                    name="costRating"
                    value={formData.costRating}
                    onChange={(e) => setFormData({ ...formData, costRating: e.target.value as '1' | '2' | '3' })}
                  >
                    <FormControlLabel value="1" control={<Radio />} label="$" />
                    <FormControlLabel value="2" control={<Radio />} label="$$" />
                    <FormControlLabel value="3" control={<Radio />} label="$$$" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Right Column - Hours */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Business Hours</Typography>
                <Grid container spacing={1}>
                  {days.map((day) => (
                    <Grid item xs={12} key={day.key}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={!closedDays[day.key]}
                              onChange={(e) => handleClosedChange(day.key, !e.target.checked)}
                              size="small"
                            />
                          }
                          label={DAY_LABELS[day.key as keyof typeof DAY_LABELS]}
                          sx={{ m: 0, minWidth: '90px' }}
                        />
                        <Box sx={{ flex: 1 }} />
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <TimePicker
                            label="Open"
                            value={getTimeValue(day.key, true)}
                            onChange={(newValue) => handleHoursChange(day.key, newValue, getTimeValue(day.key, false))}
                            disabled={closedDays[day.key]}
                            sx={{ width: '110px' }}
                            slotProps={{ textField: { size: 'small' } }}
                          />
                        </LocalizationProvider>
                        <Typography sx={{ textAlign: 'center', width: '30px' }}>to</Typography>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <TimePicker
                            label="Close"
                            value={getTimeValue(day.key, false)}
                            onChange={(newValue) => handleHoursChange(day.key, getTimeValue(day.key, true), newValue)}
                            disabled={closedDays[day.key]}
                            sx={{ width: '110px' }}
                            slotProps={{ textField: { size: 'small' } }}
                          />
                        </LocalizationProvider>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {geocodingError && (
          <Typography color="error" sx={{ mt: 2 }}>
            {geocodingError}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained" 
          color="primary"
          disabled={isGeocoding}
        >
          {isGeocoding ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              Looking up address...
            </>
          ) : (
            isEditing ? 'Edit Yard' : 'Add Junkyard'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddJunkyardForm; 