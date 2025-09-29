import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, UserPlus, Edit, Eye, Search, Filter, Download, Upload } from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PhotoUpload } from '@/components/PhotoUpload';
import { SignatureCapture } from '@/components/SignatureCapture';

interface Trainee {
  id: string;
  unique_id: string | null;
  name: string;
  ssn: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  mobile_number: string | null;
  date_of_birth: string | null;
  license_number: string | null;
  license_type: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  height: string | null;
  hair: string | null;
  eyes: string | null;
  age: number | null;
  council_id: string | null;
  gender: string | null;
  language: string | null;
  occupation_craft: string | null;
  notes: string | null;
  photo_url: string | null;
  signature_url: string | null;
  medical_history: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const Trainees = () => {
  const { user } = useAuth();
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [filteredTrainees, setFilteredTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrainee, setEditingTrainee] = useState<Trainee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    ssn: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile_number: '',
    date_of_birth: '',
    license_number: '',
    license_type: 'Drivers License',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    height: '',
    hair: '',
    eyes: '',
    council_id: '',
    gender: 'Male',
    language: 'English',
    occupation_craft: '',
    notes: '',
    photo_url: '',
    signature_url: '',
    medical_history: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchTrainees();
  }, []);

  useEffect(() => {
    filterTrainees();
  }, [trainees, searchTerm, statusFilter]);

  const filterTrainees = () => {
    let filtered = trainees;

    if (searchTerm) {
      filtered = filtered.filter(trainee =>
        trainee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainee.ssn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainee.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainee.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainee.mobile_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(trainee => trainee.status === statusFilter);
    }

    setFilteredTrainees(filtered);
  };

  const fetchTrainees = async () => {
    try {
      const { data, error } = await supabase
        .from('trainees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrainees(data || []);
    } catch (error) {
      console.error('Error fetching trainees:', error);
      toast.error('Failed to load trainees');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      ssn: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      email: '',
      phone: '',
      mobile_number: '',
      date_of_birth: '',
      license_number: '',
      license_type: 'Drivers License',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      height: '',
      hair: '',
      eyes: '',
      council_id: '',
      gender: 'Male',
      language: 'English',
      occupation_craft: '',
      notes: '',
      photo_url: '',
      signature_url: '',
      medical_history: '',
      status: 'Active'
    });
    setEditingTrainee(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (trainee: Trainee) => {
    setEditingTrainee(trainee);
    setFormData({
      name: trainee.name || '',
      ssn: trainee.ssn || '',
      first_name: trainee.first_name || '',
      middle_name: trainee.middle_name || '',
      last_name: trainee.last_name || '',
      email: trainee.email || '',
      phone: trainee.phone || '',
      mobile_number: trainee.mobile_number || '',
      date_of_birth: trainee.date_of_birth || '',
      license_number: trainee.license_number || '',
      license_type: trainee.license_type || 'Drivers License',
      street: trainee.street || '',
      city: trainee.city || '',
      state: trainee.state || '',
      zip: trainee.zip || '',
      country: trainee.country || '',
      height: trainee.height || '',
      hair: trainee.hair || '',
      eyes: trainee.eyes || '',
      council_id: trainee.council_id || '',
      gender: trainee.gender || 'Male',
      language: trainee.language || 'English',
      occupation_craft: trainee.occupation_craft || '',
      notes: trainee.notes || '',
      photo_url: trainee.photo_url || '',
      signature_url: trainee.signature_url || '',
      medical_history: trainee.medical_history || '',
      status: trainee.status || 'Active'
    });
    setDialogOpen(true);
  };

  // Calculate age from birthdate
  const calculateAge = (birthDate: string): number | null => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to manage trainees');
      return;
    }

    if (!formData.ssn) {
      toast.error('SSN is required');
      return;
    }

    try {
      const age = calculateAge(formData.date_of_birth);
      const traineeData = {
        ...formData,
        age,
        created_by: editingTrainee ? undefined : user.id,
        date_of_birth: formData.date_of_birth || null,
        email: formData.email || null,
        phone: formData.phone || null,
        mobile_number: formData.mobile_number || null,
        license_number: formData.license_number || null,
        street: formData.street || null,
        city: formData.city || null,
        state: formData.state || null,
        zip: formData.zip || null,
        country: formData.country || null,
        height: formData.height || null,
        hair: formData.hair || null,
        eyes: formData.eyes || null,
        council_id: formData.council_id || null,
        gender: formData.gender || null,
        language: formData.language || null,
        occupation_craft: formData.occupation_craft || null,
        notes: formData.notes || null,
        photo_url: formData.photo_url || null,
        signature_url: formData.signature_url || null,
        medical_history: formData.medical_history || null,
        ssn: formData.ssn || null
      };

      if (editingTrainee) {
        const { error } = await supabase
          .from('trainees')
          .update(traineeData)
          .eq('id', editingTrainee.id);
        
        if (error) throw error;
        toast.success('Trainee updated successfully');
      } else {
        const { error } = await supabase
          .from('trainees')
          .insert([traineeData]);
        
        if (error) throw error;
        toast.success('Trainee added successfully');
      }

      setDialogOpen(false);
      resetForm();
      fetchTrainees();
    } catch (error: any) {
      console.error('Error saving trainee:', error);
      if (error?.message?.includes('duplicate') || error?.message?.includes('unique')) {
        toast.error('A trainee with this SSN already exists');
      } else {
        toast.error(`Failed to ${editingTrainee ? 'update' : 'add'} trainee`);
      }
    }
  };

  // Export functionality
  const exportToCSV = () => {
    const csvData = filteredTrainees.map(trainee => ({
      'Internal ID': trainee.id || '',
      'Unique ID': trainee.unique_id || '',
      'SSN': trainee.ssn || '',
      'Name': trainee.name || '',
      'First Name': trainee.first_name || '',
      'Middle Name': trainee.middle_name || '',
      'Last Name': trainee.last_name || '',
      'Email': trainee.email || '',
      'Phone': trainee.phone || '',
      'Mobile Number': trainee.mobile_number || '',
      'Date of Birth': trainee.date_of_birth || '',
      'Age': trainee.age || '',
      'Gender': trainee.gender || '',
      'Language': trainee.language || '',
      'License Number': trainee.license_number || '',
      'License Type': trainee.license_type || '',
      'Street': trainee.street || '',
      'City': trainee.city || '',
      'State': trainee.state || '',
      'Zip': trainee.zip || '',
      'Country': trainee.country || '',
      'Height': trainee.height || '',
      'Hair': trainee.hair || '',
      'Eyes': trainee.eyes || '',
      'Council ID': trainee.council_id || '',
      'Occupation/Craft': trainee.occupation_craft || '',
      'Notes': trainee.notes || '',
      'Photo URL': trainee.photo_url || '',
      'Signature URL': trainee.signature_url || '',
      'Medical History': trainee.medical_history || '',
      'Status': trainee.status || '',
      'Created At': trainee.created_at || '',
      'Updated At': trainee.updated_at || ''
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `trainees_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Export completed successfully');
  };

  // Header mapping for flexible CSV import
  const createHeaderMap = (headers: string[]) => {
    const headerMap: { [key: string]: string } = {};
    
    const mappings = {
      // ID fields (will be skipped)
      'internal id': 'id',
      'unique id': 'unique_id',
      // Basic info
      'name': 'name',
      'first name': 'first_name',
      'middle name': 'middle_name', 
      'last name': 'last_name',
      'ssn': 'ssn',
      'email': 'email',
      'phone': 'phone',
      'mobile number': 'mobile_number',
      'date of birth': 'date_of_birth',
      'age': 'age',
      'gender': 'gender',
      'language': 'language',
      // License info
      'license number': 'license_number',
      'license type': 'license_type',
      // Address
      'street': 'street',
      'city': 'city',
      'state': 'state',
      'zip': 'zip',
      'country': 'country',
      // Physical attributes
      'height': 'height',
      'hair': 'hair',
      'eyes': 'eyes',
      // Additional info
      'council id': 'council_id',
      'occupation/craft': 'occupation_craft',
      'status': 'status',
      'notes': 'notes',
      'photo url': 'photo_url',
      'signature url': 'signature_url',
      'medical history': 'medical_history'
    };

    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().trim();
      if (mappings[normalizedHeader]) {
        headerMap[header] = mappings[normalizedHeader];
      }
    });

    return headerMap;
  };

  // Convert date formats (MM/DD/YYYY to YYYY-MM-DD)
  const convertDateFormat = (dateStr: string | null): string | null => {
    if (!dateStr) return null;
    
    try {
      // Handle MM/DD/YYYY format
      if (dateStr.includes('/')) {
        const [month, day, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Handle YYYY-MM-DD format (already correct)
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr;
      }
      
      // Try to parse other formats
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
      return null;
    } catch (error) {
      console.warn('Could not convert date:', dateStr);
      return null;
    }
  };

  // Import functionality
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      complete: async (results) => {
        const importData = results.data as any[];
        console.log('Raw import data:', importData);
        
        if (importData.length === 0) {
          toast.error('No data found in CSV file');
          return;
        }

        const headers = Object.keys(importData[0]);
        const headerMap = createHeaderMap(headers);
        console.log('Header mapping:', headerMap);
        
        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        // Process rows sequentially to avoid overwhelming the database
        for (let i = 0; i < importData.length; i++) {
          const row = importData[i];
          
          try {
            // Build trainee data using header mapping
            const traineeData: any = {
              created_by: user?.id,
              status: 'Active'
            };

            // Map CSV columns to database columns
            Object.entries(row).forEach(([csvHeader, value]) => {
              const dbColumn = headerMap[csvHeader];
              if (dbColumn && value !== null && value !== undefined && value !== '') {
                // Skip auto-generated fields
                if (dbColumn === 'id' || dbColumn === 'unique_id') {
                  return;
                }
                
                // Handle date fields
                if (dbColumn === 'date_of_birth') {
                  traineeData[dbColumn] = convertDateFormat(value as string);
                } else {
                  traineeData[dbColumn] = value;
                }
              }
            });

            // Calculate age if date of birth is provided
            if (traineeData.date_of_birth) {
              traineeData.age = calculateAge(traineeData.date_of_birth);
            }

            // Validate required fields
            if (!traineeData.name && !traineeData.first_name && !traineeData.last_name) {
              errors.push(`Row ${i + 1}: Missing name information`);
              errorCount++;
              continue;
            }

            console.log(`Processing row ${i + 1}:`, traineeData);

            const { error } = await supabase
              .from('trainees')
              .insert([traineeData]);
            
            if (error) {
              console.error(`Error importing row ${i + 1}:`, error);
              errors.push(`Row ${i + 1}: ${error.message}`);
              errorCount++;
            } else {
              successCount++;
            }
          } catch (error) {
            console.error(`Error processing row ${i + 1}:`, error);
            errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            errorCount++;
          }
        }
        
        // Show detailed results
        if (successCount > 0) {
          toast.success(`Successfully imported ${successCount} trainee(s)`);
        }
        
        if (errorCount > 0) {
          console.error('Import errors:', errors);
          toast.error(`Failed to import ${errorCount} trainee(s). Check console for details.`);
        }
        
        fetchTrainees();
      },
      error: (error) => {
        console.error('CSV parse error:', error);
        toast.error(`Error parsing CSV file: ${error.message}`);
      }
    });
    
    // Reset file input
    event.target.value = '';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading trainees...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Trainees</h1>
          <p className="text-muted-foreground">
            Manage trainee information and assignments
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <label htmlFor="import-csv">
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </span>
            </Button>
          </label>
          <input
            id="import-csv"
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Trainee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTrainee ? 'Edit Trainee' : 'Add New Trainee'}
              </DialogTitle>
              <DialogDescription>
                Enter the trainee's comprehensive information below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Photo Upload */}
                  <div className="space-y-2">
                    <Label>Photo</Label>
                    <PhotoUpload
                      currentPhotoUrl={formData.photo_url}
                      onPhotoUpload={(url) => setFormData(prev => ({ ...prev, photo_url: url }))}
                      traineeId={editingTrainee?.id}
                    />
                  </div>

                  {/* Personal Details */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="height">Height</Label>
                      <Input
                        id="height"
                        value={formData.height}
                        onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                        placeholder="5' 7&quot;"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hair">Hair</Label>
                      <Input
                        id="hair"
                        value={formData.hair}
                        onChange={(e) => setFormData(prev => ({ ...prev, hair: e.target.value }))}
                        placeholder="BRO"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eyes">Eyes</Label>
                      <Input
                        id="eyes"
                        value={formData.eyes}
                        onChange={(e) => setFormData(prev => ({ ...prev, eyes: e.target.value }))}
                        placeholder="BRO"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="ssn">SSN *</Label>
                      <Input
                        id="ssn"
                        value={formData.ssn}
                        onChange={(e) => setFormData(prev => ({ ...prev, ssn: e.target.value }))}
                        placeholder="123-45-6789"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age (Auto)</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.date_of_birth ? calculateAge(formData.date_of_birth)?.toString() || '' : ''}
                        placeholder="Auto-calculated"
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">DOB</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select 
                        value={formData.gender} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select 
                        value={formData.language} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First *</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value, name: `${e.target.value} ${prev.middle_name || ''} ${prev.last_name || ''}`.trim() }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="middle_name">Middle</Label>
                      <Input
                        id="middle_name"
                        value={formData.middle_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, middle_name: e.target.value, name: `${prev.first_name || ''} ${e.target.value} ${prev.last_name || ''}`.trim() }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last *</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value, name: `${prev.first_name || ''} ${prev.middle_name || ''} ${e.target.value}`.trim() }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="license_number">License Number</Label>
                      <Input
                        id="license_number"
                        value={formData.license_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="license_type">License Type</Label>
                      <Select 
                        value={formData.license_type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, license_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Drivers License">Drivers License</SelectItem>
                          <SelectItem value="State ID">State ID</SelectItem>
                          <SelectItem value="Passport">Passport</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Address Fields */}
                  <div className="space-y-2">
                    <Label htmlFor="street">Street</Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="zip">Zip</Label>
                      <Input
                        id="zip"
                        value={formData.zip}
                        onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile_number">Mobile Number</Label>
                    <Input
                      id="mobile_number"
                      value={formData.mobile_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, mobile_number: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occupation_craft">Occupation/Craft</Label>
                    <Input
                      id="occupation_craft"
                      value={formData.occupation_craft}
                      onChange={(e) => setFormData(prev => ({ ...prev, occupation_craft: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Full Width Sections */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Signature</Label>
                  <SignatureCapture
                    currentSignatureUrl={formData.signature_url}
                    onSignatureCapture={(url) => setFormData(prev => ({ ...prev, signature_url: url }))}
                    traineeId={editingTrainee?.id}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600">
                  {editingTrainee ? 'Update' : 'Add Trainee'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trainees by name, email, or occupation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Trainees Overview
          </CardTitle>
          <CardDescription>
            Total trainees: {trainees.length} | Filtered: {filteredTrainees.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTrainees.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {trainees.length === 0 ? 'No trainees found' : 'No trainees match your search'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {trainees.length === 0 
                  ? 'Get started by adding your first trainee.' 
                  : 'Try adjusting your search terms or filters.'
                }
              </p>
              {trainees.length === 0 && (
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Trainee
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SSN</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainees.map((trainee) => (
                  <TableRow key={trainee.id}>
                    <TableCell className="font-medium">{trainee.ssn || 'N/A'}</TableCell>
                    <TableCell>{trainee.name}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          trainee.status === 'Active' ? 'default' : 
                          trainee.status === 'Suspended' ? 'destructive' : 'outline'
                        }
                      >
                        {trainee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{trainee.phone || trainee.mobile_number || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditDialog(trainee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Trainees;