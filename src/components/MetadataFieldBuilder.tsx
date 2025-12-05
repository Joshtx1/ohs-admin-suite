import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

export interface MetadataField {
  fieldName: string;
  fieldLabel: string;
  fieldType: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'boolean' | 'textarea';
  required: boolean;
  options?: string[];
  category?: string;
  marketplaceTest?: boolean;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ServiceMetadata {
  fields: MetadataField[];
  fieldValues?: Record<string, any>;  // Stores actual values for this service (e.g., { specimen_type: "OF" })
  templates?: Record<string, any>;
}

interface MetadataFieldBuilderProps {
  fields: MetadataField[];
  onChange: (fields: MetadataField[]) => void;
  fieldValues?: Record<string, any>;
  onFieldValuesChange?: (values: Record<string, any>) => void;
}

export const MetadataFieldBuilder = ({ fields, onChange, fieldValues = {}, onFieldValuesChange }: MetadataFieldBuilderProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addField = () => {
    const newField: MetadataField = {
      fieldName: '',
      fieldLabel: '',
      fieldType: 'text',
      required: false,
    };
    onChange([...fields, newField]);
    setEditingIndex(fields.length);
  };

  const updateField = (index: number, updates: Partial<MetadataField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    
    // Auto-generate fieldName from fieldLabel if it's being set
    if (updates.fieldLabel && !newFields[index].fieldName) {
      newFields[index].fieldName = updates.fieldLabel
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
    }
    
    onChange(newFields);
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const updateFieldValue = (fieldName: string, value: any) => {
    if (onFieldValuesChange) {
      onFieldValuesChange({ ...fieldValues, [fieldName]: value });
    }
  };

  return (
    <div className="space-y-2">
      {fields.length > 0 && (
        <div className="border rounded-md">
        <div className="grid grid-cols-12 gap-2 p-2 bg-muted/50 text-xs font-medium border-b">
            <div className="col-span-2">Field Label</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-1">Options</div>
            <div className="col-span-2">Value</div>
            <div className="col-span-1">Mkt</div>
            <div className="col-span-1">Req</div>
            <div className="col-span-1"></div>
          </div>
          {fields.map((field, index) => {
            const isExpanded = editingIndex === index;
            const currentValue = fieldValues[field.fieldName] ?? '';
            
            return (
              <div key={index} className="border-b last:border-b-0">
                <div className="grid grid-cols-12 gap-2 p-2 items-center hover:bg-muted/30 transition-colors">
                  <div className="col-span-2">
                    <Input
                      className="h-8 text-sm"
                      placeholder="Field Label"
                      value={field.fieldLabel}
                      onChange={(e) => updateField(index, { fieldLabel: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Select
                      value={field.fieldType}
                      onValueChange={(value) => updateField(index, { fieldType: value as any })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="select">Dropdown</SelectItem>
                        <SelectItem value="multiselect">Multi-Select</SelectItem>
                        <SelectItem value="boolean">Checkbox</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="textarea">Text Area</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      className="h-8 text-sm"
                      placeholder="Category"
                      value={field.category || ''}
                      onChange={(e) => updateField(index, { category: e.target.value })}
                    />
                  </div>
                  <div className="col-span-1">
                    {['select', 'multiselect'].includes(field.fieldType) ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs px-1"
                        onClick={() => setEditingIndex(isExpanded ? null : index)}
                      >
                        {field.options?.filter(o => o.trim()).length || 0}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    {field.fieldType === 'select' && field.options && field.options.filter(o => o.trim()).length > 0 ? (
                      <Select
                        value={currentValue}
                        onValueChange={(value) => updateFieldValue(field.fieldName, value)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select value" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.filter(o => o.trim()).map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.fieldType === 'boolean' ? (
                      <div className="flex items-center h-8">
                        <Checkbox
                          checked={currentValue === true || currentValue === 'true'}
                          onCheckedChange={(checked) => updateFieldValue(field.fieldName, checked)}
                        />
                        <span className="ml-2 text-sm">{currentValue ? 'Yes' : 'No'}</span>
                      </div>
                    ) : (
                      <Input
                        className="h-8 text-sm"
                        type={field.fieldType === 'number' ? 'number' : field.fieldType === 'date' ? 'date' : 'text'}
                        placeholder="Enter value"
                        value={currentValue}
                        onChange={(e) => updateFieldValue(field.fieldName, e.target.value)}
                      />
                    )}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Checkbox
                      checked={field.marketplaceTest || false}
                      onCheckedChange={(checked) => updateField(index, { marketplaceTest: !!checked })}
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Checkbox
                      checked={field.required}
                      onCheckedChange={(checked) => updateField(index, { required: !!checked })}
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => removeField(index)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>

                {isExpanded && ['select', 'multiselect'].includes(field.fieldType) && (
                  <div className="p-3 bg-muted/20 border-t">
                    <Label className="text-xs mb-1 block">Options (one per line)</Label>
                    <Textarea
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                      value={field.options?.join('\n') || ''}
                      onChange={(e) =>
                        updateField(index, {
                          options: e.target.value.split('\n'),
                        })
                      }
                      rows={4}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Button type="button" variant="outline" onClick={addField} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Field
      </Button>
    </div>
  );
};

// Predefined templates for common service types
export const METADATA_TEMPLATES: Record<string, ServiceMetadata> = {
  'drug-screen': {
    fields: [
      {
        fieldName: 'service_type',
        fieldLabel: 'Service Type',
        fieldType: 'select',
        required: true,
        options: ['DOT', 'Non-DOT', 'Pre-Employment', 'Random', 'Post-Accident'],
      },
      {
        fieldName: 'specimen_type',
        fieldLabel: 'Specimen Type',
        fieldType: 'select',
        required: true,
        options: ['Urine', 'Hair', 'Saliva', 'Blood'],
      },
      {
        fieldName: 'panel_type',
        fieldLabel: 'Panel Type',
        fieldType: 'select',
        required: true,
        options: ['5-Panel', '10-Panel', '12-Panel'],
      },
      {
        fieldName: 'chain_of_custody_required',
        fieldLabel: 'Chain of Custody Required',
        fieldType: 'boolean',
        required: true,
        defaultValue: true,
      },
    ],
  },
  'respirator-fit': {
    fields: [
      {
        fieldName: 'mask_name',
        fieldLabel: 'Mask Name/Model',
        fieldType: 'text',
        required: true,
      },
      {
        fieldName: 'mask_type',
        fieldLabel: 'Mask Type',
        fieldType: 'select',
        required: true,
        options: ['Half Face', 'Full Face', 'N95', 'P100'],
      },
      {
        fieldName: 'size',
        fieldLabel: 'Size',
        fieldType: 'select',
        required: true,
        options: ['Small', 'Medium', 'Large', 'Extra Large'],
      },
      {
        fieldName: 'fit_test_type',
        fieldLabel: 'Fit Test Type',
        fieldType: 'select',
        required: true,
        options: ['Qualitative', 'Quantitative'],
      },
    ],
  },
  pft: {
    fields: [
      {
        fieldName: 'test_complete',
        fieldLabel: 'Test Complete',
        fieldType: 'boolean',
        required: true,
        defaultValue: false,
      },
      {
        fieldName: 'notes',
        fieldLabel: 'Notes',
        fieldType: 'textarea',
        required: false,
      },
    ],
  },
};
