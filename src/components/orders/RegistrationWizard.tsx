import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRegistrationState } from '@/hooks/useRegistrationState';

interface RegistrationWizardProps {
  children: React.ReactNode;
  onComplete: () => void;
  onCancel: () => void;
}

const steps = [
  { number: 1, label: 'Select Trainee' },
  { number: 2, label: 'Registration Type' },
  { number: 3, label: 'Select Services' },
  { number: 4, label: 'Review & Submit' },
];

export function RegistrationWizard({ children, onComplete, onCancel }: RegistrationWizardProps) {
  const {
    currentStep,
    setCurrentStep,
    canProceedToStep2,
    canProceedToStep3,
    canProceedToStep4,
  } = useRegistrationState();

  const canProceed = () => {
    if (currentStep === 1) return canProceedToStep2();
    if (currentStep === 2) return canProceedToStep3();
    if (currentStep === 3) return canProceedToStep4();
    return false;
  };

  const handleNext = () => {
    if (currentStep === 4) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps - Horizontal Tabs */}
      <div className="flex items-center gap-1 border-b">
        {steps.map((step) => (
          <button
            key={step.number}
            type="button"
            onClick={() => {
              // Only allow navigation to completed steps
              if (step.number < currentStep) {
                setCurrentStep(step.number);
              }
            }}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              currentStep === step.number
                ? 'bg-primary text-primary-foreground'
                : currentStep > step.number
                ? 'bg-muted/50 text-foreground hover:bg-muted cursor-pointer'
                : 'bg-muted/30 text-muted-foreground cursor-not-allowed'
            }`}
          >
            <span>{step.number}</span>
            <span>{step.label}</span>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {children}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : handlePrevious}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
        >
          {currentStep === 4 ? 'Submit Registration' : 'Next'}
          {currentStep < 4 && <ChevronRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
