import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

import Home from './components/Home';
import Footer from './components/Footer';

import UploadPage from './pages/UploadPage';
import ResultPage from './pages/ResultPage';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyPage from './pages/MyPage';

import AdminLayout from './pages/admin/AdminLayout';
import AdminMainPage from './pages/admin/AdminMainPage';
import BugReportPage from './pages/admin/BugReportPage';
import AdminAnalysisCardsPage from './pages/admin/AdminAnalysisCardsPage';

function AdminRoute({ children, user, authChecked }) {
  if (!authChecked) {
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function MainLayout({ children, user, onLogout }) {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (user?.role === 'ADMIN') {
      navigate('/admin');
      return;
    }

    navigate('/');
  };

  return (
    <div className="App">
      <header className="socar-header">
        <div className="header-inner">
          <h1 className="brand-logo" onClick={handleLogoClick}>
            JJICCAR
          </h1>

          <div className="header-auth">
            {user ? (
              <>
                <span className="header-user-name">{user.name}님</span>
                <button
                  className="header-btn outline"
                  onClick={() => navigate('/mypage')}
                >
                  마이페이지
                </button>
                <button className="header-btn" onClick={onLogout}>
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <button
                  className="header-btn outline"
                  onClick={() => navigate('/login')}
                >
                  로그인
                </button>
                <button
                  className="header-btn"
                  onClick={() => navigate('/signup')}
                >
                  회원가입
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>

      <Footer />
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('loginUser');

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('loginUser 파싱 실패:', error);
        localStorage.removeItem('loginUser');
      }
    }

    setAuthChecked(true);
  }, []);

  const handleLoginSuccess = (loginUser) => {
    setUser(loginUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('loginUser');
    localStorage.removeItem('accessToken');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout user={user} onLogout={handleLogout}>
            <Home />
          </MainLayout>
        }
      />

      <Route
        path="/upload"
        element={
          <MainLayout user={user} onLogout={handleLogout}>
            <UploadPage />
          </MainLayout>
        }
      />

      <Route
        path="/result"
        element={
          <MainLayout user={user} onLogout={handleLogout}>
            <ResultPage />
          </MainLayout>
        }
      />

      <Route
        path="/result/:id"
        element={
          <MainLayout user={user} onLogout={handleLogout}>
            <ResultPage />
          </MainLayout>
        }
      />

      <Route
        path="/login"
        element={
          <MainLayout user={user} onLogout={handleLogout}>
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          </MainLayout>
        }
      />

      <Route
        path="/signup"
        element={
          <MainLayout user={user} onLogout={handleLogout}>
            <SignupPage />
          </MainLayout>
        }
      />

      <Route
        path="/mypage"
        element={
          <MainLayout user={user} onLogout={handleLogout}>
            {user ? <MyPage user={user} /> : <Navigate to="/login" replace />}
          </MainLayout>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminRoute user={user} authChecked={authChecked}>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminMainPage />} />
        <Route path="bug-reports" element={<BugReportPage />} />
        <Route path="analysis-results" element={<AdminAnalysisCardsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;