import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div>
          <h1 className="mb-4 text-4xl font-bold">OHS PRIME MED</h1>
          <p className="text-xl text-muted-foreground">
            Professional occupational health and safety management system
          </p>
        </div>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Manage clients, services, pricing, and users with our comprehensive admin platform
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
