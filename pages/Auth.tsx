import { useState } from 'react';
import type React from 'react';
import { backend } from '../services/backend';

type Mode = 'login' | 'register' | 'forgot' | 'reset' | 'verify';

interface AuthProps {
  onAuthenticated: () => Promise<void> | void;
}

export default function Auth({ onAuthenticated }: AuthProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState({
    companyName: '',
    industry: '',
    email: '',
    password: '',
    confirmPassword: '',
    resetToken: '',
    newPassword: '',
    verificationToken: '',
  });
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [lastSentToken, setLastSentToken] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  const switchMode = (next: Mode) => {
    setMode(next);
    setMessage('');
    setStatus('idle');
  };

  const updateField = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      await backend.login(form.email, form.password);
      setStatus('success');
      setMessage('Đăng nhập thành công');
      await onAuthenticated();
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'Đăng nhập thất bại');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setStatus('error');
      setMessage('Mật khẩu xác nhận không khớp');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const response = await backend.register({
        companyName: form.companyName,
        industry: form.industry,
        email: form.email,
        password: form.password,
      });
      
      // Nếu cần xác nhận email
      if (response.requiresVerification) {
        setStatus('success');
        setMessage(response.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
        if (response.token) {
          setVerificationToken(response.token);
          setForm(prev => ({ ...prev, verificationToken: response.token }));
        }
        setMode('verify');
      } else {
        // Nếu không cần xác nhận (fallback)
        setStatus('success');
        setMessage('Đăng ký thành công, bạn đã được đăng nhập');
        await onAuthenticated();
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'Đăng ký thất bại');
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      await backend.verifyEmail(form.verificationToken);
      setStatus('success');
      setMessage('Email đã được xác nhận thành công! Bạn đã được đăng nhập.');
      await onAuthenticated();
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'Xác nhận email thất bại');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const result = await backend.requestPasswordReset(form.email);
      if (result.token) {
        setLastSentToken(result.token);
        setStatus('success');
        setMessage(`Đã gửi email khôi phục. Token demo: ${result.token}. Hết hạn: ${new Date(result.expiresAt).toLocaleTimeString()}`);
        setMode('reset');
        setForm(prev => ({ ...prev, resetToken: result.token }));
      } else {
        setStatus('success');
        setMessage('Đã gửi email khôi phục. Vui lòng kiểm tra email của bạn.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'Gửi email khôi phục thất bại');
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      await backend.resetPassword(form.resetToken, form.newPassword);
      setStatus('success');
      setMessage('Đặt lại mật khẩu thành công, bạn đã được đăng nhập');
      await onAuthenticated();
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'Đặt lại mật khẩu thất bại');
    }
  };

  const renderStatus = () => {
    if (!message) return null;
    const isSuccess = status === 'success';
    return (
      <div
        style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          borderRadius: '0.375rem',
          backgroundColor: isSuccess ? '#d1fae5' : '#fee2e2',
          color: isSuccess ? '#065f46' : '#991b1b',
        }}
      >
        {message}
        {lastSentToken && isSuccess && mode === 'reset' && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#065f46' }}>
            (Demo) Token mới nhất: <code>{lastSentToken}</code>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '440px', margin: '0 auto', padding: '2rem', background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
        {mode === 'login' && 'Đăng nhập'}
        {mode === 'register' && 'Đăng ký'}
        {mode === 'forgot' && 'Quên mật khẩu'}
        {mode === 'reset' && 'Đặt lại mật khẩu'}
        {mode === 'verify' && 'Xác nhận email'}
      </h1>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button onClick={() => switchMode('login')} style={tabStyle(mode === 'login')}>Đăng nhập</button>
        <button onClick={() => switchMode('register')} style={tabStyle(mode === 'register')}>Đăng ký</button>
        <button onClick={() => switchMode('forgot')} style={tabStyle(mode === 'forgot')}>Quên mật khẩu</button>
      </div>

      {renderStatus()}

      {mode === 'login' && (
        <form onSubmit={handleLogin} style={{ display: 'grid', gap: '1rem' }}>
          <Input label="Email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
          <Input label="Mật khẩu" type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} required />
          <button type="submit" disabled={status === 'loading'} style={primaryButtonStyle(status === 'loading')}>
            {status === 'loading' ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      )}

      {mode === 'register' && (
        <form onSubmit={handleRegister} style={{ display: 'grid', gap: '1rem' }}>
          <Input label="Tên công ty" value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} required />
          <Input label="Ngành nghề" value={form.industry} onChange={(e) => updateField('industry', e.target.value)} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
          <Input label="Mật khẩu" type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} required />
          <Input label="Xác nhận mật khẩu" type="password" value={form.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} required />
          <button type="submit" disabled={status === 'loading'} style={primaryButtonStyle(status === 'loading')}>
            {status === 'loading' ? 'Đang đăng ký...' : 'Đăng ký và đăng nhập'}
          </button>
        </form>
      )}

      {mode === 'forgot' && (
        <form onSubmit={handleForgot} style={{ display: 'grid', gap: '1rem' }}>
          <Input label="Email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
          <button type="submit" disabled={status === 'loading'} style={primaryButtonStyle(status === 'loading')}>
            {status === 'loading' ? 'Đang gửi...' : 'Gửi email khôi phục'}
          </button>
        </form>
      )}

      {mode === 'reset' && (
        <form onSubmit={handleReset} style={{ display: 'grid', gap: '1rem' }}>
          <Input label="Token khôi phục (từ email)" value={form.resetToken} onChange={(e) => updateField('resetToken', e.target.value)} required />
          <Input label="Mật khẩu mới" type="password" value={form.newPassword} onChange={(e) => updateField('newPassword', e.target.value)} required />
          <button type="submit" disabled={status === 'loading'} style={primaryButtonStyle(status === 'loading')}>
            {status === 'loading' ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
          </button>
          {lastSentToken && (
            <p style={{ fontSize: '0.85rem', color: '#374151' }}>
              (Demo) Token gần nhất đã gửi: <code>{lastSentToken}</code>
            </p>
          )}
        </form>
      )}

      {mode === 'verify' && (
        <form onSubmit={handleVerifyEmail} style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#e0f2fe', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#0369a1' }}>
              Vui lòng kiểm tra email của bạn và nhập token xác nhận bên dưới.
            </p>
          </div>
          <Input label="Token xác nhận (từ email)" value={form.verificationToken} onChange={(e) => updateField('verificationToken', e.target.value)} required />
          <button type="submit" disabled={status === 'loading'} style={primaryButtonStyle(status === 'loading')}>
            {status === 'loading' ? 'Đang xác nhận...' : 'Xác nhận email'}
          </button>
          {verificationToken && (
            <p style={{ fontSize: '0.85rem', color: '#374151' }}>
              (Demo) Token đã được gửi: <code>{verificationToken}</code>
            </p>
          )}
        </form>
      )}
    </div>
  );
}

function Input(props: { label: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean }) {
  return (
    <div style={{ display: 'grid', gap: '0.35rem' }}>
      <label style={{ fontWeight: 500 }}>{props.label}</label>
      <input
        {...props}
        style={{
          padding: '0.65rem 0.75rem',
          borderRadius: '0.4rem',
          border: '1px solid #d1d5db',
          fontSize: '1rem',
        }}
      />
    </div>
  );
}

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '0.5rem 0.75rem',
  borderRadius: '999px',
  border: '1px solid #d1d5db',
  background: active ? '#e0f2fe' : 'white',
  color: active ? '#0ea5e9' : '#111827',
  cursor: 'pointer',
  fontWeight: active ? 600 : 500,
});

const primaryButtonStyle = (loading: boolean): React.CSSProperties => ({
  padding: '0.8rem',
  background: loading ? '#9ca3af' : '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: '0.45rem',
  fontWeight: 600,
  cursor: loading ? 'not-allowed' : 'pointer',
});
