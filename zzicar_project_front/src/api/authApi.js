import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/auth';

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || error?.response?.data || fallbackMessage;
}

export async function login(data) {
  try {
    const response = await axios.post(`${BASE_URL}/login`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, '로그인에 실패했습니다.'));
  }
}

export async function signup(data) {
  try {
    const response = await axios.post(`${BASE_URL}/signup`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, '회원가입에 실패했습니다.'));
  }
}

export async function updateProfile(userId, data) {
  try {
    const response = await axios.patch(`${BASE_URL}/profile/${userId}`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, '회원정보 수정에 실패했습니다.'));
  }
}

export async function withdraw(data) {
  try {
    const response = await axios.post(`${BASE_URL}/withdraw`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, '회원탈퇴에 실패했습니다.'));
  }
}