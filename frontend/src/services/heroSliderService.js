import api from './api';

export const heroSliderService = {
  // Get all hero slides (public)
  getHeroSlides: async () => {
    try {
      const response = await api.get('/settings/hero-slides');
      return response.data;
    } catch (error) {
      console.error('Error fetching hero slides:', error);
      throw error;
    }
  },

  // Admin functions
  addHeroSlide: async (slideData) => {
    try {
      const response = await api.post('/settings/hero-slides', slideData);
      return response.data;
    } catch (error) {
      console.error('Error adding hero slide:', error);
      throw error;
    }
  },

  updateHeroSlide: async (slideId, slideData) => {
    try {
      const response = await api.put(`/settings/hero-slides/${slideId}`, slideData);
      return response.data;
    } catch (error) {
      console.error('Error updating hero slide:', error);
      throw error;
    }
  },

  deleteHeroSlide: async (slideId) => {
    try {
      const response = await api.delete(`/settings/hero-slides/${slideId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting hero slide:', error);
      throw error;
    }
  },

  updateHeroSliderSettings: async (settings) => {
    try {
      const response = await api.put('/settings/hero-slider', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating hero slider settings:', error);
      throw error;
    }
  }
};

export default heroSliderService;
