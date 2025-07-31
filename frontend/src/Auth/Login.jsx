import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import GoogleOAuthButton from '../Components/GoogleOAuthButton';
import { useAnalytics } from '../hooks/useAnalytics';
import toast from 'react-hot-toast';
import { 
    FiEye, 
    FiEyeOff, 
    FiMail,
    FiLock,
    FiArrowRight,
    FiCpu,
    FiTruck,
    FiShield,
    FiAlertCircle
} from 'react-icons/fi';
import { FaGoogle, FaApple } from 'react-icons/fa';

const Login = () => {
    // --- All existing state and logic functions remain exactly the same ---
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { trackUserLogin, trackForm, trackClick } = useAnalytics();
    const { settings } = useSettings();
    
    const from = location.state?.from?.pathname || '/';

    const validate = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
        if (!formData.password) newErrors.password = 'Password is required';
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        trackForm('login_form');
        trackClick('login_submit_button', 'login_page');
        setIsLoading(true);
        
        try {
            const result = await login(formData);
            if (result.success) {
                trackUserLogin('email');
                toast.success(`Welcome back!`);
                // Role-based navigation
                const user = result.user;
                if (user && (user.role === 'admin' || user.role === 'employee')) {
                    navigate('/admin/dashboard', { replace: true });
                } else {
                    navigate(from, { replace: true });
                }
            } else {
                toast.error(result.error || 'Invalid credentials');
            }
        } catch {
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    // --- End of logic ---

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-white shadow-2xl rounded-2xl overflow-hidden">
                
                {/* Left Panel - Branding */}
                <div 
                    className="hidden lg:flex lg:w-1/2 bg-cover bg-center p-12 text-white relative"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1550745165-9bc0b252726a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80')" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/70 to-blue-900/70"></div>
                    <div className="relative z-10 flex flex-col justify-between animate-fade-in-up">
                        <div>
                            <Link to="/" className="flex items-center gap-3 mb-8">
                             
                                <span className="text-2xl font-bold tracking-wider">{settings.storeInfo.name}</span>
                            </Link>
                            <h1 className="text-4xl font-extrabold leading-tight mb-4">
                                Welcome to the Future of Electronics.
                            </h1>
                            <p className="text-blue-200 text-lg leading-relaxed">
                                Sign in to access your projects, orders, and a world of components.
                            </p>
                        </div>
                        
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InfoCard icon={<FiCpu />} text="Quality Parts" />
                            <InfoCard icon={<FiTruck />} text="Fast Shipping" />
                            <InfoCard icon={<FiShield />} text="Secure Checkout" />
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="w-full lg:w-1/2 p-6 sm:p-12 flex flex-col justify-center">
                    <div className="w-full max-w-md mx-auto">
                        <div className="text-center lg:text-left mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">Sign In</h2>
                            <p className="text-gray-600 mt-2">
                                New to {settings.storeInfo.name}?{' '}
                                <Link to="/auth/register" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                                    Create an account
                                </Link>
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                            <InputField icon={<FiMail />} name="email" type="email" placeholder="your.email@example.com" value={formData.email} onChange={handleChange} error={errors.email} />
                            <InputField icon={<FiLock />} name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleChange} error={errors.password}>
                                <PasswordToggle isVisible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                            </InputField>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                                    <span className="ml-2 text-gray-700">Remember me</span>
                                </label>
                                <Link to="/auth/forgot-password" className="font-semibold text-indigo-600 hover:underline">
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full group flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                        <span>Signing In...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <FiArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </form>
                        
                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                </div>
                            </div>
                            <div className="mt-6">
                                <GoogleOAuthButton 
                                    text="Sign in with Google"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reusable Helper Components for a cleaner main component
const InfoCard = ({ icon, text }) => (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg flex flex-col items-center justify-center text-center transition-transform hover:scale-105">
        <div className="text-3xl mb-2">{icon}</div>
        <h3 className="text-sm font-medium">{text}</h3>
    </div>
);

const InputField = ({ icon, name, type, placeholder, value, onChange, error, children }) => (
    <div>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">{icon}</div>
            <input 
                id={name} 
                name={name} 
                type={type} 
                placeholder={placeholder} 
                value={value} 
                onChange={onChange} 
                autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'off'}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${error ? 'border-red-500 ring-red-500/50' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/50'}`} 
            />
            {children}
        </div>
        {error && <p className="mt-1.5 flex items-center text-sm text-red-600"><FiAlertCircle className="mr-1.5" />{error}</p>}
    </div>
);

const PasswordToggle = ({ isVisible, onToggle }) => (
    <button type="button" className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600" onClick={onToggle}>
        {isVisible ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
    </button>
);

export default Login;