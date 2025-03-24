import api from './api';

export const getAllPromoCodes = async () => {
  try {
    const response = await api.get('/promo-codes');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch promo codes.'
    };
  }
};

export const getPromoCodeById = async (id) => {
  try {
    const response = await api.get(`/promo-codes/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch promo code details.'
    };
  }
};

export const validatePromoCode = async (code, orderTotal) => {
  try {
    const response = await api.post('/promo-codes/validate', { code, orderTotal });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Invalid promo code.'
    };
  }
};

export const createPromoCode = async (promoCodeData) => {
  try {
    const response = await api.post('/promo-codes', promoCodeData);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create promo code.'
    };
  }
};

export const updatePromoCode = async (id, promoCodeData) => {
  try {
    const response = await api.put(`/promo-codes/${id}`, promoCodeData);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update promo code.'
    };
  }
};

export const deletePromoCode = async (id) => {
  try {
    await api.delete(`/promo-codes/${id}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete promo code.'
    };
  }
};

export const togglePromoCodeStatus = async (id, isActive) => {
  try {
    const response = await api.patch(`/promo-codes/${id}/status`, { isActive });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update promo code status.'
    };
  }
};
