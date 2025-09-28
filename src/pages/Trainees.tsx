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
import { Plus, UserPlus, Edit, Eye, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PhotoUpload } from '@/components/PhotoUpload';
import { SignatureCapture } from '@/components/SignatureCapture';

interface Trainee {
  id: string;
  name: string;
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
    age: '',
    council_id: '',
    gender: 'Male',
    language: 'English',
    occupation_craft: '',
    notes: '',
    photo_url: '',
    signature_url: '',
    medical_history: '',
    status: 'active'
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
        trainee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainee.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainee.occupation_craft?.toLowerCase().includes(searchTerm.toLowerCase())
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
      age: '',
      council_id: '',
      gender: 'Male',
      language: 'English',
      occupation_craft: '',
      notes: '',
      photo_url: '',
      signature_url: '',
      medical_history: '',
      status: 'active'
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
      age: trainee.age?.toString() || '',
      council_id: trainee.council_id || '',
      gender: trainee.gender || 'Male',
      language: trainee.language || 'English',
      occupation_craft: trainee.occupation_craft || '',
      notes: trainee.notes || '',
      photo_url: trainee.photo_url || '',
      signature_url: trainee.signature_url || '',
      medical_history: trainee.medical_history || '',
      status: trainee.status || 'active'
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to manage trainees');
      return;
    }

    try {
      const traineeData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
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
        medical_history: formData.medical_history || null
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
    } catch (error) {
      console.error('Error saving trainee:', error);
      toast.error(`Failed to ${editingTrainee ? 'update' : 'add'} trainee`);
    }
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
                      <Label htmlFor="id">ID</Label>
                      <Input
                        id="council_id"
                        value={formData.council_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, council_id: e.target.value }))}
                        placeholder="123456789 - US"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                        placeholder="51"
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="graduated">Graduated</SelectItem>
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
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
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Occupation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainees.map((trainee) => (
                  <TableRow key={trainee.id}>
                    <TableCell>
                      {trainee.photo_url ? (
                        <img 
                          src={trainee.photo_url} 
                          alt="Trainee" 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <UserPlus className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{trainee.name}</TableCell>
                    <TableCell>{trainee.email || 'N/A'}</TableCell>
                    <TableCell>{trainee.mobile_number || 'N/A'}</TableCell>
                    <TableCell>{trainee.occupation_craft || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          trainee.status === 'active' ? 'default' : 
                          trainee.status === 'graduated' ? 'secondary' : 'outline'
                        }
                      >
                        {trainee.status}
                      </Badge>
                    </TableCell>
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