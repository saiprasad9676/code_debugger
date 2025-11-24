import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Header from '@/components/Header';

const Onboarding = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        contact: '',
        role: '',
        experienceLevel: '',
        preferredLanguages: '',
        bio: ''
    });

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
            navigate('/editor');
        } catch (error) {
            toast.error("Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Header />
            <div className="container mx-auto px-4 py-20 max-w-2xl">
                <h1 className="text-4xl font-bold mb-2 text-center">Complete Your Profile</h1>
                <p className="text-gray-400 text-center mb-8">Tell us a bit about yourself to get started.</p>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">

                    <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                            id="displayName"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleChange}
                            className="bg-black/50 border-white/20"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contact">Contact (Email or Phone)</Label>
                        <Input
                            id="contact"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            className="bg-black/50 border-white/20"
                            placeholder="How can we reach you?"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select onValueChange={(val) => handleSelectChange('role', val)} required>
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
                            <Select onValueChange={(val) => handleSelectChange('experienceLevel', val)} required>
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
                        <Label htmlFor="bio">Bio / About Me</Label>
                        <Textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            className="bg-black/50 border-white/20 min-h-[100px]"
                            placeholder="Tell us about your coding journey..."
                        />
                    </div>

                    <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200" disabled={loading}>
                        {loading ? 'Saving...' : 'Complete Profile'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
