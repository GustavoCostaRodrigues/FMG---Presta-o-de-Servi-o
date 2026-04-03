import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Cpu } from 'lucide-react';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/');
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
                    <h1 className="auth-title text-neon">CORE_ACCESS</h1>
                    <p className="auth-subtitle text-mono">Identify yourself to connect to the central network.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
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
                            />
                        </div>
                    </div>

                    <div className="form-group-neo">
                        <div className="label-row">
                            <label className="text-mono" htmlFor="password">ACCESS_PHRASE (PASS)</label>
                            <a href="#" className="forgot-link-neo text-mono">RECOVER_ID</a>
                        </div>
                        <div className="input-wrapper-neo">
                            <Lock className="input-icon-neo" size={18} />
                            <input
                                type="password"
                                id="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary auth-btn-neo">
                        <LogIn size={20} />
                        <span>ESTABLISH_CONNECTION</span>
                    </button>
                </form>

                <div className="auth-footer-neo">
                    <p className="text-mono">UNREGISTERED? <Link to="/registro" className="auth-link-neo">REQUEST_NEW_ID</Link></p>
                </div>
            </div>

            <div className="auth-branding-neo">
                <p className="text-mono">NEO_TECH_OS v4.2 // SECURITY_ENFORCED</p>
            </div>
        </div>
    );
};

export default Login;
