import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { publicApi } from '@/api/public';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function PublicLogin() {
    const { ligaId } = useParams<{ ligaId: string }>();
    const navigate = useNavigate();
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ligaId) return;

        setIsLoading(true);
        try {
            const response = await publicApi.login(parseInt(ligaId), pin);
            localStorage.setItem(`public_token_${ligaId}`, response.access_token);
            toast.success('Acceso concedido');
            navigate(`/public/${ligaId}/dashboard`);
        } catch {
            toast.error('PIN incorrecto o acceso no habilitado');
            setPin('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <Card variant="glass" className="w-full max-w-md border-0 shadow-2xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-white/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-2 backdrop-blur-sm ring-1 ring-white/30">
                        <Lock className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-white">Acceso Privado</CardTitle>
                    <CardDescription className="text-blue-100 text-lg">
                        Introduce el PIN de acceso
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="• • • • • •"
                                className="text-center text-3xl tracking-[1em] h-16 bg-white/10 border-white/20 text-white placeholder:text-white/20 focus:bg-white/20 transition-all font-mono"
                                maxLength={6}
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                required
                            />
                            <p className="text-center text-sm text-blue-200">
                                Solicita el PIN al administrador de la liga
                            </p>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 bg-white text-lme-primary-dark hover:bg-white/90 font-bold text-lg shadow-lg transition-all hover:scale-[1.02]"
                            disabled={isLoading || pin.length !== 6}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    Entrar
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
