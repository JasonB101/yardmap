import axios, { AxiosError } from 'axios';

const API_URL = '/api';

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

export const getJunkyards = async () => {
  try {
    console.log('=== API GET JUNKYARDS ===');
    const response = await axios.get(`${API_URL}/junkyards`);
    console.log('API Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error fetching junkyards:', error);
    if (error instanceof AxiosError && error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};

export const getJunkyardById = async (id: string) => {
  try {
    console.log('=== API GET JUNKYARD BY ID ===');
    console.log('Junkyard ID:', id);
    const response = await axios.get(`${API_URL}/junkyards/${id}`);
    console.log('API Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error fetching junkyard:', error);
    if (error instanceof AxiosError && error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};

export const updateJunkyard = async (id: string, junkyardData: any) => {
  try {
    console.log('=== API UPDATE JUNKYARD ===');
    console.log('Junkyard ID:', id);
    console.log('Update data:', JSON.stringify(junkyardData, null, 2));
    
    const requestData = {
      ...junkyardData,
      costRating: junkyardData.costRating || '$', // Ensure costRating is included
    };
    
    const response = await axios.put(`${API_URL}/junkyards/${id}`, requestData);
    console.log('API Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error updating junkyard:', error);
    if (error instanceof AxiosError && error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};

export const deleteJunkyard = async (id: string) => {
  try {
    console.log('=== API DELETE JUNKYARD ===');
    console.log('Junkyard ID:', id);
    const response = await axios.delete(`${API_URL}/junkyards/${id}`);
    console.log('API Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error deleting junkyard:', error);
    if (error instanceof AxiosError && error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
}; 