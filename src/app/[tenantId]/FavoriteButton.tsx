'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'

export default function FavoriteButton({ carId }: { carId: string }) {
    const [isFavorited, setIsFavorited] = useState(false)

    useEffect(() => {
        try {
            const favs = JSON.parse(localStorage.getItem('@lojacarro:favorites') || '[]')
            setIsFavorited(favs.includes(carId))
        } catch (e) {
            // handle parse error
        }
    }, [carId])

    const toggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        try {
            let favs = JSON.parse(localStorage.getItem('@lojacarro:favorites') || '[]')

            if (isFavorited) {
                favs = favs.filter((id: string) => id !== carId)
            } else {
                favs.push(carId)
            }

            localStorage.setItem('@lojacarro:favorites', JSON.stringify(favs))
            setIsFavorited(!isFavorited)
        } catch (e) {
            // handle storage error
        }
    }

    return (
        <button
            type="button"
            aria-label={isFavorited ? "Remover dos favoritos" : "Salvar veículo nos favoritos"}
            className="absolute top-3 right-3 z-30 w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-sm"
            onClick={toggleFavorite}
        >
            <Heart
                size={18}
                className={`transition-colors duration-300 ${isFavorited ? 'fill-red-500 text-red-500 stroke-red-500' : 'stroke-white stroke-[2.5]'}`}
            />
        </button>
    )
}
