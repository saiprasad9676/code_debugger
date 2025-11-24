import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Header from '@/components/Header';

const ProfilePage = () => {
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
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
        // Fetch user profile from backend
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
                <h1 className="text-4xl font-bold mb-2">Your Profile</h1>
                <p className="text-gray-400 mb-8">View and update your profile information.</p>

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

                    <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200" disabled={loading}>
                        {loading ? 'Saving...' : 'Update Profile'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
