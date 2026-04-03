import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, Cpu, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: signUpError } = await signUp(email, password, {
                data: { full_name: name }
            });
            if (signUpError) throw signUpError;

            // Cadastro com sucesso, redirecionar para login ou exibir msg de confirmação
            alert('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.');
            navigate('/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page neo-tech">
            <div className="auth-background-effects">
                <div className="glow-orb orb-1"></div>
                <div className="glow-orb orb-2"></div>
            </div>

            <div className="auth-card glass fade-in">
                <div className="auth-header">
                    <div className="auth-logo-neo">
                        <Cpu size={36} color="var(--brand-primary)" className="glow-pulse" />
                    </div>
                    <h1 className="auth-title text-neon">INITIALIZE_ID</h1>
                    <p className="auth-subtitle text-mono">Create your unique identifier to join the operational network.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="auth-error glass-error fade-in" style={{
                            padding: '12px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 59, 48, 0.1)',
                            border: '1px solid rgba(255, 59, 48, 0.2)',
                            color: '#FF453A',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '20px'
                        }}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}
                    <div className="form-group-neo">
                        <label className="text-mono" htmlFor="name">USER_FULL_NAME</label>
                        <div className="input-wrapper-neo">
                            <User className="input-icon-neo" size={18} />
                            <input
                                type="text"
                                id="name"
                                placeholder="EX: JOHN_DOE"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group-neo">
                        <label className="text-mono" htmlFor="email">USER_IDENTITY (EMAIL)</label>
                        <div className="input-wrapper-neo">
                            <Mail className="input-icon-neo" size={18} />
                            <input
                                type="email"
                                id="email"
                                placeholder="ID_000000@ACCESS.COM"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group-neo">
                        <label className="text-mono" htmlFor="password">ACCESS_PHRASE (PASS)</label>
                        <div className="input-wrapper-neo">
                            <Lock className="input-icon-neo" size={18} />
                            <input
                                type="password"
                                id="password"
                                placeholder="MIN_8_CHARS"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary auth-btn-neo" disabled={loading}>
                        {loading ? <Loader2 size={20} className="spin" /> : <UserPlus size={20} />}
                        <span>{loading ? 'INITIALIZING...' : 'CREATE_AUTHENTICATION_ID'}</span>
                    </button>
                </form>

                <div className="auth-footer-neo">
                    <p className="text-mono">ALREADY_REGISTERED? <Link to="/login" className="auth-link-neo">LOGIN_DIRECT</Link></p>
                </div>
            </div>

            <div className="auth-branding-neo">
                <p className="text-mono">NEO_TECH_OS v4.2 // SECURITY_ENFORCED</p>
            </div>
        </div>
    );
};

export default Register;
