import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';
import { getMyPredictions } from '../api/userApi';
import { updateProfile, withdraw } from '../api/authApi';

function formatDate(value) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatNumber(value) {
  if (value === null || value === undefined) return '-';
  return Number(value).toLocaleString();
}

function MyPage({ user }) {
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
    });
  }, [user]);

  useEffect(() => {
    async function fetchHistory() {
      if (!user?.userId) return;

      try {
        setLoadingHistory(true);
        const result = await getMyPredictions(user.userId);
        setHistory(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error(error);
        alert(error.message || '분석 이력을 불러오지 못했습니다.');
      } finally {
        setLoadingHistory(false);
      }
    }

    fetchHistory();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    try {
      const updatedUser = await updateProfile(user.userId, profileForm);
      localStorage.setItem('loginUser', JSON.stringify(updatedUser));
      alert('회원정보가 수정되었습니다.');
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert(error.message || '회원정보 수정 중 오류가 발생했습니다.');
    }
  };

  const handleWithdraw = async () => {
    const password = prompt('회원탈퇴를 위해 비밀번호를 입력해주세요.');
    if (!password) return;

    try {
      await withdraw({
        email: user.email,
        password,
      });

      localStorage.removeItem('loginUser');
      localStorage.removeItem('accessToken');
      alert('회원탈퇴가 완료되었습니다.');
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert(error.message || '회원탈퇴 중 오류가 발생했습니다.');
    }
  };

  const historyCount = useMemo(() => history.length, [history]);

  return (
    <div className="mypage-wrap">
      <section className="mypage-hero">
        <div>
          <p className="mypage-hero-label">MY PAGE</p>
          <h2>{user?.name || '사용자'}님의 분석 공간</h2>
          <p>회원 정보 수정, 탈퇴, 분석 이력 확인을 한 번에 관리할 수 있습니다.</p>
        </div>

        <button className="mypage-home-btn" onClick={() => navigate('/')}>
          홈으로 가기
        </button>
      </section>

      <section className="mypage-top-grid">
        <div className="mypage-card">
          <div className="section-title-wrap">
            <h3>회원 정보</h3>
            <p>이름과 이메일을 수정할 수 있습니다.</p>
          </div>

          <form className="profile-form" onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label>이름</label>
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>이메일</label>
              <input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleChange}
              />
            </div>

            <div className="profile-action-row">
              <button type="submit" className="profile-save-btn">
                저장하기
              </button>

              <button
                type="button"
                className="withdraw-btn"
                onClick={handleWithdraw}
              >
                회원탈퇴
              </button>
            </div>
          </form>

          <p className="profile-note">탈퇴 시 계정은 비활성화 처리됩니다.</p>
        </div>

        <div className="mypage-summary-stack">
          <div className="summary-card">
            <span className="summary-label">총 분석 이력</span>
            <strong>{historyCount}건</strong>
          </div>

          <div className="summary-card">
            <span className="summary-label">계정 이메일</span>
            <strong>{user?.email}</strong>
          </div>
        </div>
      </section>

      <section className="mypage-card history-card">
        <div className="history-header">
          <div>
            <h3>분석 이력</h3>
            <p>지금까지 저장된 내 차량 분석 결과입니다.</p>
          </div>
          <span className="history-count">{historyCount}건</span>
        </div>

        {loadingHistory ? (
          <div className="empty-history">
            <h4>불러오는 중...</h4>
            <p>분석 이력을 가져오고 있습니다.</p>
          </div>
        ) : history.length === 0 ? (
          <div className="empty-history">
            <h4>아직 분석 이력이 없습니다.</h4>
            <p>차량 이미지를 업로드하고 첫 분석을 시작해보세요.</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item, index) => (
              <div className="history-item report-card" key={item.requestId ?? index}>
                <div
                  className={`report-card-accent ${index % 2 === 0 ? 'mint' : 'purple'}`}
                />

                <div className="report-card-body">
                  <h4 className="report-owner">
                    {user?.name || '사용자'} 님의 리포트
                  </h4>

                  <p className="report-vehicle-line">
                    {item.brandNameSnapshot} {item.modelNameSnapshot}
                    {' | '}
                    {item.modelYear}년식
                    {' | '}
                    {formatNumber(item.mileage)}km
                  </p>

                  <p className="report-price-line">
                    최종 예상가: {formatNumber(item.predictedPrice)}원
                    {' | '}
                    {formatDate(item.createdAt)}
                  </p>

                  <button
                    type="button"
                    className="report-detail-btn"
                    onClick={() => navigate(`/result/${item.requestId}`)}
                  >
                    리포트 확인 →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default MyPage;