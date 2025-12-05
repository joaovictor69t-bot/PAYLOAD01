import { supabase } from '../lib/supabase';
import { User, PayloadItem } from '../types';

// --- AUTH & USER ---

export const registerUser = async (username: string, password: string): Promise<{ user: User | null, error: string | null }> => {
  // O Supabase exige email. Vamos criar um email fictício baseado no usuário para manter o fluxo atual.
  const email = `${username.toLowerCase().replace(/\s+/g, '')}@payloadapp.com`;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) return { user: null, error: authError.message };
  if (!authData.user) return { user: null, error: 'Erro ao criar usuário.' };

  // Criar perfil na tabela profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([
      { id: authData.user.id, username: username, role: 'user' }
    ]);

  if (profileError) return { user: null, error: profileError.message };

  const newUser: User = {
    id: authData.user.id,
    username: username,
    role: 'user',
    createdAt: new Date().toISOString()
  };

  return { user: newUser, error: null };
};

export const loginUser = async (username: string, password: string): Promise<{ user: User | null, error: string | null }> => {
  // Tentar login como admin hardcoded (legado) ou login real
  // Se for o admin hardcoded do frontend, retornamos o objeto especial, mas sem sessão real do Supabase (limitado)
  // O ideal é criar um usuário 'admin' no Supabase.
  
  const email = `${username.toLowerCase().replace(/\s+/g, '')}@payloadapp.com`;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { user: null, error: error.message };
  if (!data.user) return { user: null, error: 'Usuário não encontrado.' };

  // Buscar dados do perfil
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) return { user: null, error: 'Perfil não encontrado.' };

  const user: User = {
    id: data.user.id,
    username: profile.username,
    role: profile.role as 'admin' | 'user',
    createdAt: profile.created_at
  };

  return { user, error: null };
};

export const logoutUser = async () => {
  await supabase.auth.signOut();
};

export const getCurrentSession = async (): Promise<User | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (!profile) return null;

  return {
    id: session.user.id,
    username: profile.username,
    role: profile.role as 'admin' | 'user',
    createdAt: profile.created_at
  };
};

export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
  
  if (error) {
    console.error('Erro ao buscar usuários:', error);
    return [];
  }

  return data.map((p: any) => ({
    id: p.id,
    username: p.username,
    role: p.role,
    createdAt: p.created_at
  }));
};

export const deleteUser = async (userId: string): Promise<void> => {
  // Nota: Deletar usuário do Auth requer Service Key no backend. 
  // Via client, só podemos deletar da tabela profiles se a política permitir.
  // Para este app, vamos apenas remover do profiles.
  await supabase.from('profiles').delete().eq('id', userId);
};


// --- PAYLOADS ---

export const uploadPhoto = async (file: File): Promise<string | null> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Erro upload:', uploadError);
    return null;
  }

  const { data } = supabase.storage.from('receipts').getPublicUrl(filePath);
  return data.publicUrl;
};

export const savePayload = async (item: Omit<PayloadItem, 'id' | 'createdAt'>, file?: File): Promise<PayloadItem | null> => {
  let photoUrl = item.photoUrl;

  if (file) {
    const uploadedUrl = await uploadPhoto(file);
    if (uploadedUrl) photoUrl = uploadedUrl;
  }

  const { data, error } = await supabase
    .from('payloads')
    .insert([{
      user_id: item.userId,
      name: item.name,
      type: item.type,
      status: item.status,
      value: item.value,
      date: item.date,
      photo_url: photoUrl,
      details: item.details
    }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar payload:', error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    type: data.type,
    status: data.status,
    value: data.value,
    date: data.date,
    createdAt: data.created_at,
    photoUrl: data.photo_url,
    details: data.details
  };
};

export const getAllPayloads = async (): Promise<PayloadItem[]> => {
  const { data, error } = await supabase
    .from('payloads')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    userId: item.user_id,
    name: item.name,
    type: item.type,
    status: item.status,
    value: item.value,
    date: item.date,
    createdAt: item.created_at,
    photoUrl: item.photo_url,
    details: item.details
  }));
};

export const getPayloadsByUser = async (userId: string): Promise<PayloadItem[]> => {
  const { data, error } = await supabase
    .from('payloads')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    userId: item.user_id,
    name: item.name,
    type: item.type,
    status: item.status,
    value: item.value,
    date: item.date,
    createdAt: item.created_at,
    photoUrl: item.photo_url,
    details: item.details
  }));
};
