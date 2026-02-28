'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

type Props = {
    nome: string;
    logo_url?: string;
    cor_primaria: string;
    basePath: string;
    activePath?: 'estoque' | 'sobre' | 'localizacao' | 'contato';
};

export default function StorefrontHeader({
    nome,
    logo_url,
    cor_primaria,
    basePath,
    activePath = 'estoque'
}: Props) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Helper functions for classes
    const getNavClass = (path: typeof activePath) => {
        return activePath === path
            ? "text-gray-900 font-bold"
            : "text-gray-600 hover:text-gray-900 transition-colors";
    };

    const getMobileNavClass = (path: typeof activePath) => {
        return activePath === path
            ? "text-gray-900 font-bold bg-gray-50 rounded-lg p-2 block"
            : "text-gray-600 hover:text-gray-900 transition-colors p-2 block";
    };

    return (
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">

                {/* Brand / Logo */}
                <Link href={`${basePath}/`} className="text-2xl font-black tracking-tight flex items-center gap-3">
                    {logo_url && (
                        <img src={logo_url} alt={`Logo ${nome}`} className="h-10 w-auto" />
                    )}
                    <span style={{ color: cor_primaria }}>{nome}</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-6 font-medium text-gray-600">
                    <Link href={`${basePath}/`} className={getNavClass('estoque')}>Estoque</Link>
                    <Link href={`${basePath}/sobre`} className={getNavClass('sobre')}>Sobre Nós</Link>
                    <Link href={`${basePath}/localizacao`} className={getNavClass('localizacao')}>Localização</Link>
                    <Link href={`${basePath}/contato`} className={getNavClass('contato')}>Contato</Link>
                </nav>

                {/* Mobile Toggle Button */}
                <button
                    className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Abrir menu principal"
                >
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Nav Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white absolute top-20 left-0 w-full shadow-lg z-40">
                    <div className="px-4 pt-2 pb-6 flex flex-col gap-2 font-medium">
                        <Link
                            href={`${basePath}/`}
                            className={getMobileNavClass('estoque')}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Estoque
                        </Link>
                        <Link
                            href={`${basePath}/sobre`}
                            className={getMobileNavClass('sobre')}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Sobre Nós
                        </Link>
                        <Link
                            href={`${basePath}/localizacao`}
                            className={getMobileNavClass('localizacao')}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Localização
                        </Link>
                        <Link
                            href={`${basePath}/contato`}
                            className={getMobileNavClass('contato')}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Contato
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
