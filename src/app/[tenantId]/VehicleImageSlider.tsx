'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react'

interface VehicleImageSliderProps {
    images: string[]
    modelo: string
}

export default function VehicleImageSlider({ images, modelo }: VehicleImageSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    if (!images || images.length === 0) {
        return (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-700 font-medium bg-zinc-900">
                Sem Foto
            </div>
        )
    }

    const nextImage = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setCurrentIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    return (
        <div className="relative w-full h-full group/slider overflow-hidden">
            {/* Imagem Principal */}
            <img
                src={images[currentIndex]}
                alt={`${modelo} - Foto ${currentIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/slider:scale-105"
            />

            {/* Setas de navegação (aparecem no hover) */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity z-20"
                        aria-label="Foto anterior"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity z-20"
                        aria-label="Próxima foto"
                    >
                        <ChevronRight size={20} />
                    </button>
                </>
            )}

            {/* Contador / Indicador */}
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1.5 rounded flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-white shadow-lg z-10">
                <Camera size={12} />
                {currentIndex + 1} / {images.length}
            </div>

            {/* Dots de navegação rápidos (opcional, mas bom pra UX) */}
            {images.length > 1 && (
                <div className="absolute bottom-2 right-2 flex gap-1 z-10">
                    {images.slice(0, 5).map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-[var(--color-brand)] w-3' : 'bg-white/40'}`}
                        />
                    ))}
                    {images.length > 5 && <span className="text-[8px] text-white/50 self-center">+</span>}
                </div>
            )}
        </div>
    )
}
