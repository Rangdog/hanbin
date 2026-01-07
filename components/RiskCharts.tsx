import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { RiskMetrics } from '../types';

interface RiskChartsProps {
  metrics: RiskMetrics;
}

export default function RiskCharts({ metrics }: RiskChartsProps) {
  const data = [
    { subject: 'Credit Score', value: metrics.creditScore, fullMark: 100 },
    { subject: 'Payment History', value: metrics.paymentHistory, fullMark: 100 },
    { subject: 'Industry Risk', value: metrics.industryRisk, fullMark: 100 },
    { subject: 'Market Conditions', value: metrics.marketConditions, fullMark: 100 },
  ];

  return (
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Risk Assessment</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar name="Risk Metrics" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
