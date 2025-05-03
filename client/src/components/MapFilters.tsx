import React, { useState } from 'react';
import { Box, TextField, Typography, Paper, ToggleButton, ToggleButtonGroup, FormControlLabel, Checkbox } from '@mui/material';
import { appTheme } from '../theme';

interface MapFiltersProps {
  onFilterChange: (filters: { 
    costRating: number; 
    keyword: string;
    size: string;
    hasInventory: boolean;
    openWeekends: boolean;
  }) => void;
}

const MapFilters: React.FC<MapFiltersProps> = ({ onFilterChange }) => {
  const [costRating, setCostRating] = useState<number>(3);
  const [keyword, setKeyword] = useState<string>('');
  const [size, setSize] = useState<string>('all');
  const [hasInventory, setHasInventory] = useState<boolean>(false);
  const [openWeekends, setOpenWeekends] = useState<boolean>(false);

  const handleCostRatingChange = (event: React.MouseEvent<HTMLElement>, newValue: number) => {
    if (newValue !== null) {
      setCostRating(newValue);
      onFilterChange({ costRating: newValue, keyword, size, hasInventory, openWeekends });
    }
  };

  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setKeyword(value);
    onFilterChange({ costRating, keyword: value, size, hasInventory, openWeekends });
  };

  const handleSizeChange = (event: React.MouseEvent<HTMLElement>, newValue: string) => {
    if (newValue !== null) {
      setSize(newValue);
      onFilterChange({ costRating, keyword, size: newValue, hasInventory, openWeekends });
    }
  };

  const handleInventoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setHasInventory(checked);
    onFilterChange({ costRating, keyword, size, hasInventory: checked, openWeekends });
  };

  const handleWeekendChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setOpenWeekends(checked);
    onFilterChange({ costRating, keyword, size, hasInventory, openWeekends: checked });
  };

  return (
    <Paper 
      elevation={0}
      sx={{
        mt: 1,
        p: 1,
        backgroundColor: '#3D3D3D',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              color="white" 
              variant="subtitle2" 
              sx={{ 
                mb: 0.5,
                fontWeight: 500,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              Maximum Cost
            </Typography>
            <ToggleButtonGroup
              value={costRating}
              exclusive
              onChange={handleCostRatingChange}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  px: 1.5,
                  py: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: '#3D3D3D',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#4D4D4D',
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }
              }}
            >
              <ToggleButton value={1}>$</ToggleButton>
              <ToggleButton value={2}>$$</ToggleButton>
              <ToggleButton value={3}>$$$</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography 
              color="white" 
              variant="subtitle2" 
              sx={{ 
                mb: 0.5,
                fontWeight: 500,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              Search Yards
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, city, or state"
              variant="outlined"
              value={keyword}
              onChange={handleKeywordChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#2D2D2D',
                  borderRadius: '4px',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                  '& input': {
                    color: 'white',
                  },
                  '& input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    opacity: 1,
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'white',
                  '&.Mui-focused': {
                    color: 'white',
                  }
                },
              }}
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              color="white" 
              variant="subtitle2" 
              sx={{ 
                mb: 0.5,
                fontWeight: 500,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              Yard Size
            </Typography>
            <ToggleButtonGroup
              value={size}
              exclusive
              onChange={handleSizeChange}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  px: 1.5,
                  py: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: '#3D3D3D',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#4D4D4D',
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }
              }}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="small">Small</ToggleButton>
              <ToggleButton value="medium">Med</ToggleButton>
              <ToggleButton value="large">Large</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography 
              color="white" 
              variant="subtitle2" 
              sx={{ 
                mb: 0.5,
                fontWeight: 500,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              Features
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={hasInventory}
                    onChange={handleInventoryChange}
                    sx={{
                      color: 'white',
                      '&.Mui-checked': {
                        color: 'white',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  />
                }
                label={
                  <Typography 
                    color="white" 
                    variant="body2"
                    sx={{ 
                      fontWeight: 500,
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}
                  >
                    Has Online Inventory
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={openWeekends}
                    onChange={handleWeekendChange}
                    sx={{
                      color: 'white',
                      '&.Mui-checked': {
                        color: 'white',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  />
                }
                label={
                  <Typography 
                    color="white" 
                    variant="body2"
                    sx={{ 
                      fontWeight: 500,
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}
                  >
                    Open Weekends
                  </Typography>
                }
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default MapFilters; 