import axios, { AxiosError } from 'axios';

const API_URL = 'http://localhost:5000/api';

export const createJunkyard = async (junkyardData: any) => {
  try {
    console.log('=== API CREATE JUNKYARD ===');
    console.log('Input data:', JSON.stringify(junkyardData, null, 2));
    
    const requestData = {
      ...junkyardData,
      costRating: junkyardData.costRating || '$', // Ensure costRating is included
    };
    
    console.log('Request data being sent:', JSON.stringify(requestData, null, 2));
    
    const response = await axios.post(`${API_URL}/junkyards`, requestData);
    
    console.log('API Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error creating junkyard:', error);
    if (error instanceof AxiosError && error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
}; 