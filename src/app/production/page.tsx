import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ProductionPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Production</CardTitle>
        <CardDescription>
          This is a placeholder for the Production page. Production tasks will be managed here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Production Dashboard Coming Soon</p>
        </div>
      </CardContent>
    </Card>
  );
}
