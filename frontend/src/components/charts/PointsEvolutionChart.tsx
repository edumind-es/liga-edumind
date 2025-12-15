import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface PointsEvolutionChartProps {
    data: {
        name: string;
        deportivos: number;
        educativos: number;
    }[];
}

export function PointsEvolutionChart({ data }: PointsEvolutionChartProps) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="deportivos" stackId="a" fill="#3b82f6" name="Puntos Deportivos" />
                    <Bar dataKey="educativos" stackId="a" fill="#22c55e" name="Puntos Educativos" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
