import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AdminPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Administration</CardTitle>
        <CardDescription>
          This is a placeholder for the Admin page. User roles, materials, and other configurations will be managed here.
        </CardDescription>
      </CardHeader>
      <CardContent>
         <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Admin Controls Coming Soon</p>
        </div>
      </CardContent>
    </Card>
  );
}
