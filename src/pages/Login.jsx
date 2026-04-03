import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoFazenda from '../assets/logo-fazenda.jpg';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { signIn } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: signInError } = await signIn(email, password);
            if (signInError) throw signInError;
        } catch (err) {
            setError(err.message === 'Invalid login credentials' ? 'Credenciais inválidas. Verifique seu e-mail e senha.' : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card fade-in">
                <div className="auth-header">
                    <div className="auth-logo">
                        <img src={logoFazenda} alt="Fazenda Morro Grande" style={{ width: '280px', height: 'auto', borderRadius: '12px' }} />
                    </div>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="auth-error fade-in">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input
                                type="email"
                                id="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label htmlFor="password" style={{ margin: 0 }}>Senha</label>
                            <a href="#" className="auth-link" style={{ fontSize: '12px' }}>Esqueceu a senha?</a>
                        </div>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                type="password"
                                id="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? <div className="loading-spinner"></div> : <LogIn size={20} />}
                        <span>{loading ? 'Entrando...' : 'Entrar'}</span>
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Não tem uma conta? <Link to="/registro" className="auth-link">Cadastre-se</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
