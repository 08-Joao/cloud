// components/Sidebar.tsx (Versão Reestilizada)
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// --- ÍCONES PADRONIZADOS (Solar Icons) ---
import {
  Settings,
  Logout3,
  RoundAltArrowRight,
  RoundAltArrowLeft,
  AltArrowDown,
  AltArrowRight,
} from '@solar-icons/react/ssr';

// --- DADOS DE NAVEGAÇÃO ---
// Este arquivo DEVE exportar ícones como JSX: icon: <Home />
import { sidebarOptions } from './constants/sidebar-settings';
import Image from 'next/image';

// ============================================
// COMPONENTE PRINCIPAL DA SIDEBAR (Reestilizado)
// ============================================
export const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false); // Padrão colapsado
  const pathname = usePathname();
  const router = useRouter();

  // --- EFEITO PARA SALVAR ESTADO NO LOCALSTORAGE ---
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    // Inicia expandido se 'saved' for 'false', senão colapsado
    setIsExpanded(saved === 'false');
  }, []);

  const toggleSidebar = () => {
    setIsExpanded(prev => {
      const newState = !prev;
      localStorage.setItem('sidebarCollapsed', newState ? 'false' : 'true');
      return newState;
    });
  };

  // --- LÓGICA DE ATIVAÇÃO DE ROTA ---
  const isActiveRoute = (optionPage: string): boolean => {
  if (!pathname) return false;
  
  // Rota raiz precisa ser exata
  if (optionPage === '/') return pathname === '/';
  
  // Correspondência exata
  if (pathname === optionPage) return true;
  
  // Para sub-rotas: verifica se começa com o caminho + '/'
  // MAS também verifica se não existe outra opção mais específica que corresponda exatamente
  if (pathname.startsWith(optionPage + '/')) {
    // Verifica se há alguma rota mais específica que corresponda exatamente
    // Se houver, esta rota genérica não deve ser marcada como ativa
    const allPages = Object.values(sidebarOptions)
      .flat()
      .flatMap(opt => [opt.page, ...(opt.childs?.map(c => c.page) || [])]);
    
    const hasMoreSpecificMatch = allPages.some(
      page => page !== optionPage && page.startsWith(optionPage) && pathname.startsWith(page)
    );
    
    return !hasMoreSpecificMatch;
  }
  
  return false;
};

  // --- LÓGICA PARA SUB-ITENS ---
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [collapsedMenuItems, setCollapsedMenuItems] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryName: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      newSet.has(categoryName) ? newSet.delete(categoryName) : newSet.add(categoryName);
      return newSet;
    });
  };

  const toggleMenuItem = (itemKey: string) => {
    setCollapsedMenuItems(prev => {
      const newSet = new Set(prev);
      newSet.has(itemKey) ? newSet.delete(itemKey) : newSet.add(itemKey);
      return newSet;
    });
  };

  const handleNavigate = (page: string) => {
    router.push(page);
  };

  // Helper para verificar se algum filho está ativo
  const hasActiveChild = (option: any): boolean => {
    if (!option.childs) return false;
    return option.childs.some((child: any) => isActiveRoute(child.page));
  };

  // ============================================
  // RENDERIZAÇÃO DO COMPONENTE
  // ============================================
  return (
    <aside
      className={`
        h-full z-40
        bg-background border-r border-foreground/10
        transition-all duration-300 ease-in-out
        flex flex-col
        ${isExpanded ? 'w-72' : 'w-20'}
      `}
    >
      {/* ============================================ */}
      {/* HEADER DA SIDEBAR - Logo e botão de expandir */}
      {/* ============================================ */}
      <div
        className={`
          flex items-center h-20 px-4
          border-b border-foreground/10
          ${isExpanded ? 'justify-between' : 'justify-center'}
        `}
      >
        {/* Logo - só aparece quando expandido */}
        {isExpanded && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Image src="/teh-rex_background.png" alt="Logo" width={44} height={44} />
            </div>
            <span className="text-lg font-semibold text-foreground">
              Tehkly Cloud
            </span>
          </div>
        )}

        {/* Botão para expandir/colapsar - sempre visível */}
        <button
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label={isExpanded ? 'Colapsar sidebar' : 'Expandir sidebar'}
        >
          {isExpanded ? (
            <RoundAltArrowLeft className="h-5 w-5" />
          ) : (
            <RoundAltArrowRight className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* ============================================ */}
      {/* NAVEGAÇÃO PRINCIPAL (Com lógica de categorias) */}
      {/* ============================================ */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {Object.entries(sidebarOptions).map(([categoryName, categoryOptions]) => {
          const isCategoryCollapsed = collapsedCategories.has(categoryName);

          return (
            <div key={categoryName} className="space-y-1">
              
              {/* Cabeçalho da Categoria (só visível quando expandido) */}
              {isExpanded && (
                <button
                  onClick={() => toggleCategory(categoryName)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {categoryName}
                  </span>
                  <span className="text-muted-foreground">
                    {isCategoryCollapsed ? (
                      <AltArrowRight className="w-4 h-4" />
                    ) : (
                      <AltArrowDown className="w-4 h-4" />
                    )}
                  </span>
                </button>
              )}

              {/* Itens da Categoria */}
              <div 
                className={`
                  space-y-1 transition-all duration-300 ease-in-out
                  ${isExpanded && isCategoryCollapsed ? "max-h-0 opacity-0 overflow-hidden" : "max-h-[1000px] opacity-100"}
                `}
              >
                {categoryOptions.map((option: any, optionIndex: number) => {
                  const isActive = isActiveRoute(option.page);
                  const hasChildren = Boolean(option.childs?.length);
                  const isChildActive = hasActiveChild(option);
                  const itemKey = `${categoryName}-${optionIndex}`;
                  const isItemCollapsed = collapsedMenuItems.has(itemKey);

                  return (
                    <div key={option.name} className="space-y-1">
                      {/* Botão do Item Principal */}
                      <button
                        onClick={() => {
                          if (hasChildren) {
                            toggleMenuItem(itemKey);
                          } else {
                            handleNavigate(option.page);
                          }
                        }}
                        className={`
                          w-full flex items-center gap-3 px-3 h-10 rounded-lg
                          transition-all duration-200
                          ${isActive || isChildActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }
                          ${!isExpanded && "justify-center"}
                        `}
                      >
                        
                        {/* Lógica de ícone com React.cloneElement */}
                        {option.icon && React.isValidElement(option.icon) && (
                          <span className="w-5 h-5 flex-shrink-0">
                            <span className="w-5 h-5 flex-shrink-0">{option.icon}</span>
                          </span>
                        )}
                        
                        {isExpanded && (
                          <span className="text-sm truncate flex-1 text-left">
                            {option.name}
                          </span>
                        )}

                        {/* Seta para sub-itens (só com label) */}
                        {hasChildren && isExpanded && (
                          <div className="flex-shrink-0">
                            {isItemCollapsed ? (
                              <AltArrowRight className="w-4 h-4" />
                            ) : (
                              <AltArrowDown className="w-4 h-4" />
                            )}
                          </div>
                        )}
                      </button>

                      {/* Sub-itens (Filhos) */}
                      {hasChildren && option.childs && (
                        <div
                          className={`
                            overflow-hidden transition-all duration-300 ease-in-out
                            ${isExpanded ? 'pl-8' : ''}
                            ${isItemCollapsed ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100"}
                          `}
                        >
                          {option.childs.map((child: any) => {
                            const isChildActive = isActiveRoute(child.page);
                            
                            return (
                              <button
                                key={child.name}
                                onClick={() => handleNavigate(child.page)}
                                className={`
                                  w-full flex items-center gap-3 px-3 h-10 rounded-lg
                                  transition-all duration-200
                                  ${isChildActive
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                  }
                                  ${!isExpanded && "justify-center"}
                                `}
                              >
                                {/* Lógica de ícone com React.cloneElement */}
                                {child.icon && React.isValidElement(child.icon) && (
                                  <span className="w-5 h-5 flex-shrink-0">
                                    <span className="w-5 h-5 flex-shrink-0">{child.icon}</span>
                                  </span>
                                )}

                                {isExpanded && (
                                  <span className="text-sm truncate">
                                    {child.name}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Adiciona um divisor entre categorias quando expandido */}
              {isExpanded && <div className="pt-2"></div>}
            </div>
          );
        })}
      </nav>

      {/* ============================================ */}
      {/* FOOTER DA SIDEBAR - Ações secundárias */}
      {/* ============================================ */}
      {/* <div className="p-4 border-t border-foreground/10">
        <button
          className={`
            w-full flex items-center gap-3 px-3 h-10 rounded-lg
            text-red-600 dark:text-red-500
            hover:bg-red-500/10
            transition-all duration-200
            ${!isExpanded && 'justify-center'}
          `}
          onClick={() => console.log('Logout clicado')}
        >
          <Logout3 className="w-5 h-5 flex-shrink-0" />
          {isExpanded && (
            <span className="text-sm font-medium">Sair</span>
          )}
        </button>
      </div> */}
    </aside>
  );
};

export default Sidebar;