import api from './api';

export const getAllDishes = async () => {
  try {
    const response = await api.get('/dishes');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch dishes.'
    };
  }
};

export const getDishById = async (id) => {
  try {
    const response = await api.get(`/dishes/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch dish details.'
    };
  }
};

export const getDishByCategory = async (category) => {
  try {
    const response = await api.get(`/dishes/category/${category}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch dishes by category.'
    };
  }
};

export const createDish = async (dishData, imageUri) => {
  try {
    const formData = new FormData();

    // Add dish data as JSON string
    formData.append('dish', JSON.stringify(dishData));

    // Add image if provided
    if (imageUri) {
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      });
    }

    const response = await api.post('/dishes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create dish.'
    };
  }
};

export const updateDish = async (id, dishData, imageUri) => {
  try {
    const formData = new FormData();

    // Add dish data as JSON string
    formData.append('dish', JSON.stringify(dishData));

    // Add image if provided
    if (imageUri) {
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      });
    }

    const response = await api.put(`/dishes/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update dish.'
    };
  }
};

export const deleteDish = async (id) => {
  try {
    await api.delete(`/dishes/${id}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete dish.'
    };
  }
};

export const updateDishAvailability = async (id, isAvailable) => {
  try {
    const response = await api.patch(`/dishes/${id}/availability`, { isAvailable });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update dish availability.'
    };
  }
};

export const getCategories = async () => {
  try {
    const response = await api.get('/dishes/categories');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch categories.'
    };
  }
};
