import React, { useState } from 'react';
// import axios from 'axios';
import { useAuth } from "../context/AuthContext";

const CreateBloodRequestForm = ({ isOpen, onClose, onSuccess }) => {
  const { api } = useAuth();
  const [formData, setFormData] = useState({
    patient_name: '',
    blood_group: '',
    units_needed: 1,
    urgency: 'medium',
    hospital_name: '',
    hospital_address: '',
    contact_phone: '',
    needed_by_date: '',
    additional_notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  const urgencyLevels = [
    { value: 'low', label: 'Low', description: 'Can wait 1-2 weeks' },
    { value: 'medium', label: 'Medium', description: 'Needed within a week' },
    { value: 'high', label: 'High', description: 'Needed within 2-3 days' },
    { value: 'critical', label: 'Critical', description: 'Needed immediately' }
  ];

  const formatPhoneNumber = (value) => {
    // Remove all non-digits except +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // Handle different input patterns
    if (cleaned.startsWith('01') && cleaned.length === 11) {
      // Convert 01712345678 to +88001712345678
      cleaned = '+88' + cleaned;
    } else if (cleaned.startsWith('8801') && cleaned.length === 13) {
      // Convert 8801712345678 to +8801712345678
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  };


const handleChange = (e) => {
  const { name, value } = e.target;
  
  let processedValue = value;
  
  // Apply field-specific formatting
  if (name === 'contact_phone') {
    processedValue = formatPhoneNumber(value);
  }
  
  setFormData(prev => ({
    ...prev,
    [name]: processedValue
  }));
 
  // Clear error when user starts typing
  if (errors[name]) {
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  }
};

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.patient_name.trim()) {
      newErrors.patient_name = 'Patient name is required';
    }
    
    if (!formData.blood_group) {
      newErrors.blood_group = 'Blood group is required';
    }
    
    if (!formData.units_needed || formData.units_needed < 1) {
      newErrors.units_needed = 'Units needed must be at least 1';
    } else if (formData.units_needed > 10) {
      newErrors.units_needed = 'Units needed cannot exceed 10';
    }
    
    if (!formData.hospital_name.trim()) {
      newErrors.hospital_name = 'Hospital name is required';
    }
    
    if (!formData.hospital_address.trim()) {
      newErrors.hospital_address = 'Hospital address is required';
    }
    
    if (!formData.contact_phone.trim()) {
      newErrors.contact_phone = 'Contact phone is required';
    } else if (!/^\+8801[3-9]\d{8}$/.test(formData.contact_phone.replace(/\s/g, ''))) {
    newErrors.contact_phone = 'Please enter a valid Bangladesh phone number (+8801xxxxxxxxx)';
    }
    
    if (formData.needed_by_date) {
      const selectedDate = new Date(formData.needed_by_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.needed_by_date = 'Date cannot be in the past';
      }
    }
    
    return newErrors;
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      // const response = await axios.post('/api/accounts/blood-requests/', formData);
      const response = await api.post('/api/accounts/blood-requests/', formData);
      
      onSuccess?.(response.data);
      onClose();
      
      // Reset form
      setFormData({
        patient_name: '',
        blood_group: '',
        units_needed: 1,
        urgency: 'medium',
        hospital_name: '',
        hospital_address: '',
        contact_phone: '',
        needed_by_date: '',
        additional_notes: ''
      });
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ non_field_errors: ['Failed to create request. Please try again.'] });
      }
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Create Blood Request</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* General Error */}
          {errors.non_field_errors && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              {errors.non_field_errors.map((error, index) => (
                <p key={index} className="text-red-800 text-sm">{error}</p>
              ))}
            </div>
          )}

          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Patient Information</h3>
            
            <div>
              <label htmlFor="patient_name" className="block text-sm font-medium text-gray-700 mb-2">
                Patient Name *
              </label>
              <input
                type="text"
                id="patient_name"
                name="patient_name"
                value={formData.patient_name}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.patient_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter patient's full name"
              />
              {errors.patient_name && (
                <p className="mt-1 text-sm text-red-600">{errors.patient_name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="blood_group" className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group *
                </label>
                <select
                  id="blood_group"
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    errors.blood_group ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select blood group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                {errors.blood_group && (
                  <p className="mt-1 text-sm text-red-600">{errors.blood_group}</p>
                )}
              </div>

              <div>
                <label htmlFor="units_needed" className="block text-sm font-medium text-gray-700 mb-2">
                  Units Needed *
                </label>
                <input
                  type="number"
                  id="units_needed"
                  name="units_needed"
                  min="1"
                  max="10"
                  value={formData.units_needed}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    errors.units_needed ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.units_needed && (
                  <p className="mt-1 text-sm text-red-600">{errors.units_needed}</p>
                )}
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Request Details</h3>
            
            <div>
              <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {urgencyLevels.map(level => (
                  <label key={level.value} className="relative">
                    <input
                      type="radio"
                      name="urgency"
                      value={level.value}
                      checked={formData.urgency === level.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                      formData.urgency === level.value
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-3 ${
                          formData.urgency === level.value
                            ? 'bg-red-500'
                            : 'bg-gray-300'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{level.label}</p>
                          <p className="text-xs text-gray-600">{level.description}</p>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="needed_by_date" className="block text-sm font-medium text-gray-700 mb-2">
                Needed By Date (Optional)
              </label>
              <input
                type="date"
                id="needed_by_date"
                name="needed_by_date"
                min={getMinDate()}
                value={formData.needed_by_date}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.needed_by_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.needed_by_date && (
                <p className="mt-1 text-sm text-red-600">{errors.needed_by_date}</p>
              )}
            </div>
          </div>

          {/* Hospital Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Hospital Information</h3>
            
            <div>
              <label htmlFor="hospital_name" className="block text-sm font-medium text-gray-700 mb-2">
                Hospital Name *
              </label>
              <input
                type="text"
                id="hospital_name"
                name="hospital_name"
                value={formData.hospital_name}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.hospital_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter hospital name"
              />
              {errors.hospital_name && (
                <p className="mt-1 text-sm text-red-600">{errors.hospital_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="hospital_address" className="block text-sm font-medium text-gray-700 mb-2">
                Hospital Address *
              </label>
              <textarea
                id="hospital_address"
                name="hospital_address"
                rows={3}
                value={formData.hospital_address}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.hospital_address ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter complete hospital address"
              />
              {errors.hospital_address && (
                <p className="mt-1 text-sm text-red-600">{errors.hospital_address}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone *
              </label>
              <input
                type="tel"
                id="contact_phone"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.contact_phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+8801xxxxxxxxx"
                
              />
              {errors.contact_phone && (
                <p className="mt-1 text-sm text-red-600">{errors.contact_phone}</p>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label htmlFor="additional_notes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              id="additional_notes"
              name="additional_notes"
              rows={3}
              value={formData.additional_notes}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Any additional information about the request..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {loading ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBloodRequestForm;