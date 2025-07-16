import React, { useState, useMemo } from 'react';
import { FaPlus, FaSearch, FaPencilAlt, FaTrashAlt, FaTimes, FaUserTie, FaUserCog, FaUser } from 'react-icons/fa';

// --- Updated Dummy Data with Avatars ---
const dummyEmployees = [
  { id: 1, name: 'Ravi Sharma', role: 'Manager', email: 'ravi@skyelectro.tech', avatarUrl: 'https://i.pravatar.cc/150?u=ravi' },
  { id: 2, name: 'Neha Patel', role: 'Sales Specialist', email: 'neha@skyelectro.tech', avatarUrl: 'https://i.pravatar.cc/150?u=neha' },
  { id: 3, name: 'Suresh Kumar', role: 'Inventory Clerk', email: 'suresh@skyelectro.tech', avatarUrl: 'https://i.pravatar.cc/150?u=suresh' },
  { id: 4, name: 'Anjali Desai', role: 'Support Engineer', email: 'anjali@skyelectro.tech', avatarUrl: 'https://i.pravatar.cc/150?u=anjali' },
];

// --- Helper Components ---
const RoleBadge = ({ role }) => {
    const roleStyles = {
        Manager: { icon: FaUserTie, style: 'bg-blue-100 text-blue-800' },
        'Sales Specialist': { icon: FaUser, style: 'bg-green-100 text-green-800' },
        'Inventory Clerk': { icon: FaUserCog, style: 'bg-yellow-100 text-yellow-800' },
        'Support Engineer': { icon: FaUserCog, style: 'bg-indigo-100 text-indigo-800' },
    };
    const { icon: Icon, style } = roleStyles[role] || { icon: FaUser, style: 'bg-gray-100 text-gray-800' };
    
    return (
        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${style}`}>
            <Icon className="mr-1.5" />
            {role}
        </span>
    );
};

const EmployeeModal = ({ employee, onClose, onSave }) => {
    const isEditing = !!employee;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">{isEditing ? 'Edit Employee' : 'Add New Employee'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><FaTimes size={20} /></button>
                </div>
                <form className="space-y-4" onSubmit={onSave}>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Full Name</label>
                        <input type="text" defaultValue={employee?.name} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Email Address</label>
                        <input type="email" defaultValue={employee?.email} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Role</label>
                        <select defaultValue={employee?.role} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required>
                            <option>Manager</option>
                            <option>Sales Specialist</option>
                            <option>Inventory Clerk</option>
                            <option>Support Engineer</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Employee</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Employees = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const filteredEmployees = useMemo(() => 
        dummyEmployees.filter(emp => 
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.role.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [searchTerm]
    );

    const handleOpenModal = (employee = null) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSave = (e) => {
        e.preventDefault();
        console.log('Saving employee...');
        handleCloseModal();
    };

  return (
    <div className="space-y-6">
        {isModalOpen && <EmployeeModal employee={selectedEmployee} onClose={handleCloseModal} onSave={handleSave} />}

      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Employee Management</h1>
            <p className="text-slate-500 mt-1">Manage your team members and their roles.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
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
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 rounded-full" src={emp.avatarUrl} alt={emp.name} />
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-slate-900">{emp.name}</div>
                                <div className="text-sm text-slate-500">{emp.email}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <RoleBadge role={emp.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-4">
                        <button onClick={() => handleOpenModal(emp)} className="text-blue-600 hover:text-blue-900" title="Edit Employee">
                            <FaPencilAlt />
                        </button>
                        <button className="text-red-600 hover:text-red-900" title="Remove Employee">
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
                    <p className="text-sm">Try adjusting your search.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Employees;