import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  service_code: string;
  category: string;
  member_price: number;
  non_member_price: number;
}

interface ServiceGroup {
  id: string;
  name: string;
  subGroups: {
    id: string;
    name: string;
    services: Service[];
  }[];
}

interface TPA {
  id: string;
  name: string;
}

interface ServiceSelectorProps {
  services: Service[];
  selectedServiceIds: string[];
  onServiceToggle: (serviceId: string) => void;
  onTpaSelect?: (tpaId: string) => void;
  onBillingTypeChange?: (type: 'tpa' | 'client') => void;
}

export function ServiceSelector({ services, selectedServiceIds, onServiceToggle, onTpaSelect, onBillingTypeChange }: ServiceSelectorProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [referenceType, setReferenceType] = useState<'form_fox' | 'other'>('form_fox');
  const [referenceValue, setReferenceValue] = useState('');
  const [selectedTpa, setSelectedTpa] = useState<string | null>(null);
  const [showAllTpas, setShowAllTpas] = useState(false);
  const [billingType, setBillingType] = useState<'tpa' | 'client' | null>(null);

  // Available TPA providers
  const tpaProviders: TPA[] = [
    { id: 'disa', name: 'DISA' },
    { id: 'asap', name: 'ASAP' },
    { id: 'other-tpa-1', name: 'TPA Provider 3' },
    { id: 'other-tpa-2', name: 'TPA Provider 4' },
  ];

  const visibleTpas = showAllTpas ? tpaProviders : tpaProviders.slice(0, 2);

  const handleTpaSelection = (tpaId: string) => {
    setSelectedTpa(tpaId);
    setBillingType('tpa');
    onTpaSelect?.(tpaId);
    onBillingTypeChange?.('tpa');
  };

  const handleInHouseSelection = () => {
    setBillingType('client');
    setSelectedTpa(null);
    onBillingTypeChange?.('client');
  };

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const isGroupOpen = (groupId: string) => openGroups.has(groupId);

  // Filter only Drug & Alcohol services
  const drugAlcoholServices = services.filter(s => 
    s.category?.toLowerCase().includes('drug') || 
    s.category?.toLowerCase().includes('alcohol')
  );

  // Organize services for TPA and In-House
  const tpaServices: ServiceGroup = {
    id: 'tpa-consortium',
    name: 'TPA Consortium Testing',
    subGroups: [
      {
        id: 'tpa-non-dot',
        name: 'Non- DOT',
        services: drugAlcoholServices.filter(s => 
          s.name?.toLowerCase().includes('non-dot') || 
          s.service_code?.toLowerCase().includes('nd')
        ).slice(0, 5)
      },
      {
        id: 'tpa-dot',
        name: 'DOT',
        services: drugAlcoholServices.filter(s => 
          !s.name?.toLowerCase().includes('non-dot') && 
          !s.service_code?.toLowerCase().includes('nd')
        ).slice(0, 3)
      }
    ]
  };

  const inHouseServices: ServiceGroup = {
    id: 'in-house',
    name: 'In House – Non TPA Testing',
    subGroups: [
      {
        id: 'in-house-non-dot',
        name: 'Non- DOT',
        services: drugAlcoholServices.filter(s => 
          s.name?.toLowerCase().includes('non-dot') || 
          s.service_code?.toLowerCase().includes('nd')
        ).slice(5, 10)
      },
      {
        id: 'in-house-dot',
        name: 'DOT',
        services: drugAlcoholServices.filter(s => 
          !s.name?.toLowerCase().includes('non-dot') && 
          !s.service_code?.toLowerCase().includes('nd')
        ).slice(3, 6)
      }
    ]
  };

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-4">Drug & Alcohol</h3>

          <div className="space-y-4">
            {/* TPA Consortium Testing */}
            <div className="space-y-2">
              <h4 className="font-semibold text-base mb-2">{tpaServices.name}</h4>
              
              <div className="ml-4 space-y-2">
                <p className="text-sm text-muted-foreground mb-2">Select TPA Provider:</p>
                {visibleTpas.map((tpa) => (
                  <div key={tpa.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`tpa-${tpa.id}`}
                      checked={selectedTpa === tpa.id}
                      onCheckedChange={() => handleTpaSelection(tpa.id)}
                    />
                    <Label
                      htmlFor={`tpa-${tpa.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {tpa.name}
                    </Label>
                  </div>
                ))}
                
                {!showAllTpas && tpaProviders.length > 2 && (
                  <button
                    onClick={() => setShowAllTpas(true)}
                    className="text-sm text-primary hover:underline ml-6"
                  >
                    See more...
                  </button>
                )}

                {/* Show service groups only if a TPA is selected */}
                {selectedTpa && (
                  <div className="mt-4 space-y-2">
                    {tpaServices.subGroups.map((subGroup) => (
                      <div key={subGroup.id} className="space-y-2">
                        <Collapsible open={isGroupOpen(subGroup.id)}>
                          <CollapsibleTrigger
                            onClick={() => toggleGroup(subGroup.id)}
                            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                          >
                            {isGroupOpen(subGroup.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <span>+ {subGroup.name}</span>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent className="ml-6 mt-2 space-y-2">
                            {subGroup.services.map((service) => {
                              const isChecked = selectedServiceIds.includes(service.id);
                              return (
                                <div key={service.id} className="flex items-center gap-2">
                                  <Checkbox
                                    id={`service-${service.id}`}
                                    checked={isChecked}
                                    onCheckedChange={() => onServiceToggle(service.id)}
                                  />
                                  <Label
                                    htmlFor={`service-${service.id}`}
                                    className="text-sm font-normal cursor-pointer"
                                  >
                                    {service.name}
                                  </Label>
                                </div>
                              );
                            })}
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* In House Testing */}
            <div className="space-y-2">
              <h4 className="font-semibold text-base mb-2">{inHouseServices.name}</h4>
              
              <div className="ml-4 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox
                    id="in-house-select"
                    checked={billingType === 'client'}
                    onCheckedChange={(checked) => {
                      if (checked) handleInHouseSelection();
                    }}
                  />
                  <Label
                    htmlFor="in-house-select"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Select In-House (Billing for Client)
                  </Label>
                </div>

                {/* Show service groups only if In-House is selected */}
                {billingType === 'client' && (
                  <div className="space-y-2">
                    {inHouseServices.subGroups.map((subGroup) => (
                      <div key={subGroup.id} className="space-y-2">
                        <Collapsible open={isGroupOpen(subGroup.id)}>
                          <CollapsibleTrigger
                            onClick={() => toggleGroup(subGroup.id)}
                            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                          >
                            {isGroupOpen(subGroup.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <span>+ {subGroup.name}</span>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent className="ml-6 mt-2 space-y-2">
                            {subGroup.services.map((service) => {
                              const isChecked = selectedServiceIds.includes(service.id);
                              return (
                                <div key={service.id} className="flex items-center gap-2">
                                  <Checkbox
                                    id={`service-${service.id}`}
                                    checked={isChecked}
                                    onCheckedChange={() => onServiceToggle(service.id)}
                                  />
                                  <Label
                                    htmlFor={`service-${service.id}`}
                                    className="text-sm font-normal cursor-pointer"
                                  >
                                    {service.name}
                                  </Label>
                                </div>
                              );
                            })}
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reference ID Section */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center gap-4 mb-2">
              <Label className="text-sm font-semibold">Reference ID:</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="form-fox-id"
                  checked={referenceType === 'form_fox'}
                  onCheckedChange={(checked) => {
                    if (checked) setReferenceType('form_fox');
                  }}
                />
                <Label htmlFor="form-fox-id" className="text-sm font-normal cursor-pointer">
                  Form Fox ID
                </Label>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Input
                placeholder={referenceType === 'form_fox' ? 'Enter Form Fox ID' : 'Enter Other ID'}
                value={referenceValue}
                onChange={(e) => setReferenceValue(e.target.value)}
                className="max-w-md"
                disabled={referenceType !== 'form_fox'}
              />
              
              <div className="flex items-center gap-2">
                <Label className="text-sm font-normal">Other</Label>
                <Input
                  placeholder="Other reference"
                  className="max-w-xs"
                  disabled={referenceType === 'form_fox'}
                  onChange={(e) => {
                    if (referenceType === 'other') {
                      setReferenceValue(e.target.value);
                    }
                  }}
                  onFocus={() => setReferenceType('other')}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
