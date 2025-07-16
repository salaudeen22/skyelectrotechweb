import React, { useState, useMemo, useEffect } from 'react';
import { FaPlus, FaSearch, FaPencilAlt, FaTrashAlt, FaTimes, FaUserTie, FaUserCog, FaUser } from 'react-icons/fa';
import { usersAPI } from '../services/apiServices';
import toast from 'react-hot-toast';

// --- Helper Components ---
const RoleBadge = ({ role }) => {
    const roleStyles = {
        admin: { icon: FaUserTie, style: 'bg-purple-100 text-purple-800' },
        employee: { icon: FaUserCog, style: 'bg-blue-100 text-blue-800' },
        user: { icon: FaUser, style: 'bg-green-100 text-green-800' },
    };
    const { icon: Icon, style } = roleStyles[role] || { icon: FaUser, style: 'bg-gray-100 text-gray-800' };
    
    return (
        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${style}`}>
            <Icon className="mr-1.5" />
            {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
    );
};

const EmployeeModal = ({ employee, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: employee?.name || '',
        email: employee?.email || '',
        password: '',
        role: employee?.role || 'employee',
        phone: employee?.phone || '',
        address: employee?.address?.street || ''
    });
    const [loading, setLoading] = useState(false);

    const isEditing = !!employee;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userData = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                phone: formData.phone,
                address: formData.address
            };

            if (!isEditing) {
                userData.password = formData.password;
            }

            if (isEditing) {
                await usersAPI.updateUser(employee._id, userData);
                toast.success('Employee updated successfully');
            } else {
                await usersAPI.createEmployee(userData);
                toast.success('Employee created successfully');
            }
            
            onSave();
        } catch (error) {
            console.error('Error saving employee:', error);
            toast.error(error.response?.data?.message || 'Failed to save employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">
                            {isEditing ? 'Edit Employee' : 'Add New Employee'}
                        </h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            <FaTimes size={20} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Full Name *</label>
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email Address *</label>
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            />
                        </div>

                        {!isEditing && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Password *</label>
                                <input 
                                    type="password" 
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required={!isEditing}
                                    minLength={6}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                />
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Role *</label>
                            <select 
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="employee">Employee</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Phone</label>
                            <input 
                                type="tel" 
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Address</label>
                            <input 
                                type="text" 
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            />
                        </div>
                        
                        <div className="flex justify-end space-x-4 pt-4">
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Employee'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const Employees = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await usersAPI.getAllUsers({ limit: 100 });
            // Filter to show only employees and admins (not regular users)
            const staffMembers = response.data.users.filter(user => 
                user.role === 'employee' || user.role === 'admin'
            );
            setEmployees(staffMembers);
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.error('Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = useMemo(() => 
        employees.filter(emp => 
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.role.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [employees, searchTerm]
    );

    const handleOpenModal = (employee = null) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
    };

    const handleSave = () => {
        handleCloseModal();
        fetchEmployees(); // Refresh the employees list
    };

    const handleDeleteEmployee = async (employeeId, employeeName) => {
        if (window.confirm(`Are you sure you want to delete ${employeeName}?`)) {
            try {
                await usersAPI.deleteUser(employeeId);
                toast.success('Employee deleted successfully');
                fetchEmployees(); // Refresh the employees list
            } catch (error) {
                console.error('Error deleting employee:', error);
                toast.error('Failed to delete employee');
            }
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg animate-pulse">
                    <div className="h-10 bg-gray-300 rounded mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {isModalOpen && (
                <EmployeeModal 
                    employee={selectedEmployee} 
                    onClose={handleCloseModal} 
                    onSave={handleSave} 
                />
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Employee Management</h1>
                    <p className="text-slate-500 mt-1">
                        Manage your team members and their roles. Total: {employees.length} staff members
                    </p>
                </div>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                >
                    <FaPlus className="mr-2" /> Add Employee
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-lg">
                <div className="relative">
                    <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name, role, or email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredEmployees.map((emp) => (
                                <tr key={emp._id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {emp.avatar?.url ? (
                                                    <img className="h-10 w-10 rounded-full" src={emp.avatar.url} alt={emp.name} />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                        <FaUser className="text-gray-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-slate-900">{emp.name}</div>
                                                <div className="text-sm text-slate-500">{emp.email}</div>
                                                {emp.phone && (
                                                    <div className="text-xs text-slate-400">{emp.phone}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <RoleBadge role={emp.role} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            emp.isActive 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {emp.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center space-x-4">
                                            <button 
                                                onClick={() => handleOpenModal(emp)} 
                                                className="text-blue-600 hover:text-blue-900" 
                                                title="Edit Employee"
                                            >
                                                <FaPencilAlt />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteEmployee(emp._id, emp.name)}
                                                className="text-red-600 hover:text-red-900" 
                                                title="Remove Employee"
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {filteredEmployees.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            <p className="font-semibold">No employees found.</p>
                            <p className="text-sm">
                                {searchTerm ? 'Try adjusting your search.' : 'Add your first employee to get started.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Employees;