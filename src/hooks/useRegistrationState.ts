import { useState } from 'react';

export interface SelectedService {
  service_id: string;
  price: number;
  name: string;
  category: string;
}

export interface RegistrationState {
  selectedTrainee: any | null;
  registrationType: 'client' | 'self-pay' | 'combination' | null;
  selectedClient: any | null;
  selectedServices: SelectedService[];
  serviceDate: Date;
  totalAmount: number;
}

const initialState: RegistrationState = {
  selectedTrainee: null,
  registrationType: null,
  selectedClient: null,
  selectedServices: [],
  serviceDate: new Date(),
  totalAmount: 0,
};

export function useRegistrationState() {
  const [state, setState] = useState<RegistrationState>(initialState);
  const [currentStep, setCurrentStep] = useState(1);

  const setSelectedTrainee = (trainee: any | null) => {
    setState(prev => ({ ...prev, selectedTrainee: trainee }));
  };

  const setRegistrationType = (type: 'client' | 'self-pay' | 'combination' | null) => {
    setState(prev => ({ ...prev, registrationType: type }));
  };

  const setSelectedClient = (client: any | null) => {
    setState(prev => ({ ...prev, selectedClient: client }));
  };

  const setSelectedServices = (services: SelectedService[]) => {
    const total = services.reduce((sum, service) => sum + service.price, 0);
    setState(prev => ({ ...prev, selectedServices: services, totalAmount: total }));
  };

  const setServiceDate = (date: Date) => {
    setState(prev => ({ ...prev, serviceDate: date }));
  };

  const resetState = () => {
    setState(initialState);
    setCurrentStep(1);
  };

  const canProceedToStep2 = () => state.selectedTrainee !== null;
  const canProceedToStep3 = () => state.registrationType !== null;
  const canProceedToStep4 = () => state.selectedServices.length > 0;

  return {
    state,
    currentStep,
    setCurrentStep,
    setSelectedTrainee,
    setRegistrationType,
    setSelectedClient,
    setSelectedServices,
    setServiceDate,
    resetState,
    canProceedToStep2,
    canProceedToStep3,
    canProceedToStep4,
  };
}
