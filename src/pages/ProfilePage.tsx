import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { Pencil } from 'lucide-react';

const ProfilePage = () => {
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);

    const [formData, setFormData] = useState({
        displayName: '',
        contact: '',
        role: '',
        experienceLevel: '',
        preferredLanguages: '',
        bio: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const response = await fetch(`${API_URL}/api/user/${user.uid}`);
                if (response.ok) {
                    const data = await response.json();
                    setProfileData(data);
                    setFormData({
                        displayName: data.displayName || '',
                        contact: data.contact || '',
                        role: data.role || '',
                        experienceLevel: data.experienceLevel || '',
                        preferredLanguages: data.preferredLanguages || '',
                        bio: data.bio || ''
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        };

        fetchProfile();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateProfile(formData);
            setProfileData({ ...profileData, ...formData });
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!profileData) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Header />
                <div className="container mx-auto px-4 py-20 text-center">
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Header />
            <div className="container mx-auto px-4 py-20 max-w-2xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Your Profile</h1>
                        <p className="text-gray-400">View and manage your profile information.</p>
                    </div>
                    {!isEditing && (
                        <Button onClick={() => setIsEditing(true)} className="bg-white text-black hover:bg-gray-200">
                            <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                        </Button>
                    )}
                </div>

                {!isEditing ? (
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">Profile Information</CardTitle>
                            <CardDescription className="text-gray-400">Your personal details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-white">
                            <div>
                                <Label className="text-gray-400">Display Name</Label>
                                <p className="text-lg">{profileData.displayName || 'Not set'}</p>
                            </div>
                            <div>
                                <Label className="text-gray-400">Email</Label>
                                <p className="text-lg">{user?.email}</p>
                            </div>
                            <div>
                                <Label className="text-gray-400">Contact</Label>
                                <p className="text-lg">{profileData.contact || 'Not set'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-400">Role</Label>
                                    <p className="text-lg">{profileData.role || 'Not set'}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-400">Experience Level</Label>
                                    <p className="text-lg">{profileData.experienceLevel || 'Not set'}</p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-gray-400">Preferred Languages</Label>
                                <p className="text-lg">{profileData.preferredLanguages || 'Not set'}</p>
                            </div>
                            <div>
                                <Label className="text-gray-400">Bio</Label>
                                <p className="text-lg">{profileData.bio || 'Not set'}</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input
                                id="displayName"
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleChange}
                                className="bg-black/50 border-white/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contact">Contact</Label>
                            <Input
                                id="contact"
                                name="contact"
                                value={formData.contact}
                                onChange={handleChange}
                                className="bg-black/50 border-white/20"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Select value={formData.role} onValueChange={(val) => handleSelectChange('role', val)}>
                                    <SelectTrigger className="bg-black/50 border-white/20">
                                        <SelectValue placeholder="Select your role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Student">Student</SelectItem>
                                        <SelectItem value="Professional">Professional</SelectItem>
                                        <SelectItem value="Hobbyist">Hobbyist</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Experience Level</Label>
                                <Select value={formData.experienceLevel} onValueChange={(val) => handleSelectChange('experienceLevel', val)}>
                                    <SelectTrigger className="bg-black/50 border-white/20">
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                        <SelectItem value="Expert">Expert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="preferredLanguages">Preferred Languages</Label>
                            <Input
                                id="preferredLanguages"
                                name="preferredLanguages"
                                value={formData.preferredLanguages}
                                onChange={handleChange}
                                className="bg-black/50 border-white/20"
                                placeholder="e.g. JavaScript, Python, C++"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                className="bg-black/50 border-white/20 min-h-[100px]"
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" className="flex-1 bg-white text-black hover:bg-gray-200" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
