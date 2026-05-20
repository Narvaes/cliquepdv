import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface Profile {
    id: string;
    email: string;
    role: 'admin' | 'cashier' | 'superadmin';
    full_name: string;
    tenant_id: string;
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            console.log('[AuthContext] Fetching profile for:', userId);

            // 1. Try Standard Fetch
            let { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            // 2. If Error or No Role (Likely RLS blocking), Try Secure RPC
            if (error || !data || !data.role) {
                console.warn('[AuthContext] Standard fetch failed/empty. Trying Secure RPC fallback...');
                const { data: rpcData, error: rpcError } = await supabase.rpc('get_current_user_role');

                if (!rpcError && rpcData && rpcData.role !== 'none') {
                    console.log('[AuthContext] RPC Recovered Role:', rpcData.role);
                    // Construct a profile object from RPC data
                    data = {
                        id: userId,
                        email: session?.user?.email || 'recovered@system.com',
                        role: rpcData.role,
                        permissions: rpcData.permissions,
                        full_name: 'Super Admin (Recovered)',
                        tenant_id: rpcData.tenant_id || null,
                        tenant_slug: rpcData.tenant_slug || null
                    };
                    error = null; // Clear error
                }
            }

            if (!error && data) {
                console.log('[AuthContext] Profile verified:', data.role);
                setProfile(data);
            } else {
                console.warn('[AuthContext] No profile could be resolved.');
                setProfile(null);
            }
        } catch (err) {
            console.error('[AuthContext] Critical Profile Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 1. Initial Session Check
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('[AuthContext] Initial session check:', session ? 'Active' : 'Empty');
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // 2. Auth State Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('[AuthContext] Auth change event:', event);
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('[AuthContext] Error signing out:', error);
        } finally {
            // Força a limpeza de tokens locais que podem prender o usuário em um loop (zombie session)
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('sb-') || key.includes('auth-token') || key.includes('supabase')) {
                    localStorage.removeItem(key);
                }
            });
            setProfile(null);
            setSession(null);
            setUser(null);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, profile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
