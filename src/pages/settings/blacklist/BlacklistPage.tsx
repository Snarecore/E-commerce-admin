import React, { useState } from 'react';
import { FiShield, FiPlus, FiSearch, FiCheckCircle, FiXCircle, FiUser, FiPhone, FiGlobe } from 'react-icons/fi';
import toast from 'react-hot-toast';

export interface IBlacklistItem {
  id: string;
  subjectType: 'PHONE' | 'EXACT_IP' | 'CIDR';
  customerName?: string;
  customerEmail?: string;
  displayValue?: string;
  valueHash?: string;
  ipAddress?: string;
  networkAddress?: string;
  prefixLength?: number;
  severity: 'HARD_BLOCK' | 'SUSPICIOUS_FLAG';
  reasonCode: string;
  note?: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  createdByAdminId: string;
  createdAt: string;
}

const mockBlacklist: IBlacklistItem[] = [
  {
    id: 'bl-001',
    subjectType: 'PHONE',
    customerName: 'Qligence Limited testing',
    customerEmail: 'qligence.test@gmail.com',
    displayValue: '01765753380 (+8801765753380)',
    valueHash: 'a8f9c73e102b4d99e01827cf918a',
    severity: 'HARD_BLOCK',
    reasonCode: 'FRAUD_HISTORY',
    note: 'Repeated fake orders and chargebacks',
    status: 'ACTIVE',
    createdByAdminId: 'Admin (System)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bl-002',
    subjectType: 'EXACT_IP',
    customerName: 'Automated Bot Spammer',
    customerEmail: 'bot.net@proxy.org',
    ipAddress: '103.145.78.53',
    severity: 'HARD_BLOCK',
    reasonCode: 'SUSPICIOUS_IP',
    note: 'Automated bot checkout spammer',
    status: 'ACTIVE',
    createdByAdminId: 'Super Admin',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'bl-003',
    subjectType: 'CIDR',
    customerName: 'Dhaka Subnet Range',
    networkAddress: '103.145.64.0',
    prefixLength: 20,
    severity: 'SUSPICIOUS_FLAG',
    reasonCode: 'POLICY_VIOLATION',
    note: 'Subnet flagged for manual review',
    status: 'ACTIVE',
    createdByAdminId: 'Risk Manager',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export default function BlacklistPage() {
  const [items, setItems] = useState<IBlacklistItem[]>(mockBlacklist);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubjectType, setNewSubjectType] = useState<'PHONE' | 'EXACT_IP' | 'CIDR'>('PHONE');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newInputValue, setNewInputValue] = useState('');
  const [newPrefixLength, setNewPrefixLength] = useState<number>(24);
  const [newSeverity, setNewSeverity] = useState<'HARD_BLOCK' | 'SUSPICIOUS_FLAG'>('HARD_BLOCK');
  const [newReason, setNewReason] = useState('ADMIN_REQUEST');
  const [newNote, setNewNote] = useState('');

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const rawVal = newInputValue.trim();
    if (!rawVal) {
      toast.error('Please enter a valid Phone number, IP, or Subnet address.');
      return;
    }

    const simulatedHash = Array.from(rawVal)
      .map((c) => c.charCodeAt(0).toString(16))
      .join('')
      .padEnd(32, '0')
      .slice(0, 32);

    const newItem: IBlacklistItem = {
      id: `bl-${Date.now()}`,
      subjectType: newSubjectType,
      customerName: newCustomerName.trim() || undefined,
      customerEmail: newCustomerEmail.trim() || undefined,
      displayValue: newSubjectType === 'PHONE' ? rawVal : undefined,
      valueHash: newSubjectType === 'PHONE' ? simulatedHash : undefined,
      ipAddress: newSubjectType === 'EXACT_IP' ? rawVal : undefined,
      networkAddress: newSubjectType === 'CIDR' ? rawVal : undefined,
      prefixLength: newSubjectType === 'CIDR' ? newPrefixLength : undefined,
      severity: newSeverity,
      reasonCode: newReason,
      note: newNote,
      status: 'ACTIVE',
      createdByAdminId: 'Current Admin',
      createdAt: new Date().toISOString(),
    };

    setItems([newItem, ...items]);
    setIsAddModalOpen(false);
    setNewCustomerName('');
    setNewCustomerEmail('');
    setNewInputValue('');
    setNewNote('');
    toast.success(`Blacklist entry for ${newCustomerName || rawVal} added successfully!`);
  };

  const handleRevoke = (id: string) => {
    if (window.confirm('Are you sure you want to revoke this blacklist entry?')) {
      setItems(
        items.map((item) => (item.id === id ? { ...item, status: 'REVOKED' } : item))
      );
      toast.success('Blacklist entry revoked.');
    }
  };

  const filteredItems = items.filter((item) => {
    const isStatusMatch =
      activeTab === 'ACTIVE' ? item.status === 'ACTIVE' : item.status !== 'ACTIVE';

    const isTypeMatch = typeFilter === 'ALL' || item.subjectType === typeFilter;

    const query = searchTerm.toLowerCase();
    const isSearchMatch =
      !query ||
      (item.customerName && item.customerName.toLowerCase().includes(query)) ||
      (item.customerEmail && item.customerEmail.toLowerCase().includes(query)) ||
      item.reasonCode.toLowerCase().includes(query) ||
      (item.note && item.note.toLowerCase().includes(query)) ||
      (item.displayValue && item.displayValue.toLowerCase().includes(query)) ||
      (item.valueHash && item.valueHash.toLowerCase().includes(query)) ||
      (item.ipAddress && item.ipAddress.includes(query)) ||
      (item.networkAddress && item.networkAddress.includes(query));

    return isStatusMatch && isTypeMatch && isSearchMatch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <FiShield className="w-6 h-6 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">Phone & IP Risk Protection</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage blocked phone numbers, customer accounts, exact IP addresses, and CIDR subnets to protect your store from fraud.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md transition-colors text-sm"
        >
          <FiPlus className="w-4 h-4" /> Add Blacklist Entry
        </button>
      </div>

      {/* Filter & Controls bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 border border-gray-200 rounded-lg">
        {/* Active vs History Tab Pills */}
        <div className="flex bg-gray-100 p-1 rounded-md max-w-xs">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'ACTIVE'
                ? 'bg-white text-gray-900 border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active Rules ({items.filter((i) => i.status === 'ACTIVE').length})
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'HISTORY'
                ? 'bg-white text-gray-900 border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Revoked / Expired ({items.filter((i) => i.status !== 'ACTIVE').length})
          </button>
        </div>

        {/* Search & Subject Type Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search customer, phone, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-1.5 px-3 text-sm border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="ALL">All Types</option>
            <option value="PHONE">Phone Number</option>
            <option value="EXACT_IP">Exact IP</option>
            <option value="CIDR">CIDR Subnet</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
            <tr>
              <th className="px-4 py-3">Subject Type</th>
              <th className="px-4 py-3">Customer / Account</th>
              <th className="px-4 py-3">Target Phone / IP</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Reason & Note</th>
              <th className="px-4 py-3">Added By</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500 text-sm">
                  No blacklist rules found matching your search.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${
                        item.subjectType === 'PHONE'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : item.subjectType === 'EXACT_IP'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}
                    >
                      {item.subjectType === 'PHONE' && <FiPhone className="w-3 h-3" />}
                      {(item.subjectType === 'EXACT_IP' || item.subjectType === 'CIDR') && <FiGlobe className="w-3 h-3" />}
                      {item.subjectType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-900">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900 text-sm">
                      <FiUser className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {item.customerName || 'N/A (Guest / Unassigned)'}
                    </div>
                    {item.customerEmail && (
                      <div className="text-xs text-gray-500 pl-5">{item.customerEmail}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-900">
                    {item.subjectType === 'PHONE' && (
                      <div>
                        <p className="font-bold text-gray-900 text-sm font-mono">{item.displayValue || item.valueHash}</p>
                        {item.valueHash && (
                          <p className="text-[10px] text-gray-400 font-mono">HMAC: {item.valueHash.slice(0, 16)}...</p>
                        )}
                      </div>
                    )}
                    {item.subjectType === 'EXACT_IP' && (
                      <span className="font-mono font-bold text-sm text-gray-900">{item.ipAddress}</span>
                    )}
                    {item.subjectType === 'CIDR' && (
                      <span className="font-mono font-bold text-sm text-gray-900">{`${item.networkAddress}/${item.prefixLength}`}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        item.severity === 'HARD_BLOCK'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {item.severity === 'HARD_BLOCK' ? 'Hard Block (403)' : 'Suspicious Flag'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900 text-xs">{item.reasonCode}</div>
                    {item.note && <div className="text-xs text-gray-500 truncate max-w-xs">{item.note}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{item.createdByAdminId}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${
                        item.status === 'ACTIVE' ? 'text-green-700' : 'text-gray-500'
                      }`}
                    >
                      {item.status === 'ACTIVE' ? <FiCheckCircle className="w-3.5 h-3.5" /> : <FiXCircle className="w-3.5 h-3.5" />}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleRevoke(item.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold border border-red-200 hover:border-red-300 px-2 py-1 rounded transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-gray-300 rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Add Blacklist Rule</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Subject Type</label>
                <select
                  value={newSubjectType}
                  onChange={(e) => setNewSubjectType(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="PHONE">Phone Number</option>
                  <option value="EXACT_IP">Exact IP Address</option>
                  <option value="CIDR">CIDR Subnet Block (/16 to /32)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Customer Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Qligence Limited testing"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Customer Email (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. customer@gmail.com"
                  value={newCustomerEmail}
                  onChange={(e) => setNewCustomerEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {newSubjectType === 'PHONE'
                    ? 'Target Phone Number (e.g. 01765753380)'
                    : newSubjectType === 'EXACT_IP'
                    ? 'Target IP Address (e.g. 103.145.78.53)'
                    : 'Target Network Address (e.g. 103.145.64.0)'}
                </label>
                <input
                  type="text"
                  placeholder={
                    newSubjectType === 'PHONE'
                      ? '01765753380'
                      : newSubjectType === 'EXACT_IP'
                      ? '103.145.78.53'
                      : '103.145.64.0'
                  }
                  value={newInputValue}
                  onChange={(e) => setNewInputValue(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              {newSubjectType === 'CIDR' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Prefix Length (/16 to /32)</label>
                  <input
                    type="number"
                    min={16}
                    max={32}
                    value={newPrefixLength}
                    onChange={(e) => setNewPrefixLength(parseInt(e.target.value, 10))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Severity</label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="HARD_BLOCK">Hard Block (Rejects order with 403)</option>
                  <option value="SUSPICIOUS_FLAG">Suspicious Flag (+40 Risk Score)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reason Code</label>
                <select
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="FRAUD_HISTORY">Fraud History</option>
                  <option value="MULTIPLE_RTO">Multiple RTO Returns</option>
                  <option value="CHARGEBACK">Chargeback Claim</option>
                  <option value="SUSPICIOUS_IP">Suspicious IP Traffic</option>
                  <option value="ADMIN_REQUEST">Admin Request</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Internal Admin Note</label>
                <textarea
                  rows={2}
                  placeholder="Optional details regarding this restriction..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Save Blacklist Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
