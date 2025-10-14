import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  onTpaSelect?: (tpaIds: string[]) => void;
  onBillingTypeChange?: (type: 'tpa' | 'client' | 'both') => void;
}

export function ServiceSelector({ services, selectedServiceIds, onServiceToggle, onTpaSelect, onBillingTypeChange }: ServiceSelectorProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [referenceType, setReferenceType] = useState<'form_fox' | 'other'>('form_fox');
  const [referenceValue, setReferenceValue] = useState('');
  const [selectedTpa, setSelectedTpa] = useState<string>('');
  const [inHouseSelected, setInHouseSelected] = useState(false);

  // Available TPA providers
  const tpaProviders: TPA[] = [
    { id: 'disa', name: 'DISA' },
    { id: 'asap', name: 'ASAP' },
    { id: 'tpa-3', name: 'TPA Provider 3' },
    { id: 'tpa-4', name: 'TPA Provider 4' },
    { id: 'tpa-5', name: 'TPA Provider 5' },
  ];

  const handleTpaSelect = (tpaId: string) => {
    setSelectedTpa(tpaId);
    onTpaSelect?.(tpaId ? [tpaId] : []);
    
    // Update billing type
    if (tpaId && inHouseSelected) {
      onBillingTypeChange?.('both');
    } else if (tpaId) {
      onBillingTypeChange?.('tpa');
    } else if (inHouseSelected) {
      onBillingTypeChange?.('client');
    }
  };

  const handleInHouseToggle = () => {
    const newInHouseSelected = !inHouseSelected;
    setInHouseSelected(newInHouseSelected);
    
    // Update billing type
    if (selectedTpa && newInHouseSelected) {
      onBillingTypeChange?.('both');
    } else if (selectedTpa) {
      onBillingTypeChange?.('tpa');
    } else if (newInHouseSelected) {
      onBillingTypeChange?.('client');
    }
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

  // Filter specific services by exact names
  const getSpecificServices = (serviceNames: string[]) => {
    return services.filter(s => 
      serviceNames.some(name => 
        s.name?.toLowerCase().includes(name.toLowerCase())
      )
    );
  };

  // TPA Services - specific services only
  const tpaServices: ServiceGroup = {
    id: 'tpa-consortium',
    name: 'TPA Consortium Testing',
    subGroups: [
      {
        id: 'tpa-non-dot',
        name: 'Non-DOT',
        services: getSpecificServices([
          'NON-DOT URINE',
          'NON-DOT BREATH ALCOHOL',
          'NON-DOT HAIR FOLLICLE',
          'NON-DOT ORAL FLUID'
        ])
      },
      {
        id: 'tpa-dot',
        name: 'DOT',
        services: services.filter(s => 
          s.name?.toLowerCase().includes('dot') && 
          !s.name?.toLowerCase().includes('non-dot') &&
          (s.name?.toLowerCase().includes('urine') ||
           s.name?.toLowerCase().includes('breath alcohol') ||
           s.name?.toLowerCase().includes('oral fluid'))
        )
      }
    ]
  };

  // In-House Services
  const inHouseServices: ServiceGroup = {
    id: 'in-house',
    name: 'In House – Non TPA Testing',
    subGroups: [
      {
        id: 'in-house-non-dot',
        name: 'Non-DOT',
        services: [
          ...getSpecificServices([
            'NON-DOT URINE',
            'NON-DOT BREATH ALCOHOL',
            'NON-DOT HAIR FOLLICLE',
            'NON-DOT ORAL FLUID'
          ]),
          ...services.filter(s =>
            s.name?.toLowerCase().includes('rapid 5') ||
            s.name?.toLowerCase().includes('rapid 10')
          )
        ]
      },
      {
        id: 'in-house-dot',
        name: 'DOT',
        services: services.filter(s => 
          s.name?.toLowerCase().includes('dot') && 
          !s.name?.toLowerCase().includes('non-dot') &&
          (s.name?.toLowerCase().includes('urine') ||
           s.name?.toLowerCase().includes('breath alcohol') ||
           s.name?.toLowerCase().includes('oral fluid'))
        )
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
                <div className="mb-4">
                  <Select value={selectedTpa} onValueChange={handleTpaSelect}>
                    <SelectTrigger className="w-[280px]">
                      <SelectValue placeholder="Select TPA Client" />
                    </SelectTrigger>
                    <SelectContent>
                      {tpaProviders.map((tpa) => (
                        <SelectItem key={tpa.id} value={tpa.id}>
                          {tpa.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Show service groups if TPA is selected */}
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
                    checked={inHouseSelected}
                    onCheckedChange={handleInHouseToggle}
                  />
                  <Label
                    htmlFor="in-house-select"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Select In-House (Billing for Client)
                  </Label>
                </div>

                {/* Show service groups if In-House is selected */}
                {inHouseSelected && (
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
