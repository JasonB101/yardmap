import axios, { AxiosError } from 'axios';
import { IJunkyard } from '../types/junkyard';

const API_URL = '/api';

export const createJunkyard = async (junkyardData: Partial<IJunkyard>): Promise<IJunkyard> => {
  try {
    const response = await axios.post<IJunkyard>(`${API_URL}/junkyards`, junkyardData);
    return response.data;
  } catch (error) {
    console.error('Error creating junkyard:', error);
    throw error;
  }
};

export const getJunkyards = async (): Promise<IJunkyard[]> => {
  try {
    const response = await axios.get<IJunkyard[]>(`${API_URL}/junkyards`);
    return response.data;
  } catch (error) {
    console.error('Error fetching junkyards:', error);
    throw error;
  }
};

export const getJunkyardById = async (id: string): Promise<IJunkyard> => {
  try {
    const response = await axios.get<IJunkyard>(`${API_URL}/junkyards/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching junkyard:', error);
    throw error;
  }
};

export const updateJunkyard = async (id: string, junkyardData: Partial<IJunkyard>): Promise<IJunkyard> => {
  try {
    const response = await axios.put<IJunkyard>(`${API_URL}/junkyards/${id}`, junkyardData);
    return response.data;
  } catch (error) {
    console.error('Error updating junkyard:', error);
    throw error;
  }
};

export const deleteJunkyard = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/junkyards/${id}`);
  } catch (error) {
    console.error('Error deleting junkyard:', error);
    throw error;
  }
}; 