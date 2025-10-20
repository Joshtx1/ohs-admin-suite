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
  placeholder?: string;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ServiceMetadata {
  fields: MetadataField[];
  templates?: Record<string, any>;
}

interface MetadataFieldBuilderProps {
  fields: MetadataField[];
  onChange: (fields: MetadataField[]) => void;
}

export const MetadataFieldBuilder = ({ fields, onChange }: MetadataFieldBuilderProps) => {
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

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <Card key={index} className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Field {index + 1}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeField(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Field Label</Label>
                <Input
                  placeholder="e.g., Specimen Type"
                  value={field.fieldLabel}
                  onChange={(e) => updateField(index, { fieldLabel: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Field Type</Label>
                <Select
                  value={field.fieldType}
                  onValueChange={(value) => updateField(index, { fieldType: value as any })}
                >
                  <SelectTrigger>
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
            </div>

            {['select', 'multiselect'].includes(field.fieldType) && (
              <div className="space-y-1">
                <Label className="text-xs">Options (one per line)</Label>
                <Textarea
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  value={field.options?.join('\n') || ''}
                  onChange={(e) =>
                    updateField(index, {
                      options: e.target.value.split('\n').filter((o) => o.trim()),
                    })
                  }
                  rows={3}
                />
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs">Placeholder (optional)</Label>
              <Input
                placeholder="Enter placeholder text"
                value={field.placeholder || ''}
                onChange={(e) => updateField(index, { placeholder: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={field.required}
                onCheckedChange={(checked) => updateField(index, { required: !!checked })}
              />
              <Label className="text-sm">Required field</Label>
            </div>
          </div>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={addField} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Custom Field
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
        placeholder: 'e.g., 3M 6200',
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
        placeholder: 'Additional notes about the test...',
      },
    ],
  },
};
