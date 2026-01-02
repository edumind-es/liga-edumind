import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface EvaluationRadarChartProps {
    data: {
        subject: string;
        A: number;
        fullMark: number;
    }[];
    color?: string;
}

export function EvaluationRadarChart({ data, color = "#8884d8" }: EvaluationRadarChartProps) {
    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="rgba(255,255,255,0.2)" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, data[0]?.fullMark || 10]}
                        tick={false}
                        axisLine={false}
                    />
                    <Radar
                        name="Evaluación"
                        dataKey="A"
                        stroke={color}
                        strokeWidth={2}
                        fill={color}
                        fillOpacity={0.4}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
