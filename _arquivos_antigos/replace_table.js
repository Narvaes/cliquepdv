const fs = require('fs');
const path = require('path');

const targetFile = 'd:\\Lucas\\Projetos\\CliquePdv Projetos\\Cliquepdv\\src\\pages\\superadmin\\Tenants.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

const tableRegex = /<table className="w-full text-left border-collapse min-w-\[1000px\]">([\s\S]*?)<\/table>/;
const match = content.match(tableRegex);

if (!match) {
    console.log("Table not found!");
    process.exit(1);
}

let newTable = `
                <table className="w-full text-left border-collapse block xl:table">
                    <thead className="hidden xl:table-header-group">
                        <tr className="border-b border-neutral-800 bg-neutral-900/50">
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[3px] text-neutral-500">Loja</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[3px] text-neutral-500">Acesso Base</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[3px] text-neutral-500">Domínio Customizado</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[3px] text-neutral-500">Nicho</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[3px] text-neutral-500">Assinatura</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[3px] text-neutral-500">Status</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[3px] text-neutral-500 text-right w-[1%] whitespace-nowrap">Ações Administrativas</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/50 block xl:table-row-group">
                        {isLoading ? (
                            [1, 2, 3].map(i => (
                                <tr key={i} className="animate-pulse block xl:table-row">
                                    <td colSpan={7} className="px-6 py-8 block xl:table-cell"><div className="h-24 xl:h-8 bg-neutral-800 rounded-xl" /></td>
                                </tr>
                            ))
                        ) : filteredTenants?.map((tenant) => (
                            <tr key={tenant.id} className="hover:bg-neutral-800/20 transition-colors group block xl:table-row mb-6 xl:mb-0 border border-neutral-800 xl:border-0 rounded-3xl xl:rounded-none p-4 xl:p-0 bg-neutral-900/30 xl:bg-transparent">
                                
                                <td className="block xl:table-cell py-3 xl:px-6 xl:py-6 border-b border-neutral-800/50 xl:border-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-[3px] text-neutral-500 xl:hidden">Loja</span>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-neutral-800 rounded-1xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                <Building2 size={20} />
                                            </div>
                                            <div className="text-left sm:text-right xl:text-left">
                                                <p className="font-bold text-white leading-none">{tenant.name}</p>
                                                <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-tighter">
                                                    Criada em {format(new Date(tenant.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="block xl:table-cell py-3 xl:px-6 xl:py-6 border-b border-neutral-800/50 xl:border-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-[3px] text-neutral-500 xl:hidden">Acesso Base</span>
                                        <div className="flex items-center gap-2 text-neutral-400 font-mono text-sm underline decoration-neutral-700 underline-offset-4">
                                            <Globe size={14} />
                                            {tenant.slug}.cliquepdv.com.br
                                        </div>
                                    </div>
                                </td>

                                <td className="block xl:table-cell py-3 xl:px-6 xl:py-6 border-b border-neutral-800/50 xl:border-0 font-mono text-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-[3px] text-neutral-500 xl:hidden">Domínio Customizado</span>
                                        {tenant.custom_domain ? (
                                            <div className="flex items-center gap-2 text-indigo-500">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                {tenant.custom_domain}
                                            </div>
                                        ) : (
                                            <span className="text-neutral-600 italic">Não configurado</span>
                                        )}
                                    </div>
                                </td>

                                <td className="block xl:table-cell py-3 xl:px-6 xl:py-6 border-b border-neutral-800/50 xl:border-0 text-sm font-medium">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-[3px] text-neutral-500 xl:hidden">Nicho</span>
                                        <span className="bg-neutral-800 px-3 py-1 rounded-full text-xs text-neutral-400 uppercase tracking-widest border border-neutral-700 max-w-fit">
                                            {{
                                                'bakery': 'Padaria',
                                                'snack_bar': 'Lanchonete',
                                                'pizzeria': 'Pizzaria',
                                                'market': 'Mercado',
                                                'confectionery': 'Confeitaria',
                                                'other': 'Outro'
                                            }[tenant.niche as string] || tenant.niche}
                                        </span>
                                    </div>
                                </td>

                                <td className="block xl:table-cell py-3 xl:px-6 xl:py-6 border-b border-neutral-800/50 xl:border-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-[3px] text-neutral-500 xl:hidden">Assinatura</span>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="text-neutral-600" size={16} />
                                            <div className="text-left sm:text-right xl:text-left">
                                                <p className="text-xs font-bold text-neutral-300 uppercase tracking-tight">
                                                    {{
                                                        'trial': 'Período de Teste',
                                                        'active': 'Assinante',
                                                        'past_due': 'Pendente',
                                                        'canceled': 'Cancelado'
                                                    }[tenant.subscription_status as string] || tenant.subscription_status}
                                                </p>
                                                <p className="text-[10px] text-neutral-500 mt-0.5 italic">
                                                    Até {format(new Date(tenant.trial_ends_at), "dd/MM/yy")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="block xl:table-cell py-3 xl:px-6 xl:py-6 border-b border-neutral-800/50 xl:border-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-[3px] text-neutral-500 xl:hidden">Status</span>
                                        <span className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest max-w-fit",
                                            tenant.status === 'active'
                                                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                                : "bg-red-500/10 text-red-500 border border-red-500/20"
                                        )}>
                                            <div className={cn("w-1.5 h-1.5 rounded-full", tenant.status === 'active' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500")} />
                                            {tenant.status === 'active' ? 'Ativo' : 'Suspenso'}
                                        </span>
                                    </div>
                                </td>

                                <td className="block xl:table-cell pt-4 pb-2 xl:px-6 xl:py-6 text-right w-full xl:w-[1%] whitespace-normal xl:whitespace-nowrap">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-[3px] text-neutral-500 xl:hidden text-left">Ações Administrativas</span>
                                        <div className="flex flex-row flex-wrap items-center justify-start sm:justify-end gap-2">
                                            <button
                                                onClick={() => window.open(\`/?test_slug=\${tenant.slug}\`, '_blank')}
                                                className="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-all font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-md shadow-black/20"
                                                title="Visualizar site do cliente"
                                            >
                                                <Eye size={14} />
                                                <span className="inline">Ver</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingTenant({
                                                        id: tenant.id,
                                                        name: tenant.name,
                                                        slug: tenant.slug,
                                                        custom_domain: tenant.custom_domain || '',
                                                        niche: tenant.niche,
                                                        subscription_plan: tenant.subscription_plan || 'free',
                                                        status: tenant.status
                                                    });
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-all font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 border border-neutral-700"
                                                title="Editar Informações"
                                            >
                                                <Settings size={14} className="xl:hidden" />
                                                <span className="inline">Editar</span>
                                            </button>
                                            <button
                                                onClick={() => window.open(\`/admin?tenant_override=\${tenant.slug}\`, '_blank')}
                                                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                                                title="Gerenciar esta loja"
                                            >
                                                <Settings size={14} />
                                                <span className="inline">Admin</span>
                                            </button>
                                            <button
                                                onClick={() => openUserActions(tenant)}
                                                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-md shadow-amber-600/20"
                                                title="Ações de Usuário (Email/Senha)"
                                            >
                                                <UserCheck size={14} />
                                                <span className="inline">Acessos</span>
                                            </button>

                                            <div className="w-px h-6 bg-neutral-800 hidden sm:block"></div>

                                            <button
                                                onClick={() => {
                                                    setTenantToDelete(tenant);
                                                    setDeleteConfirmationText('');
                                                    setIsDeleteConfirmOpen(true);
                                                }}
                                                className="p-2.5 rounded-lg text-neutral-500 hover:text-red-500 hover:bg-red-500/10 transition-all ml-auto sm:ml-0"
                                                title="Excluir Definitivamente"
                                            >
                                                <XCircle size={16} />
                                            </button>
                                            <button
                                                onClick={() => toggleStatusMutation.mutate({ id: tenant.id, status: tenant.status })}
                                                className={cn(
                                                    "p-2.5 rounded-lg transition-all",
                                                    tenant.status === 'active' ? "text-neutral-500 hover:text-indigo-500 hover:bg-indigo-500/10" : "text-neutral-500 hover:text-green-500 hover:bg-green-500/10"
                                                )}
                                                title={tenant.status === 'active' ? 'Suspender Loja' : 'Ativar Loja'}
                                            >
                                                <ShieldAlert size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
`;

content = content.replace(tableRegex, newTable.trim());
fs.writeFileSync(targetFile, content);
console.log("Successfully replaced table structure!");
