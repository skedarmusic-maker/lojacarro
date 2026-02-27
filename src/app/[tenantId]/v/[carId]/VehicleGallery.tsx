'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X, Maximize2, Camera } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface VehicleGalleryProps {
    images: string[]
    modelo: string
}

export default function VehicleGallery({ images, modelo }: VehicleGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)

    const [touchStart, setTouchStart] = useState<number | null>(null)
    const [touchEnd, setTouchEnd] = useState<number | null>(null)

    // Funções de Navegação
    const nextImage = useCallback(() => {
        if (!images || images.length <= 1) return
        setCurrentIndex((prev) => (prev + 1) % images.length)
    }, [images.length])

    const prevImage = useCallback(() => {
        if (!images || images.length <= 1) return
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }, [images.length])

    // Swipe Handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null)
        setTouchStart(e.targetTouches[0].clientX)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return
        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > 50
        const isRightSwipe = distance < -50
        if (isLeftSwipe) nextImage()
        if (isRightSwipe) prevImage()
    }

    // Atalhos de teclado para o Lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isLightboxOpen) return
            if (e.key === 'ArrowRight') nextImage()
            if (e.key === 'ArrowLeft') prevImage()
            if (e.key === 'Escape') setIsLightboxOpen(false)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isLightboxOpen, nextImage, prevImage])

    // Bloquear scroll quando lightbox aberto
    useEffect(() => {
        if (isLightboxOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
    }, [isLightboxOpen])

    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-[4/3] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-medium border border-gray-200">
                <div className="flex flex-col items-center gap-2">
                    <Camera size={48} strokeWidth={1.5} />
                    <span>Sem fotos disponíveis</span>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full relative">
            {/* =========================================
                VISÃO MOBILE MANTIDA (Apenas 1 foto, swipeable)
               ========================================= */}
            <div className="md:hidden relative aspect-[4/3] bg-gray-100 overflow-hidden shadow-sm group">
                <img
                    src={images[currentIndex]}
                    alt={`${modelo} - Foto ${currentIndex + 1}`}
                    className="w-full h-full object-contain md:object-cover cursor-zoom-in transition-all duration-300 hover:scale-105"
                    onClick={() => setIsLightboxOpen(true)}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                />
                {images.length > 1 && (
                    <>
                        <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 text-gray-900 shadow-lg flex items-center justify-center">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 text-gray-900 shadow-lg flex items-center justify-center">
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}
                {/* Contador Mobile */}
                <div className="absolute bottom-4 left-4 py-1 px-3 bg-black/60 backdrop-blur-md rounded-full text-white text-[10px] font-bold">
                    {currentIndex + 1} / {images.length}
                </div>
            </div>

            {/* =========================================
                VISÃO DESKTOP (Webmotors Style - 3 Fotos)
               ========================================= */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-1 h-[400px] lg:h-[480px] w-full rounded-xl overflow-hidden relative bg-gray-100">
                {/* Imagem 1 (Principal/Esquerda) */}
                <div
                    className="relative h-full w-full cursor-pointer overflow-hidden group/img bg-zinc-200"
                    onClick={() => { setCurrentIndex(0); setIsLightboxOpen(true); }}
                >
                    <img src={images[0]} alt={`${modelo} - Capa`} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors duration-300" />
                </div>

                {/* Imagem 2 (Meio) */}
                {images[1] ? (
                    <div
                        className="relative h-full w-full cursor-pointer overflow-hidden group/img bg-zinc-200"
                        onClick={() => { setCurrentIndex(1); setIsLightboxOpen(true); }}
                    >
                        <img src={images[1]} alt={`${modelo} - Foto 2`} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105" />
                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors duration-300" />
                    </div>
                ) : (
                    <div className="bg-gray-50 h-full w-full" />
                )}

                {/* Imagem 3 (Direita) */}
                {images[2] ? (
                    <div
                        className="relative h-full w-full cursor-pointer overflow-hidden group/img bg-zinc-200 hidden lg:block"
                        onClick={() => { setCurrentIndex(2); setIsLightboxOpen(true); }}
                    >
                        <img src={images[2]} alt={`${modelo} - Foto 3`} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105" />
                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors duration-300" />

                        {/* Overlay "Mais Fotos" */}
                        {images.length > 3 && (
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center transition-all duration-300 group-hover/img:bg-black/60 p-4 text-center">
                                <span className="text-white font-bold text-2xl drop-shadow-lg mb-1">+{images.length - 3}</span>
                                <span className="text-white/90 font-medium text-sm lg:text-base drop-shadow-md">Ver todas as fotos</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-gray-50 h-full w-full hidden lg:block" />
                )}

                {/* Botão Flutuante Desktop para abrir Lightbox */}
                <button
                    onClick={() => { setCurrentIndex(0); setIsLightboxOpen(true); }}
                    className="absolute bottom-6 right-6 z-10 bg-white/90 backdrop-blur-md text-gray-900 font-bold px-5 py-2.5 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200/50 flex items-center gap-2 hover:bg-white hover:scale-105 transition-all"
                >
                    <Camera size={18} className="text-gray-500" />
                    <span>Abrir Galeria ({images.length})</span>
                </button>
            </div>

            {/* LIGHTBOX (TELA CHEIA) */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
                    {/* Header do Lightbox */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between text-white z-[110] bg-gradient-to-b from-black/80 to-transparent">
                        <div className="font-bold flex items-center gap-3">
                            <span className="text-xl uppercase tracking-wider">{modelo}</span>
                            <span className="text-gray-400 font-medium px-3 border-l border-gray-700">
                                {currentIndex + 1} de {images.length}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={32} />
                        </button>
                    </div>

                    {/* Imagem em Tela Cheia */}
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        <img
                            src={images[currentIndex]}
                            alt={`Foto grande ${currentIndex + 1}`}
                            className="max-w-full max-h-full object-contain"
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        />

                        {/* Navegação Lightbox */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 p-4 text-white hover:bg-white/10 rounded-full transition-all"
                                >
                                    <ChevronLeft size={48} />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 p-4 text-white hover:bg-white/10 rounded-full transition-all"
                                >
                                    <ChevronRight size={48} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Footer / Rodapé de Miniaturas no Lightbox */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent hidden sm:flex justify-center overflow-x-auto gap-2">
                        {images.map((imgUrl, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={cn(
                                    "relative w-16 h-12 rounded-md overflow-hidden border-2 transition-all flex-shrink-0",
                                    currentIndex === idx ? "border-[var(--color-brand)] opacity-100 scale-110" : "border-transparent opacity-40 hover:opacity-70"
                                )}
                            >
                                <img src={imgUrl} className="w-full h-full object-cover" alt={`Miniatura modal ${idx + 1}`} />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-in {
                    animation: fadeIn 0.3s ease-out;
                }
                .hide-scrollbars::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbars {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    )
}
