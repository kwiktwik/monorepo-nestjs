import { useState, useEffect } from 'react';
import {
  Flag,
  FlaskConical,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { useAdminApi } from '../hooks/useAdminApi';

interface FeatureFlag {
  id: number;
  key: string;
  appId: string;
  description: string | null;
  isEnabled: boolean;
  defaultValue: any;
  createdAt: string;
  updatedAt: string;
}

interface Cohort {
  name: string;
  weight: number;
  config?: Record<string, unknown>;
}

interface Experiment {
  id: number;
  name: string;
  appId: string;
  featureFlagId: number | null;
  status: 'draft' | 'running' | 'paused' | 'concluded';
  trafficAllocation: number;
  startDate?: string;
  endDate?: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  cohorts: Cohort[];
}

interface CohortStats {
  name: string;
  usersExposed: number;
  conversions: number;
  conversionRate: number;
}

interface ExperimentResults {
  experimentId: number;
  experimentName: string;
  status: string;
  cohorts: CohortStats[];
  winner?: string;
  generatedAt: string;
}

type TabType = 'flags' | 'experiments';

export default function FeatureToggle() {
  const [activeTab, setActiveTab] = useState<TabType>('flags');
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedExperiment, setExpandedExperiment] = useState<number | null>(
    null,
  );
  const [experimentResults, setExperimentResults] = useState<
    Record<number, ExperimentResults>
  >({});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'flag' | 'experiment'>('flag');
  const [editingItem, setEditingItem] = useState<
    FeatureFlag | Experiment | null
  >(null);

  const { fetchApi } = useAdminApi();

  // Fetch data on mount and tab change
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'flags') {
        const data = await fetchApi<{ flags?: FeatureFlag[] }>(
          '/feature-toggle/flags',
        );
        setFeatureFlags(data.flags || []);
      } else {
        const data = await fetchApi<{ experiments?: Experiment[] }>(
          '/feature-toggle/experiments',
        );
        setExperiments(data.experiments || []);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadExperimentResults = async (experimentId: number) => {
    try {
      const results = await fetchApi<ExperimentResults>(
        `/feature-toggle/experiments/${experimentId}/results`,
      );
      setExperimentResults((prev) => ({ ...prev, [experimentId]: results }));
    } catch (err) {
      console.error('Failed to load experiment results:', err);
    }
  };

  const toggleExperimentExpand = (experimentId: number) => {
    if (expandedExperiment === experimentId) {
      setExpandedExperiment(null);
    } else {
      setExpandedExperiment(experimentId);
      if (!experimentResults[experimentId]) {
        loadExperimentResults(experimentId);
      }
    }
  };

  const handleToggleFlag = async (flag: FeatureFlag) => {
    try {
      await fetchApi(`/feature-toggle/flags/${flag.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isEnabled: !flag.isEnabled }),
      });
      loadData();
    } catch (err) {
      console.error('Failed to toggle flag:', err);
    }
  };

  const handleDeleteFlag = async (id: number) => {
    if (!confirm('Are you sure you want to delete this feature flag?')) return;
    try {
      await fetchApi(`/feature-toggle/flags/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error('Failed to delete flag:', err);
    }
  };

  const handleDeleteExperiment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this experiment?')) return;
    try {
      await fetchApi(`/feature-toggle/experiments/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error('Failed to delete experiment:', err);
    }
  };

  const handleUpdateExperimentStatus = async (
    experimentId: number,
    status: Experiment['status'],
  ) => {
    try {
      await fetchApi(`/feature-toggle/experiments/${experimentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      loadData();
    } catch (err) {
      console.error('Failed to update experiment status:', err);
    }
  };

  const openCreateModal = (type: 'flag' | 'experiment') => {
    setModalType(type);
    setEditingItem(null);
    setShowModal(true);
  };

  const openEditModal = (
    item: FeatureFlag | Experiment,
    type: 'flag' | 'experiment',
  ) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSave = async (data: any) => {
    try {
      if (modalType === 'flag') {
        if (editingItem && 'key' in editingItem) {
          await fetchApi(`/feature-toggle/flags/${editingItem.id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
          });
        } else {
          await fetchApi('/feature-toggle/flags', {
            method: 'POST',
            body: JSON.stringify(data),
          });
        }
      } else {
        if (editingItem && 'cohorts' in editingItem) {
          await fetchApi(`/feature-toggle/experiments/${editingItem.id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
          });
        } else {
          await fetchApi('/feature-toggle/experiments', {
            method: 'POST',
            body: JSON.stringify(data),
          });
        }
      }
      closeModal();
      loadData();
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Failed to save. Please check the console for details.');
    }
  };

  const filteredFlags = featureFlags.filter(
    (flag) =>
      flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.appId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredExperiments = experiments.filter(
    (exp) =>
      exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.appId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'draft':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'concluded':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white/90">
            Feature Management
          </h2>
          <p className="text-sm text-white/50">
            Manage feature flags and A/B experiments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-black/20 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-white/30"
            />
          </div>
          <button
            onClick={() =>
              openCreateModal(activeTab === 'flags' ? 'flag' : 'experiment')
            }
            className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create {activeTab === 'flags' ? 'Flag' : 'Experiment'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-white/5">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('flags')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'flags'
                ? 'border-primary text-white'
                : 'border-transparent text-white/50 hover:text-white/70'
            }`}
          >
            <Flag className="w-4 h-4" />
            Feature Flags ({featureFlags.length})
          </button>
          <button
            onClick={() => setActiveTab('experiments')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'experiments'
                ? 'border-primary text-white'
                : 'border-transparent text-white/50 hover:text-white/70'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            Experiments ({experiments.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white/50">Loading...</div>
          </div>
        ) : activeTab === 'flags' ? (
          <div className="space-y-3">
            {filteredFlags.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <Flag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No feature flags found</p>
              </div>
            ) : (
              filteredFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="glass-panel rounded-lg p-4 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        flag.isEnabled
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      <Flag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{flag.key}</h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            flag.isEnabled
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {flag.isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-sm text-white/50">{flag.appId}</p>
                      {flag.description && (
                        <p className="text-xs text-white/40 mt-1">
                          {flag.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleFlag(flag)}
                      className={`p-2 rounded-lg transition-all ${
                        flag.isEnabled
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                      }`}
                      title={flag.isEnabled ? 'Disable' : 'Enable'}
                    >
                      {flag.isEnabled ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal(flag, 'flag')}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFlag(flag.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExperiments.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No experiments found</p>
              </div>
            ) : (
              filteredExperiments.map((exp) => (
                <div key={exp.id} className="space-y-2">
                  <div className="glass-panel rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(
                            exp.status,
                          )}`}
                        >
                          <FlaskConical className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">
                              {exp.name}
                            </h3>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(
                                exp.status,
                              )}`}
                            >
                              {exp.status}
                            </span>
                          </div>
                          <p className="text-sm text-white/50">{exp.appId}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-white/40">
                            <span>Traffic: {exp.trafficAllocation}%</span>
                            {exp.startDate && (
                              <span>
                                Start:{' '}
                                {new Date(exp.startDate).toLocaleDateString()}
                              </span>
                            )}
                            {exp.endDate && (
                              <span>
                                End:{' '}
                                {new Date(exp.endDate).toLocaleDateString()}
                              </span>
                            )}
                            <span>{exp.cohorts.length} cohorts</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {exp.status === 'running' && (
                          <button
                            onClick={() =>
                              handleUpdateExperimentStatus(exp.id, 'paused')
                            }
                            className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all"
                            title="Pause"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        {exp.status === 'paused' && (
                          <button
                            onClick={() =>
                              handleUpdateExperimentStatus(exp.id, 'running')
                            }
                            className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
                            title="Resume"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {exp.status === 'draft' && (
                          <button
                            onClick={() =>
                              handleUpdateExperimentStatus(exp.id, 'running')
                            }
                            className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
                            title="Start"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {(exp.status === 'running' ||
                          exp.status === 'paused') && (
                          <button
                            onClick={() =>
                              handleUpdateExperimentStatus(exp.id, 'concluded')
                            }
                            className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                            title="Conclude"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => toggleExperimentExpand(exp.id)}
                          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
                          title="View Results"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(exp, 'experiment')}
                          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExperiment(exp.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleExperimentExpand(exp.id)}
                          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
                        >
                          {expandedExperiment === exp.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Experiment Details */}
                  {expandedExperiment === exp.id && (
                    <div className="glass-panel rounded-lg p-4 ml-4">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Cohorts */}
                        <div>
                          <h4 className="text-sm font-semibold text-white/80 mb-3">
                            Cohorts
                          </h4>
                          <div className="space-y-2">
                            {exp.cohorts.map((cohort, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 bg-black/20 rounded-lg"
                              >
                                <span className="text-sm text-white">
                                  {cohort.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary rounded-full"
                                      style={{ width: `${cohort.weight}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-white/50 w-10 text-right">
                                    {cohort.weight}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Results */}
                        <div>
                          <h4 className="text-sm font-semibold text-white/80 mb-3">
                            Results
                            {experimentResults[exp.id] && (
                              <span className="text-xs text-white/40 ml-2">
                                (Updated:{' '}
                                {new Date(
                                  experimentResults[exp.id].generatedAt,
                                ).toLocaleString()}
                                )
                              </span>
                            )}
                          </h4>
                          {experimentResults[exp.id] ? (
                            <div className="space-y-2">
                              {experimentResults[exp.id].cohorts.map(
                                (stat, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-black/20 rounded-lg"
                                  >
                                    <span className="text-sm text-white">
                                      {stat.name}
                                    </span>
                                    <div className="text-right">
                                      <div className="text-sm text-white">
                                        {stat.usersExposed.toLocaleString()}{' '}
                                        users
                                      </div>
                                      <div className="text-xs text-white/50">
                                        {stat.conversions.toLocaleString()}{' '}
                                        conv. ({stat.conversionRate.toFixed(2)}
                                        %)
                                      </div>
                                    </div>
                                  </div>
                                ),
                              )}
                              {experimentResults[exp.id].winner && (
                                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg mt-3">
                                  <AlertCircle className="w-4 h-4 text-green-400" />
                                  <span className="text-sm text-green-400">
                                    Winner: {experimentResults[exp.id].winner}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-white/40">
                              <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">
                                No results available yet
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          type={modalType}
          editingItem={editingItem}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// Modal Component
interface ModalProps {
  type: 'flag' | 'experiment';
  editingItem: FeatureFlag | Experiment | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

function Modal({ type, editingItem, onClose, onSave }: ModalProps) {
  const [formData, setFormData] = useState<any>(() => {
    if (editingItem) {
      if ('cohorts' in editingItem) {
        // Experiment
        return {
          name: editingItem.name,
          appId: editingItem.appId,
          featureFlagId: editingItem.featureFlagId,
          trafficAllocation: editingItem.trafficAllocation,
          startDate: editingItem.startDate?.split('T')[0],
          endDate: editingItem.endDate?.split('T')[0],
          cohorts: editingItem.cohorts,
        };
      } else {
        // Feature Flag
        return {
          key: editingItem.key,
          appId: editingItem.appId,
          description: editingItem.description,
          isEnabled: editingItem.isEnabled,
          defaultValue: editingItem.defaultValue,
        };
      }
    }
    return type === 'experiment'
      ? {
          appId: '',
          name: '',
          trafficAllocation: 100,
          cohorts: [
            { name: 'Control', weight: 50 },
            { name: 'Variant', weight: 50 },
          ],
        }
      : {
          key: '',
          appId: '',
          description: '',
          isEnabled: false,
          defaultValue: { enabled: false },
        };
  });

  const [newCohort, setNewCohort] = useState({ name: '', weight: 0 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addCohort = () => {
    if (newCohort.name && newCohort.weight > 0) {
      setFormData((prev: any) => ({
        ...prev,
        cohorts: [...(prev.cohorts || []), { ...newCohort }],
      }));
      setNewCohort({ name: '', weight: 0 });
    }
  };

  const removeCohort = (idx: number) => {
    setFormData((prev: any) => ({
      ...prev,
      cohorts: prev.cohorts.filter((_: any, i: number) => i !== idx),
    }));
  };

  const updateCohort = (idx: number, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      cohorts: prev.cohorts.map((c: any, i: number) =>
        i === idx ? { ...c, [field]: value } : c,
      ),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-panel rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {editingItem ? 'Edit' : 'Create'}{' '}
            {type === 'flag' ? 'Feature Flag' : 'Experiment'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {type === 'flag' ? (
            <>
              <div>
                <label className="block text-sm text-white/70 mb-1">
                  Key *
                </label>
                <input
                  type="text"
                  value={formData.key || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, key: e.target.value })
                  }
                  disabled={!!editingItem}
                  placeholder="e.g., new-checkout-flow"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">
                  App ID *
                </label>
                <input
                  type="text"
                  value={formData.appId || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, appId: e.target.value })
                  }
                  placeholder="e.g., com.kwiktwik.app"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of this feature flag"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isEnabled"
                  checked={formData.isEnabled || false}
                  onChange={(e) =>
                    setFormData({ ...formData, isEnabled: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-white/30 bg-black/20 text-primary focus:ring-primary/50"
                />
                <label htmlFor="isEnabled" className="text-sm text-white/70">
                  Enabled
                </label>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm text-white/70 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Checkout Button Color Test"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">
                  App ID *
                </label>
                <input
                  type="text"
                  value={formData.appId || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, appId: e.target.value })
                  }
                  placeholder="e.g., com.kwiktwik.app"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">
                  Feature Flag ID
                </label>
                <input
                  type="number"
                  value={formData.featureFlagId || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featureFlagId: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="Optional: Link to a feature flag"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">
                  Traffic Allocation (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.trafficAllocation || 100}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      trafficAllocation: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/70 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Cohorts */}
              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Cohorts
                </label>
                <div className="space-y-2">
                  {formData.cohorts?.map((cohort: Cohort, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={cohort.name}
                        onChange={(e) =>
                          updateCohort(idx, 'name', e.target.value)
                        }
                        placeholder="Cohort name"
                        className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={cohort.weight}
                        onChange={(e) =>
                          updateCohort(
                            idx,
                            'weight',
                            parseInt(e.target.value) || 0,
                          )
                        }
                        placeholder="Weight %"
                        className="w-24 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <button
                        type="button"
                        onClick={() => removeCohort(idx)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={newCohort.name}
                    onChange={(e) =>
                      setNewCohort({ ...newCohort, name: e.target.value })
                    }
                    placeholder="New cohort name"
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newCohort.weight || ''}
                    onChange={(e) =>
                      setNewCohort({
                        ...newCohort,
                        weight: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="Weight %"
                    className="w-24 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={addCohort}
                    className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </form>

        <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold transition-all"
          >
            {editingItem ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
