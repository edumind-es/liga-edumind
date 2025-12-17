import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TipoDeporte } from '@/types/liga';
import { ExpressTeam, ExpressMatch } from '@/types/express';
import DeporteSelector from './wizard/DeporteSelector';
import EquiposConfig from './wizard/EquiposConfig';
import Confirmacion from './wizard/Confirmacion';

type WizardStep = 1 | 2 | 3;

export default function ExpressWizard() {
    const navigate = useNavigate();
    const [step, setStep] = useState<WizardStep>(1);
    const [selectedDeporte, setSelectedDeporte] = useState<TipoDeporte | null>(null);
    const [equipos, setEquipos] = useState<ExpressTeam[]>([
        { id: '1', nombre: '', rol: 'local' },
        { id: '2', nombre: '', rol: 'visitante' }
    ]);

    const canProceed = () => {
        switch (step) {
            case 1:
                return selectedDeporte !== null;
            case 2:
                return equipos.filter(eq => eq.nombre.trim()).length >= 2;
            case 3:
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (step < 3 && canProceed()) {
            setStep((step + 1) as WizardStep);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep((step - 1) as WizardStep);
        } else {
            navigate('/express');
        }
    };

    const handleCrearPartido = () => {
        if (!selectedDeporte) return;

        const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const match: ExpressMatch = {
            id: matchId,
            deporte: {
                id: selectedDeporte.id,
                nombre: selectedDeporte.nombre,
                codigo: selectedDeporte.codigo,
                tipo_marcador: selectedDeporte.tipo_marcador,
                icono: selectedDeporte.icono || '',
                config: selectedDeporte.config
            },
            equipos: equipos.filter(eq => eq.nombre.trim()),
            marcador: inicializarMarcador(selectedDeporte.tipo_marcador),
            evaluaciones: {},
            fecha: new Date().toISOString(),
            finalizado: false,
            tiempoInicio: new Date().toISOString()
        };

        // Guardar en SessionStorage
        sessionStorage.setItem(`express_match_${matchId}`, JSON.stringify(match));

        // Redirigir al marcador
        navigate(`/express/partido/${matchId}`);
    };

    const inicializarMarcador = (tipoMarcador: string): Record<string, any> => {
        switch (tipoMarcador) {
            case 'goles':
                return { goles_local: 0, goles_visitante: 0 };
            case 'puntos':
                return { puntos_local: 0, puntos_visitante: 0 };
            case 'sets':
                return {
                    sets_local: 0,
                    sets_visitante: 0,
                    puntos_set_actual_local: 0,
                    puntos_set_actual_visitante: 0,
                    set_actual: 1
                };
            case 'tries':
                return { tries_local: 0, tries_visitante: 0, conversiones_local: 0, conversiones_visitante: 0 };
            case 'carreras':
                return { carreras_local: 0, carreras_visitante: 0 };
            case 'towertouchball':
                return {
                    puntos_local: 0,
                    puntos_visitante: 0,
                    conos_local: [false, false, false],
                    conos_visitante: [false, false, false],
                    tiempo_restante: 15 * 60 // 15 minutos en segundos
                };
            default:
                return {};
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#040614] via-[#0a0f24] to-[#040614] p-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Progress indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${s < step
                                        ? 'bg-mint text-[#040614]'
                                        : s === step
                                            ? 'bg-sky text-[#040614]'
                                            : 'bg-paper/20 text-sub'
                                        }`}
                                >
                                    {s < step ? <Check className="h-5 w-5" /> : s}
                                </div>
                                {s < 3 && (
                                    <div
                                        className={`w-16 h-1 ${s < step ? 'bg-mint' : 'bg-paper/20'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-ink">
                            {step === 1 && 'Selecciona el Deporte'}
                            {step === 2 && 'Configura los Equipos'}
                            {step === 3 && 'Confirma y Crea'}
                        </h2>
                        <p className="text-sub mt-1">
                            Paso {step} de 3
                        </p>
                    </div>
                </div>

                {/* Content */}
                <Card variant="glass">
                    <CardContent className="p-6">
                        {step === 1 && (
                            <DeporteSelector
                                selectedDeporte={selectedDeporte}
                                onSelect={setSelectedDeporte}
                            />
                        )}
                        {step === 2 && (
                            <EquiposConfig
                                equipos={equipos}
                                onChange={setEquipos}
                            />
                        )}
                        {step === 3 && (
                            <Confirmacion
                                deporte={selectedDeporte}
                                equipos={equipos.filter(eq => eq.nombre.trim())}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between mt-6">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        {step === 1 ? 'Cancelar' : 'Atrás'}
                    </Button>

                    {step < 3 ? (
                        <Button
                            onClick={handleNext}
                            disabled={!canProceed()}
                        >
                            Siguiente
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleCrearPartido}
                            className="bg-gradient-to-r from-mint to-sky"
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Crear Partido
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
