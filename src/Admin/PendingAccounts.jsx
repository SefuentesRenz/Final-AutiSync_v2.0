import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AcademicCapIcon } from '@heroicons/react/24/solid';
import { 
  getPendingAccounts, 
  approveAccount, 
  rejectAccount 
} from '../lib/accountApprovalApi';

const PendingAccounts = () => {
  const navigate = useNavigate();
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null); // Track which account is being processed
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }
  const [confirmModal, setConfirmModal] = useState(null); // { type: 'approve' | 'reject', userId, userName }

  // Fetch pending accounts on component mount
  useEffect(() => {
    fetchPendingAccounts();
  }, []);

  const fetchPendingAccounts = async () => {
    setLoading(true);
    const { data, error } = await getPendingAccounts();
    
    if (error) {
      showNotification('error', 'Failed to load pending accounts');
      setLoading(false);
      return;
    }

    setPendingAccounts(data || []);
    setLoading(false);
  };

  const handleApprove = (userId, userName) => {
    // Show confirmation modal instead of browser alert
    setConfirmModal({ type: 'approve', userId, userName });
  };

  const handleReject = (userId, userName) => {
    // Show confirmation modal instead of browser alert
    setConfirmModal({ type: 'reject', userId, userName });
  };

  const confirmAction = async () => {
    if (!confirmModal) return;

    const { type, userId, userName } = confirmModal;
    setProcessing(userId);
    setConfirmModal(null); // Close modal

    if (type === 'approve') {
      const { data, error } = await approveAccount(userId);

      if (error) {
        showNotification('error', `Failed to approve ${userName}'s account`);
        setProcessing(null);
        return;
      }

      showNotification('success', `✅ ${userName}'s account has been approved!`);
      setPendingAccounts(prev => prev.filter(acc => acc.user_id !== userId));
      setProcessing(null);
    } else if (type === 'reject') {
      const { data, error } = await rejectAccount(userId);

      if (error) {
        showNotification('error', `Failed to reject ${userName}'s account`);
        setProcessing(null);
        return;
      }

      showNotification('success', `❌ ${userName}'s account has been rejected`);
      setPendingAccounts(prev => prev.filter(acc => acc.user_id !== userId));
      setProcessing(null);
    }
  };

  const cancelAction = () => {
    setConfirmModal(null);
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000); // Auto-hide after 5 seconds
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'teacher':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const AdminProfile = () => {
    navigate("/adminprofile");
  };



  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 text-white rounded-xl p-2">
                <AcademicCapIcon className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AutiSync
              </h1>
            </div>
            
           <nav className="hidden md:flex space-x-8">
                    <a href="/tracking" className="text-gray-600 text-lg hover:text-blue-600 font-semibold  transition-colors">
                      Dashboard
                    </a>
                    <a href="/activities" className="text-gray-600 text-lg hover:text-blue-600 font-semibold  transition-colors">
                      Activities
                    </a>
                    
                    <a href="/alarmingemotions" className="text-gray-600 text-lg hover:text-blue-600 font-semibold transition-colors">
                      Expression Wall
                    </a>
                    <a href="/pending-accounts" className="text-gray-600 text-lg hover:text-blue-600 font-semibold transition-colors flex items-center">
                      Pending Accounts
                    </a>
                  </nav>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={AdminProfile}
                className="cursor-pointer -my-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-1 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <img
                  src="/assets/kidprofile1.jpg"
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover"
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification Banner */}
        {notification && (
        <div className={`mb-6 p-4 rounded-lg border-2 ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-300 text-green-800' 
            : 'bg-red-50 border-red-300 text-red-800'
        } animate-fade-in`}>
          <div className="flex items-center justify-between">
            <p className="font-semibold">{notification.message}</p>
            <button 
              onClick={() => setNotification(null)}
              className="text-xl hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Account Approval Management</h1>
              <p className="text-lg text-gray-600">Review and manage pending admin and teacher account registrations</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="bg-white rounded-xl shadow-lg px-6 py-4 border-2 border-blue-200">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pending Approvals</p>
                <p className="text-4xl font-bold text-blue-600 text-center mt-1">{pendingAccounts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts List Card */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
          {pendingAccounts.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-block p-6 bg-green-50 rounded-full mb-4">
                <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                All Caught Up!
              </h3>
              <p className="text-gray-600 text-lg">
                There are no pending account approvals at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAccounts.map((account) => (
                <div 
                  key={account.user_id}
                  className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:bg-white transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0">
                          {account.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-1">
                            {account.full_name || 'No Name Provided'}
                          </h3>
                          <p className="text-gray-600 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {account.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {/* Role Badge */}
                        <div className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 flex items-center gap-2 ${getRoleBadgeColor(account.role)}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {account.role?.charAt(0).toUpperCase() + account.role?.slice(1)}
                        </div>

                        {/* Registration Date */}
                        <div className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border-2 border-gray-200 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Registered {formatDate(account.created_at)}
                        </div>

                        {/* Functional Level (if teacher) */}
                        {account.functional_level && (
                          <div className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-50 text-amber-700 border-2 border-amber-200 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Level: {account.functional_level}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 lg:border-l-2 lg:border-gray-200 lg:pl-6">
                      <button
                        onClick={() => handleApprove(account.user_id, account.full_name)}
                        disabled={processing === account.user_id}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-2 min-w-[130px] justify-center"
                      >
                        {processing === account.user_id ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            <span>Processing</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Approve</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleReject(account.user_id, account.full_name)}
                        disabled={processing === account.user_id}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-2 min-w-[130px] justify-center"
                      >
                        {processing === account.user_id ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            <span>Processing</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Reject</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black-500 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in-scale">
            {/* Modal Header */}
            <div className={`px-6 py-4 rounded-t-2xl ${
              confirmModal.type === 'approve' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                : 'bg-gradient-to-r from-red-500 to-rose-600'
            }`}>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {confirmModal.type === 'approve' ? (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Approve Account
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Reject Account
                  </>
                )}
              </h3>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              <p className="text-gray-700 text-lg mb-4">
                {confirmModal.type === 'approve' 
                  ? 'Are you sure you want to approve this account?' 
                  : 'Are you sure you want to reject this account?'}
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-sm text-gray-600 mb-1">Account Holder:</p>
                <p className="text-lg font-semibold text-gray-800">{confirmModal.userName}</p>
              </div>

              {confirmModal.type === 'reject' && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">
                    ⚠️ <strong>Warning:</strong> The user will need to contact support to resolve this.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <button
                onClick={cancelAction}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`px-6 py-2.5 font-semibold rounded-lg transition-colors duration-200 ${
                  confirmModal.type === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {confirmModal.type === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingAccounts;

