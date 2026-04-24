import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/mypage';

export async function getMyPredictions(userId) {
  try {
    const response = await axios.get(`${BASE_URL}/${userId}/predictions`);
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || '분석 이력을 불러오지 못했습니다.'
    );
  }
}

