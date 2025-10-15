import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

interface TPAClient {
  id: string;
  company_name: string;
}

interface ServiceSelectorProps {
  services: Service[];
  selectedTpaServiceIds: string[];
  selectedInHouseServiceIds: string[];
  onTpaServiceToggle: (serviceId: string) => void;
  onInHouseServiceToggle: (serviceId: string) => void;
  onTpaSelect?: (tpaId: string) => void;
  onBillingTypeChange?: (type: 'tpa' | 'client' | 'both') => void;
}

export function ServiceSelector({ services, selectedTpaServiceIds, selectedInHouseServiceIds, onTpaServiceToggle, onInHouseServiceToggle, onTpaSelect, onBillingTypeChange }: ServiceSelectorProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [formFoxId, setFormFoxId] = useState('');
  const [otherReference, setOtherReference] = useState('');
  const [selectedTpa, setSelectedTpa] = useState<string>('');
  const [tpaClients, setTpaClients] = useState<TPAClient[]>([]);

  // Fetch TPA clients from database
  useEffect(() => {
    const fetchTpaClients = async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, company_name')
        .eq('mem_type', 'TPA')
        .eq('status', 'active')
        .order('company_name');
      
      if (data && !error) {
        setTpaClients(data);
      }
    };
    
    fetchTpaClients();
  }, []);

  const handleTpaSelect = (tpaId: string) => {
    setSelectedTpa(tpaId);
    onTpaSelect?.(tpaId);
    onBillingTypeChange?.(tpaId ? 'tpa' : 'client');
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
                      {tpaClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.company_name}
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
                              const isChecked = selectedTpaServiceIds.includes(service.id);
                              return (
                                <div key={service.id} className="flex items-center gap-2">
                                  <Checkbox
                                    id={`tpa-service-${service.id}`}
                                    checked={isChecked}
                                    onCheckedChange={() => onTpaServiceToggle(service.id)}
                                  />
                                  <Label
                                    htmlFor={`tpa-service-${service.id}`}
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

            {/* Reference ID Section */}
            <div className="mt-6 pt-4">
              <div className="flex items-center gap-4">
                <Label className="text-sm font-semibold whitespace-nowrap">Reference ID:</Label>
                <Input
                  placeholder="Enter FormFox ID"
                  value={formFoxId}
                  onChange={(e) => setFormFoxId(e.target.value)}
                  className="max-w-xs"
                />
                
                <Label className="text-sm font-normal whitespace-nowrap">Other</Label>
                <Input
                  placeholder="Other reference"
                  value={otherReference}
                  onChange={(e) => setOtherReference(e.target.value)}
                  className="max-w-xs"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t my-6"></div>

            {/* In House Testing */}
            <div className="space-y-2">
              <h4 className="font-semibold text-base mb-2">{inHouseServices.name}</h4>
              
              <div className="ml-4 space-y-2">
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
                            const isChecked = selectedInHouseServiceIds.includes(service.id);
                            return (
                              <div key={service.id} className="flex items-center gap-2">
                                <Checkbox
                                  id={`inhouse-service-${service.id}`}
                                  checked={isChecked}
                                  onCheckedChange={() => onInHouseServiceToggle(service.id)}
                                />
                                <Label
                                  htmlFor={`inhouse-service-${service.id}`}
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
              </div>
            </div>
          </div>

        </div>
      </div>
    </ScrollArea>
  );
}
