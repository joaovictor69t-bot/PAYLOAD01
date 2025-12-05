import React, { useState, useEffect } from 'react';
import { User, PageView, PayloadItem } from './types';
import { getStoredUsers, saveUser, deleteUser, getAllPayloads, savePayload, getPayloadsByUser } from './services/storage';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { Box, User as UserIcon, LogOut, ShieldAlert, Plus, Trash2, XCircle, Clock, List, ArrowLeft, TrendingUp, Calendar, Wallet, Camera, Image as ImageIcon, Search } from 'lucide-react';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'EVRI01';

// --- Types for Form ---
interface PayloadFormData {
  type: 'individual' | 'daily';
  date: string;
  
  // Individual
  driverId: string;
  parcelCount: string;
  collectionCount: string;
  
  // Daily
  isTwoIds: boolean;
  id1: string;
  count1: string;
  id2: string;
  count2: string;
  
  photo: string | null; // Base64 string
}

const initialFormData: PayloadFormData = {
  type: 'individual',
  date: new Date().toISOString().split('T')[0],
  driverId: '',
  parcelCount: '',
  collectionCount: '',
  isTwoIds: false,
  id1: '',
  count1: '',
  id2: '',
  count2: '',
  photo: null
};

// --- Sub Components ---

interface LoginViewProps {
  username: string;
  setUsername: (s: string) => void;
  password: string;
  setPassword: (s: string) => void;
  handleLogin: (e: React.FormEvent) => void;
  error: string;
  onNavigateRegister: () => void;
  onNavigateAdmin: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ 
  username, setUsername, password, setPassword, handleLogin, error, onNavigateRegister, onNavigateAdmin
}) => (
  <div className="min-h-screen bg-primary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="flex justify-center">
        <div className="h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
          <Box className="h-8 w-8 text-white" />
        </div>
      </div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-primary-900">
        Entrar no Payload
      </h2>
      <p className="mt-2 text-center text-sm text-primary-600">
        Gerenciamento seguro e eficiente
      </p>
    </div>

    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-primary-100">
        <form className="space-y-6" onSubmit={handleLogin}>
          <Input 
            label="Usuário" 
            type="text" 
            value={username} 
            onChange={e => setUsername(e.target.value)}
            placeholder="Digite seu usuário"
            required
          />
          <Input 
            label="Senha" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            placeholder="Digite sua senha"
            required
          />

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ShieldAlert className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <Button type="submit">
            Entrar
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Opções de Acesso
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={onNavigateRegister}>
              Criar Conta
            </Button>
            <Button variant="secondary" onClick={onNavigateAdmin} className="!bg-gray-100 !text-gray-700 hover:!bg-gray-200">
              Admin Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface AdminLoginViewProps {
  username: string;
  setUsername: (s: string) => void;
  password: string;
  setPassword: (s: string) => void;
  handleLogin: (e: React.FormEvent) => void;
  error: string;
  onBack: () => void;
}

const AdminLoginView: React.FC<AdminLoginViewProps> = ({ 
  username, setUsername, password, setPassword, handleLogin, error, onBack
}) => (
  <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="flex justify-center">
        <div className="h-16 w-16 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
          <ShieldAlert className="h-8 w-8 text-white" />
        </div>
      </div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
        Área Administrativa
      </h2>
      <p className="mt-2 text-center text-sm text-green-400">
        Acesso restrito a administradores
      </p>
    </div>

    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-700">
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Usuário Admin
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-700 text-white placeholder-gray-400"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Senha Admin
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-700 text-white placeholder-gray-400"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-900/50 p-4 border border-red-800">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ShieldAlert className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-300">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="!bg-green-600 hover:!bg-green-700">
            Acessar Painel
          </Button>
          
          <button
            type="button"
            onClick={onBack}
            className="w-full flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Login de Usuário
          </button>
        </form>
      </div>
    </div>
  </div>
);

interface RegisterViewProps {
  username: string;
  setUsername: (s: string) => void;
  password: string;
  setPassword: (s: string) => void;
  handleRegister: (e: React.FormEvent) => void;
  error: string;
  onNavigateLogin: () => void;
}

const RegisterView: React.FC<RegisterViewProps> = ({ 
  username, setUsername, password, setPassword, handleRegister, error, onNavigateLogin 
}) => (
  <div className="min-h-screen bg-primary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 className="mt-6 text-center text-3xl font-extrabold text-primary-900">
        Criar Conta
      </h2>
    </div>

    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-primary-100">
        <form className="space-y-6" onSubmit={handleRegister}>
          <Input 
            label="Novo Usuário" 
            type="text" 
            value={username} 
            onChange={e => setUsername(e.target.value)}
            required
          />
          <Input 
            label="Nova Senha" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit">
            Cadastrar
          </Button>
          
          <Button type="button" variant="secondary" onClick={onNavigateLogin}>
            Voltar para Login
          </Button>
        </form>
      </div>
    </div>
  </div>
);

interface HistoryViewProps {
  currentUser: User | null;
  payloadList: PayloadItem[];
  onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ currentUser, payloadList, onBack }) => {
  // Default to current month YYYY-MM
  const today = new Date();
  const currentMonthStr = today.toISOString().slice(0, 7);
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [viewPhotoUrl, setViewPhotoUrl] = useState<string | null>(null);

  // Filter payloads by month
  const filteredPayloads = payloadList.filter(item => item.date.startsWith(selectedMonth));
  
  // Sort descending by date
  const sortedPayloads = [...filteredPayloads].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalMonthValue = sortedPayloads.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={onBack} className="mr-3 p-2 rounded-full hover:bg-gray-100 text-gray-500">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Histórico Completo</h1>
          </div>
          <div className="text-sm text-gray-500">
            {currentUser?.username}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center w-full sm:w-auto">
             <Calendar className="h-5 w-5 text-gray-400 mr-2" />
             <input 
                type="month" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
             />
          </div>
          <div className="flex items-center bg-green-50 px-4 py-2 rounded-lg border border-green-100">
            <span className="text-sm font-medium text-green-800 mr-2">Total no Mês:</span>
            <span className="text-lg font-bold text-green-700">
              {totalMonthValue.toLocaleString('pt-BR', { style: 'currency', currency: 'GBP' })}
            </span>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {sortedPayloads.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <Search className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Nenhum registro encontrado para este mês.</p>
            </div>
          ) : (
            sortedPayloads.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between">
                  
                  {/* Left: Date & Main Info */}
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide mr-2 
                        ${item.type === 'individual' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {item.type === 'individual' ? 'Individual' : 'Diária'}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {item.date.split('-').reverse().join('/')}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1">
                      {/* IDs */}
                      <div className="text-sm text-gray-800">
                        <span className="font-semibold text-gray-500 text-xs uppercase">IDs Utilizados:</span>
                        <div className="font-medium ml-1 inline-block">
                          {item.type === 'individual' ? (
                            <span>{item.details.driverId || 'N/A'}</span>
                          ) : (
                            <span>
                              {item.details.id1}
                              {item.details.isTwoIds && item.details.id2 ? ` & ${item.details.id2}` : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Counts */}
                      <div className="text-sm text-gray-800">
                        <span className="font-semibold text-gray-500 text-xs uppercase">Detalhes:</span>
                        <div className="ml-1 inline-block">
                          {item.type === 'individual' ? (
                             <span>{item.details.parcelCount} Parcelas • {item.details.collectionCount} Coletas</span>
                          ) : (
                             <span>
                                Total: {item.details.parcelCount} Parcelas
                                {item.details.isTwoIds && (
                                  <span className="text-xs text-gray-400 ml-1">
                                    (ID1: {item.details.count1} / ID2: {item.details.count2})
                                  </span>
                                )}
                             </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Value & Actions */}
                  <div className="flex flex-row sm:flex-col justify-between items-end min-w-[120px]">
                    <div className="text-xl font-bold text-gray-900 mb-2">
                       {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'GBP' })}
                    </div>
                    
                    {item.photoUrl ? (
                      <button 
                        onClick={() => setViewPhotoUrl(item.photoUrl!)}
                        className="flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-md transition-colors"
                      >
                        <ImageIcon className="h-4 w-4 mr-1.5" />
                        Ver Foto
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 italic flex items-center">
                        <XCircle className="h-3 w-3 mr-1" />
                        Sem foto
                      </span>
                    )}
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Photo View Modal */}
      {viewPhotoUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-4" onClick={() => setViewPhotoUrl(null)}>
          <div className="relative max-w-4xl max-h-screen">
            <button 
              onClick={() => setViewPhotoUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <XCircle className="h-8 w-8" />
            </button>
            <img src={viewPhotoUrl} alt="Comprovante" className="max-h-[85vh] max-w-full rounded-md shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};

interface UserDashboardProps {
  currentUser: User | null;
  handleLogout: () => void;
  payloadList: PayloadItem[];
  onAddPayload: (data: PayloadFormData) => void;
  onNavigateHistory: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ currentUser, handleLogout, payloadList, onAddPayload, onNavigateHistory }) => {
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<PayloadFormData>(initialFormData);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPayload(formData);
    setFormData(initialFormData);
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setShowModal(false);
  }

  // Calculate current month stats
  const now = new Date();
  const currentMonthStr = now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const currentMonthFilter = now.toISOString().slice(0, 7); // YYYY-MM
  
  const currentMonthPayloads = payloadList.filter(item => item.date.startsWith(currentMonthFilter));
  
  const totalMonth = currentMonthPayloads.reduce((acc, curr) => acc + curr.value, 0);
  const daysInMonthPassed = now.getDate();
  const dailyAverage = daysInMonthPassed > 0 ? totalMonth / daysInMonthPassed : 0;
  const monthName = now.toLocaleString('pt-BR', { month: 'long' });

  // Calculate estimated value for the form preview
  const calculateEstimate = () => {
    if (formData.type === 'individual') {
      const parcels = parseFloat(formData.parcelCount) || 0;
      const collections = parseFloat(formData.collectionCount) || 0;
      return (parcels * 1.00) + (collections * 0.80);
    } else {
      // Daily Logic
      if (!formData.isTwoIds) {
        return 180;
      }

      const c1 = parseFloat(formData.count1) || 0;
      const c2 = parseFloat(formData.count2) || 0;
      const total = c1 + c2;
      
      if (total === 0) return 0;
      if (total < 150) return 260;
      if (total <= 250) return 300;
      return 360;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative pb-10">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Box className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Payload</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                <UserIcon className="h-4 w-4 mr-2 text-primary-600" />
                {currentUser?.username}
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
          <p className="text-gray-500">Acompanhe seu desempenho em {monthName}.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Card 1: Total Month Gains */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <span className="text-primary-100 text-sm font-medium capitalize">{monthName} {now.getFullYear()}</span>
            </div>
            <div>
              <p className="text-primary-100 text-sm font-medium mb-1">Ganhos do Mês</p>
              <h3 className="text-3xl font-bold tracking-tight">
                {totalMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'GBP' })}
              </h3>
            </div>
          </div>

          {/* Card 2: Daily Average */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">
                Dia {daysInMonthPassed}
              </span>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Média Diária ({monthName})</p>
              <h3 className="text-3xl font-bold tracking-tight text-gray-900">
                {dailyAverage.toLocaleString('pt-BR', { style: 'currency', currency: 'GBP' })}
              </h3>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary-500/30 transition-all transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-6 w-6 mr-2" />
            Adicionar Novo Registro
          </button>

          <button 
            onClick={onNavigateHistory}
            className="flex items-center justify-center bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-4 rounded-xl font-medium text-lg shadow-sm transition-all transform hover:-translate-y-1"
          >
            <Clock className="h-6 w-6 mr-2 text-gray-400" />
            Ver Histórico Completo
          </button>
        </div>

      </main>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 transform transition-all scale-100 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Novo Registro</h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              
              {/* Type Switcher */}
              <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'individual' })}
                  className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all
                    ${formData.type === 'individual' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Individual
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'daily' })}
                  className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all
                    ${formData.type === 'daily' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Diária
                </button>
              </div>

              <div className="space-y-4">
                {/* Common Date Field */}
                <Input 
                  label="Data do Serviço" 
                  type="date"
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  required
                />

                {formData.type === 'individual' ? (
                  <>
                     <div className="bg-blue-50 p-3 rounded-md text-xs text-blue-700 mb-2">
                       Parcela: £1.00 | Coleta: £0.80
                     </div>
                     <Input 
                      label="ID do Usuário / Rota" 
                      value={formData.driverId} 
                      onChange={e => setFormData({...formData, driverId: e.target.value})}
                      placeholder="Identificação do entregador"
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        label="Qtd. Parcelas" 
                        type="number"
                        value={formData.parcelCount} 
                        onChange={e => setFormData({...formData, parcelCount: e.target.value})}
                        placeholder="0"
                        min="0"
                        required
                      />
                      <Input 
                        label="Qtd. Coletas" 
                        type="number"
                        value={formData.collectionCount} 
                        onChange={e => setFormData({...formData, collectionCount: e.target.value})}
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-purple-50 p-3 rounded-md text-xs text-purple-700 mb-2">
                       1 ID: £180 | 2 IDs: &lt;150: £260 | 150-250: £300 | &gt;250: £360
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            className="sr-only" 
                            checked={formData.isTwoIds}
                            onChange={(e) => setFormData({...formData, isTwoIds: e.target.checked})}
                          />
                          <div className={`block w-10 h-6 rounded-full ${formData.isTwoIds ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
                          <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${formData.isTwoIds ? 'transform translate-x-4' : ''}`}></div>
                        </div>
                        <div className="ml-3 text-gray-700 font-medium">
                          Usar 2 IDs
                        </div>
                      </label>
                    </div>

                    {formData.isTwoIds ? (
                      <div className="space-y-4">
                        <div className="p-3 border border-gray-200 rounded-lg">
                           <h4 className="text-sm font-bold text-gray-700 mb-2">ID Principal</h4>
                           <div className="grid grid-cols-2 gap-2">
                              <Input 
                                label="ID 1" 
                                value={formData.id1} 
                                onChange={e => setFormData({...formData, id1: e.target.value})}
                                placeholder="ID #1"
                                className="mb-0"
                              />
                              <Input 
                                label="Qtd. Parcelas" 
                                type="number"
                                value={formData.count1} 
                                onChange={e => setFormData({...formData, count1: e.target.value})}
                                placeholder="0"
                                className="mb-0"
                              />
                           </div>
                        </div>
                        <div className="p-3 border border-gray-200 rounded-lg">
                           <h4 className="text-sm font-bold text-gray-700 mb-2">ID Secundário</h4>
                           <div className="grid grid-cols-2 gap-2">
                              <Input 
                                label="ID 2" 
                                value={formData.id2} 
                                onChange={e => setFormData({...formData, id2: e.target.value})}
                                placeholder="ID #2"
                                className="mb-0"
                              />
                              <Input 
                                label="Qtd. Parcelas" 
                                type="number"
                                value={formData.count2} 
                                onChange={e => setFormData({...formData, count2: e.target.value})}
                                placeholder="0"
                                className="mb-0"
                              />
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                         <Input 
                            label="ID do Usuário" 
                            value={formData.id1} 
                            onChange={e => setFormData({...formData, id1: e.target.value})}
                            placeholder="ID"
                          />
                          <Input 
                            label="Qtd. Parcelas" 
                            type="number"
                            value={formData.count1} 
                            onChange={e => setFormData({...formData, count1: e.target.value})}
                            placeholder="0"
                          />
                      </div>
                    )}
                  </>
                )}

                {/* Photo Upload */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Foto do Registro
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="space-y-1 text-center">
                      {formData.photo ? (
                        <div className="relative">
                          <img src={formData.photo} alt="Preview" className="mx-auto h-32 object-contain rounded-md" />
                          <button 
                             type="button" 
                             onClick={() => setFormData({...formData, photo: null})}
                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Camera className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600 justify-center">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                              <span>Enviar uma foto</span>
                              <input 
                                type="file" 
                                className="sr-only" 
                                accept="image/*"
                                onChange={handleFileChange}
                              />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG até 5MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Total Estimate */}
                <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-200">
                  <span className="text-gray-700 font-medium">Valor Total Estimado:</span>
                  <span className="text-2xl font-bold text-primary-700">
                    {calculateEstimate().toLocaleString('pt-BR', { style: 'currency', currency: 'GBP' })}
                  </span>
                </div>

              </div>
              
              <div className="mt-8">
                <Button type="submit" className="w-full shadow-lg shadow-primary-500/30">
                  Salvar Registro
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

interface AdminDashboardProps {
  userList: User[];
  allPayloads: PayloadItem[];
  handleLogout: () => void;
  handleDeleteUser: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ userList, allPayloads, handleLogout, handleDeleteUser }) => {
  const [viewPhotoUrl, setViewPhotoUrl] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // State for month filter in admin view
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Render specific user history view
  if (selectedUser) {
    // Filter by user AND month
    const userPayloads = allPayloads.filter(item => 
      item.userId === selectedUser.id && 
      item.date.startsWith(selectedMonth)
    );
    
    // Sort by date desc
    userPayloads.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const totalMonthValue = userPayloads.reduce((acc, curr) => acc + curr.value, 0);

    return (
       <div className="min-h-screen bg-gray-100">
         <nav className="bg-gray-900 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <ShieldAlert className="h-8 w-8 text-green-500" />
                  <span className="ml-2 text-xl font-bold text-white">Payload <span className="text-green-500">ADMIN</span></span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300 text-sm">Administrador</span>
                  <button 
                    onClick={handleLogout}
                    className="p-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                    title="Sair"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                    <div className="flex items-center self-start sm:self-center">
                        <button 
                            onClick={() => setSelectedUser(null)}
                            className="mr-4 p-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Histórico <span className="text-green-600 uppercase">{selectedUser.username}</span></h2>
                        </div>
                    </div>
                    
                    {/* Month Filter */}
                     <div className="flex items-center bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                         <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                         <input 
                            type="month" 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="border-none text-gray-900 focus:ring-0 text-sm bg-white"
                         />
                         <div className="ml-4 pl-4 border-l border-gray-200">
                            <span className="text-xs text-gray-500 block uppercase">Total</span>
                            <span className="text-green-600 font-bold">
                                {totalMonthValue.toLocaleString('pt-BR', { style: 'currency', currency: 'GBP' })}
                            </span>
                         </div>
                     </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payload</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalhes</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foto</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {userPayloads.length === 0 ? (
                            <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Este usuário não possui registros para este mês.</td>
                            </tr>
                        ) : (
                            userPayloads.map((item) => (
                                <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.type === 'individual' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                    {item.type === 'individual' ? 'Individual' : 'Diária'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'GBP' })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                    {item.type === 'individual' ? (
                                        <span>{item.details.parcelCount} parcels • {item.details.collectionCount} coletas</span>
                                    ) : (
                                        <span>
                                            {item.details.parcelCount} total
                                            {item.details.isTwoIds && ` (ID1: ${item.details.count1}, ID2: ${item.details.count2})`}
                                        </span>
                                    )}
                                    <div className="text-gray-400 mt-1">
                                        IDs: {item.type === 'individual' ? item.details.driverId : `${item.details.id1} ${item.details.id2 || ''}`}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.date.split('-').reverse().join('/')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.photoUrl && (
                                    <button onClick={() => setViewPhotoUrl(item.photoUrl!)} className="text-blue-600 hover:text-blue-800 flex items-center">
                                        <ImageIcon className="h-4 w-4 mr-1" />
                                        Ver
                                    </button>
                                    )}
                                </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
          </main>

          {/* Admin Photo View Modal (Reused) */}
          {viewPhotoUrl && (
            <div className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-4" onClick={() => setViewPhotoUrl(null)}>
            <div className="relative max-w-4xl max-h-screen">
                <button 
                onClick={() => setViewPhotoUrl(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300"
                >
                <XCircle className="h-8 w-8" />
                </button>
                <img src={viewPhotoUrl} alt="Comprovante" className="max-h-[85vh] max-w-full rounded-md shadow-2xl" />
            </div>
            </div>
          )}
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <ShieldAlert className="h-8 w-8 text-green-500" />
              <span className="ml-2 text-xl font-bold text-white">Payload <span className="text-green-500">ADMIN</span></span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">Administrador</span>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Usuários Registrados</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Selecione um usuário para visualizar seu histórico individual.</p>
            </div>
            <ul className="divide-y divide-gray-200">
              {userList.length === 0 ? (
                <li className="px-4 py-8 text-center text-gray-500">Nenhum usuário encontrado.</li>
              ) : (
                userList.map((user) => {
                  const recordCount = allPayloads.filter(p => p.userId === user.id).length;
                  return (
                    <li key={user.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedUser(user)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-green-700">{user.username}</div>
                            <div className="text-sm text-gray-500">Registros: {recordCount}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'} mr-4`}>
                            {user.role}
                          </span>
                          
                          <Button 
                             onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                             variant="secondary"
                             className="!py-1 !px-3 text-xs mr-2"
                          >
                             Ver Histórico
                          </Button>

                          {user.role !== 'admin' && (
                             <button 
                               onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id); }}
                               className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"
                               title="Excluir Usuário"
                             >
                               <Trash2 className="h-5 w-5" />
                             </button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </div>

        </div>
      </main>
      
       {/* Admin Photo View Modal */}
       {viewPhotoUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-4" onClick={() => setViewPhotoUrl(null)}>
          <div className="relative max-w-4xl max-h-screen">
            <button 
              onClick={() => setViewPhotoUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <XCircle className="h-8 w-8" />
            </button>
            <img src={viewPhotoUrl} alt="Comprovante" className="max-h-[85vh] max-w-full rounded-md shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<PageView>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Auth Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Dashboard State
  const [userList, setUserList] = useState<User[]>([]);
  const [payloadList, setPayloadList] = useState<PayloadItem[]>([]);
  const [allPayloads, setAllPayloads] = useState<PayloadItem[]>([]);

  // Load initial data
  useEffect(() => {
    setUserList(getStoredUsers());
    
    if (currentUser) {
       setPayloadList(getPayloadsByUser(currentUser.id));
    }
    
    // Admin always needs fresh list
    setAllPayloads(getAllPayloads());
  }, [view, currentUser]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check against standard users
    const users = getStoredUsers();
    const foundUser = users.find(u => u.username === username && u.password === password);

    if (foundUser) {
      if (foundUser.role === 'admin') {
         // Should not happen via standard login if we strictly separate, but good safety
         // For this app, standard login is for 'user' role
      }
      setCurrentUser(foundUser);
      setView('user-dashboard');
      setUsername('');
      setPassword('');
    } else {
      setError('Credenciais inválidas. Verifique seu usuário e senha.');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const adminUser: User = {
        id: 'admin-main',
        username: ADMIN_USER,
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      setCurrentUser(adminUser);
      setView('admin-dashboard');
      setUsername('');
      setPassword('');
    } else {
      setError('Acesso negado. Credenciais administrativas incorretas.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (username === ADMIN_USER) {
      setError('Este nome de usuário não é permitido.');
      return;
    }

    const users = getStoredUsers();
    if (users.find(u => u.username === username)) {
      setError('Usuário já existe.');
      return;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      password, 
      role: 'user',
      createdAt: new Date().toISOString()
    };

    saveUser(newUser);
    alert('Conta criada com sucesso! Faça login.');
    setView('login');
    setUsername('');
    setPassword('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    setView('login');
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      deleteUser(userId);
      setUserList(prev => prev.filter(u => u.id !== userId));
    }
  };

  const handleAddPayload = (data: PayloadFormData) => {
    if (!currentUser) return;
    
    let calculatedValue = 0;
    let totalParcels = 0;
    let collections = 0;

    if (data.type === 'individual') {
        const p = parseFloat(data.parcelCount) || 0;
        const c = parseFloat(data.collectionCount) || 0;
        totalParcels = p;
        collections = c;
        calculatedValue = (p * 1.00) + (c * 0.80);
    } else {
        const p1 = parseFloat(data.count1) || 0;
        const p2 = parseFloat(data.count2) || 0;
        totalParcels = p1 + p2;
        
        if (!data.isTwoIds) {
            calculatedValue = 180;
        } else {
            if (totalParcels < 150) calculatedValue = 260;
            else if (totalParcels <= 250) calculatedValue = 300;
            else calculatedValue = 360;
        }
    }
    
    const newItem: PayloadItem = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      name: data.type === 'individual' ? 'Entrega Individual' : 'Rota Diária',
      type: data.type,
      value: calculatedValue,
      status: 'active',
      date: data.date,
      createdAt: new Date().toISOString(),
      photoUrl: data.photo || undefined,
      details: {
        parcelCount: totalParcels,
        collectionCount: collections,
        driverId: data.type === 'individual' ? data.driverId : undefined,
        isTwoIds: data.type === 'daily' ? data.isTwoIds : undefined,
        id1: data.id1,
        count1: parseFloat(data.count1) || 0,
        id2: data.id2,
        count2: parseFloat(data.count2) || 0
      }
    };
    
    savePayload(newItem);
    setPayloadList(prev => [...prev, newItem]);
    setAllPayloads(prev => [...prev, newItem]);
  };

  return (
    <>
      {view === 'login' && (
        <LoginView 
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          handleLogin={handleLogin}
          error={error}
          onNavigateRegister={() => { setError(''); setView('register'); }}
          onNavigateAdmin={() => { setError(''); setView('admin-login'); setUsername(''); setPassword(''); }}
        />
      )}
      {view === 'admin-login' && (
        <AdminLoginView
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          handleAdminLogin={handleAdminLogin}
          handleLogin={handleAdminLogin}
          error={error}
          onBack={() => { setError(''); setView('login'); setUsername(''); setPassword(''); }}
        />
      )}
      {view === 'register' && (
        <RegisterView 
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          handleRegister={handleRegister}
          error={error}
          onNavigateLogin={() => { setError(''); setView('login'); }}
        />
      )}
      {view === 'user-dashboard' && (
        <UserDashboard 
          currentUser={currentUser}
          handleLogout={handleLogout}
          payloadList={payloadList}
          onAddPayload={handleAddPayload}
          onNavigateHistory={() => setView('history')}
        />
      )}
      {view === 'history' && (
        <HistoryView 
          currentUser={currentUser}
          payloadList={payloadList}
          onBack={() => setView('user-dashboard')}
        />
      )}
      {view === 'admin-dashboard' && (
        <AdminDashboard 
          userList={userList}
          allPayloads={allPayloads}
          handleLogout={handleLogout}
          handleDeleteUser={handleDeleteUser}
        />
      )}
    </>
  );
}