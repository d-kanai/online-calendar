const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api/v1';

async function signIn(email, password = 'password') {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/signin`, {
      email,
      password
    });
    
    if (response.data.success) {
      return {
        token: response.data.data.token,
        user: response.data.data.user
      };
    }
    throw new Error('Sign in failed');
  } catch (error) {
    console.error('Sign in error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  signIn,
  API_BASE_URL
};