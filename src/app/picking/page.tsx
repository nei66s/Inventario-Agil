import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function PickingPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Picking</CardTitle>
        <CardDescription>
          This is a placeholder for the Picking page. Order picking tasks will be managed here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Picking Interface Coming Soon</p>
        </div>
      </CardContent>
    </Card>
  );
}
