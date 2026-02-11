import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SuggestionForm } from './suggestion-form';

export default function PredictivePage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Predictive Stock Management</CardTitle>
          <CardDescription>
            Use historical data and AI to get optimal stock level suggestions.
            Enter material details below to generate a recommendation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SuggestionForm />
        </CardContent>
      </Card>
    </div>
  );
}
