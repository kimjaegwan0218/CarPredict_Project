import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logoBox} onClick={() => navigate('/admin')}>
            <span style={styles.logo}>JJICCAR ADMIN</span>
          </div>

          <nav style={styles.nav}>
            <NavLink
              to="/admin"
              end
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.activeNavLink : {}),
              })}
            >
              관리자 메인
            </NavLink>

            <NavLink
              to="/admin/bug-reports"
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.activeNavLink : {}),
              })}
            >
              버그 리포트
            </NavLink>

            <NavLink
              to="/admin/analysis-results"
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.activeNavLink : {}),
              })}
            >
              AI 분석 결과
            </NavLink>
          </nav>

          <button style={styles.homeButton} onClick={() => navigate('/')}>
            사용자 페이지
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.contentBox}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #eef4fb 0%, #f7f9fc 100%)',
  },

  header: {
    width: '100%',
    background: 'linear-gradient(90deg, #0f172a 0%, #162338 100%)',
    boxShadow: '0 6px 24px rgba(15, 23, 42, 0.12)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },

  headerInner: {
    maxWidth: '1520px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
  },

  logoBox: {
    cursor: 'pointer',
    flexShrink: 0,
  },

  logo: {
    color: '#24b9ff',
    fontSize: '30px',
    fontWeight: 800,
    letterSpacing: '-0.3px',
  },

  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    flex: 1,
  },

  navLink: {
    textDecoration: 'none',
    color: '#e5edf7',
    padding: '12px 20px',
    borderRadius: '16px',
    fontSize: '15px',
    fontWeight: 700,
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.04)',
    transition: 'all 0.2s ease',
  },

  activeNavLink: {
    backgroundColor: '#24b9ff',
    color: '#ffffff',
    boxShadow: '0 10px 24px rgba(36, 185, 255, 0.28)',
    border: '1px solid rgba(255,255,255,0.12)',
  },

  homeButton: {
    border: '1px solid rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#ffffff',
    padding: '12px 18px',
    borderRadius: '16px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    flexShrink: 0,
  },

  main: {
    maxWidth: '1520px',
    margin: '0 auto',
    padding: '24px 20px 36px',
  },

  contentBox: {
    backgroundColor: '#ffffff',
    borderRadius: '34px',
    padding: '40px',
    boxShadow: '0 16px 34px rgba(15, 23, 42, 0.08)',
    minHeight: 'calc(100vh - 150px)',
  },
};