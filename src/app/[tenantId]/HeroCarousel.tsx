'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'

// Placeholder images se a loja não tiver configurada as suas próprias
const DEFAULT_BANNERS = [
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=2000'
]

export default function HeroCarousel({ lojaNome, corPrimaria, banners }: { lojaNome: string, corPrimaria: string, banners?: string[] }) {
    const images = banners && banners.length > 0 ? banners : DEFAULT_BANNERS
    const [currentIndex, setCurrentIndex] = useState(0)

    // Efeito para passar os slides automaticamente
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [images.length])

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length)
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)

    return (
        <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden border-b border-gray-200">
            {/* Imagens de fundo */}
            {images.map((img, idx) => (
                <div
                    key={idx}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                >
                    <img
                        src={img}
                        alt={`Banner ${idx + 1}`}
                        className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${idx === currentIndex ? 'scale-110' : 'scale-100'}`}
                    />
                </div>
            ))}

            {/* Camada de Gradiente / Dark Overlay para dar profundidade literária ao texto */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent z-10" />
            <div className="absolute inset-0 bg-black/30 z-10" />

            {/* Conteúdo Tipográfico Massive */}
            <div className="relative z-20 text-center px-4 max-w-5xl mx-auto flex flex-col items-center justify-center h-full pt-16">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter leading-none animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    O INÍCIO DA SUA <br className="hidden md:block" />
                    <span style={{ color: "var(--color-brand)" }} className="relative inline-block">
                        NOVA JORNADA
                        {/* Efeito Glow Tênue proibido pelo Maestro, mas um reflexo sólido é permitido */}
                    </span>
                </h1>

                <p className="text-zinc-300 font-medium text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed tracking-wide animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
                    Você está navegando no estoque exclusivo da <strong className="text-white">{lojaNome}</strong>.
                    Todos os nossos veículos são rigorosamente revisados e com garantia de procedência.
                </p>

                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
                    <a href="#estoque"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('estoque')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-all hover:scale-105 hover:shadow-2xl"
                        style={{ backgroundColor: "var(--color-brand)", color: "#fff", boxShadow: `0 10px 40px -10px var(--color-brand)` }}>
                        Ver Estoque Completo
                    </a>
                </div>
            </div>

            {/* Controles Laterais Sutis */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:px-8 z-30 pointer-events-none">
                <button
                    onClick={prevSlide}
                    className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/50 transition-all pointer-events-auto"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={nextSlide}
                    className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/50 transition-all pointer-events-auto"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Indicadores de Slide (Dots Customizados) */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
                {images.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`transition-all duration-300 rounded-full h-1.5 ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                        aria-label={`Ir para slide ${idx + 1}`}
                    />
                ))}
            </div>
        </section>
    )
}
