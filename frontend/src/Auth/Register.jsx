import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import GoogleSignInButton from '../Components/GoogleSignInButton';
import toast from 'react-hot-toast';
import { 
    FiEye, 
    FiEyeOff, 
    FiUser, 
    FiLock, 
    FiMail,
    FiPhone,
    FiCpu,
    FiAlertCircle,
    FiArrowRight
} from 'react-icons/fi';
import { FaApple } from 'react-icons/fa';

const Register = () => {
    // ... All existing state and logic functions remain exactly the same ...
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Full name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        
        // A simple terms validation
        if (!document.getElementById('terms').checked) {
            newErrors.terms = 'You must agree to the terms and privacy policy.';
        }
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
        if (name === 'terms' && errors.terms) setErrors(prev => ({ ...prev, terms: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            if (validationErrors.terms) toast.error(validationErrors.terms);
            return;
        }

        setIsLoading(true);
        try {
            const result = await register({ name: formData.name, email: formData.email, phone: formData.phone, password: formData.password });
            if (result.success) {
                const user = result.user;
                toast.success(`Welcome, ${user.name}! Your account is ready.`);
                // Role-based navigation
                if (user.role === 'admin' || user.role === 'employee') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
            } else {
                toast.error(result.error || 'Registration failed.');
            }
        } catch {
            toast.error('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    // --- End of logic ---

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-white shadow-2xl rounded-2xl overflow-hidden m-4">
                
                {/* Left Branding Pane */}
                <div 
                    className="hidden lg:flex lg:w-5/12 bg-cover bg-center p-12 text-white relative"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80')" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 to-blue-900/80"></div>
                    <div className="relative z-10 flex flex-col justify-center animate-fade-in-up">
                        <Link to="/" className="flex items-center gap-3 mb-8">
                         
                            <span className="text-2xl font-bold tracking-wider">SkyElectroTech</span>
                        </Link>
                        <h1 className="text-4xl font-extrabold leading-tight mb-4">
                            Start Your Next Project With Us.
                        </h1>
                        <p className="text-blue-200 text-lg leading-relaxed">
                            Sign up to unlock a world of high-quality electronic components, project kits, and a community of passionate builders.
                        </p>
                    </div>
                </div>

                {/* Right Form Pane */}
                <div className="w-full lg:w-7/12 p-6 sm:p-10 flex flex-col justify-center">
                    <div className="w-full max-w-lg mx-auto">
                        <div className="text-center lg:text-left mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">Create an Account</h2>
                            <p className="text-gray-600 mt-2">
                                Already have an account?{' '}
                                <Link to="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                                    Sign In
                                </Link>
                            </p>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                            {/* Form fields with improved layout and error handling */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField icon={<FiUser />} name="name" type="text" placeholder="Your Name" value={formData.name} onChange={handleChange} error={errors.name} />
                                <InputField icon={<FiPhone />} name="phone" type="tel" placeholder="10-digit Phone" value={formData.phone} onChange={handleChange} error={errors.phone} />
                            </div>
                            <InputField icon={<FiMail />} name="email" type="email" placeholder="your.email@example.com" value={formData.email} onChange={handleChange} error={errors.email} />
                            <InputField icon={<FiLock />} name="password" type={showPassword ? 'text' : 'password'} placeholder="Password (min. 6 characters)" value={formData.password} onChange={handleChange} error={errors.password}>
                                <PasswordToggle isVisible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                            </InputField>
                            <InputField icon={<FiLock />} name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword}>
                                <PasswordToggle isVisible={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />
                            </InputField>
                            
                            {/* Terms and Conditions */}
                            <div className="flex items-start">
                                <input id="terms" name="terms" type="checkbox" onChange={handleChange} className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
                                <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
                                    I agree to the{' '}
                                    <Link to="/terms" className="font-semibold text-indigo-600 hover:underline">Terms</Link> and{' '}
                                    <Link to="/privacy" className="font-semibold text-indigo-600 hover:underline">Privacy Policy</Link>.
                                </label>
                            </div>
                            {errors.terms && <p className="text-sm text-red-600 -mt-2">{errors.terms}</p>}
                            
                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full group flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <FiArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </form>
                        
                        {/* Social Login Divider */}
                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or sign up with</span></div>
                            </div>
                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <GoogleSignInButton text="Sign up with Google" />
                                <SocialButton icon={<FaApple />} provider="Apple" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper component for consistent input fields
const InputField = ({ icon, name, type, placeholder, value, onChange, error, children }) => (
    <div>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                {icon}
            </div>
            <input
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                    error ? 'border-red-500 ring-red-500/50' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/50'
                }`}
            />
            {children} {/* For password toggle button */}
        </div>
        {error && <p className="mt-1.5 flex items-center text-sm text-red-600"><FiAlertCircle className="mr-1.5" />{error}</p>}
    </div>
);

// Helper component for password visibility toggle
const PasswordToggle = ({ isVisible, onToggle }) => (
    <button type="button" className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600" onClick={onToggle}>
        {isVisible ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
    </button>
);

// Helper component for social login buttons
const SocialButton = ({ icon, provider }) => (
    <button className="w-full inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all">
        <div className="h-5 w-5 mr-2">{icon}</div>
        <span>{provider}</span>
    </button>
);

export default Register;