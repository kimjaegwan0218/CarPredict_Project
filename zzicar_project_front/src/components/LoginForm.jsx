import React, { useState } from 'react';
import { login } from '../api/authApi';

function LoginForm({ onLoginSuccess, onMoveSignup, onBack }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const result = await login(form);

      // 예시: result = { userId, name, email, token }
      localStorage.setItem('loginUser', JSON.stringify(result));
      if (result.token) {
        localStorage.setItem('accessToken', result.token);
      }

      alert('로그인 성공!');
      onLoginSuccess(result);
    } catch (error) {
      console.error(error);
      alert(error.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>로그인</h2>

      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="이메일"
          value={form.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={form.password}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="auth-links">
        <button onClick={onMoveSignup}>회원가입 하러가기</button>
        <button onClick={onBack}>뒤로가기</button>
      </div>
    </div>
  );
}

export default LoginForm;