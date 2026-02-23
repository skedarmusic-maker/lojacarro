'use client'

import { useState } from 'react'
import FinancingModal from './FinancingModal'

type FinancingModalClientProps = {
    children: React.ReactNode
    lojaId: string
    veiculoId: string
    veiculoNome: string
    corPrimaria: string
}

export default function FinancingModalClient({ children, lojaId, veiculoId, veiculoNome, corPrimaria }: FinancingModalClientProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <div onClick={() => setIsOpen(true)} className="contents">
                {children}
            </div>

            <FinancingModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                lojaId={lojaId}
                veiculoId={veiculoId}
                veiculoNome={veiculoNome}
                corPrimaria={corPrimaria}
            />
        </>
    )
}
