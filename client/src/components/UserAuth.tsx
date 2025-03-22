import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/types';

// Validation schema
const loginSchema = z.object({
  techId: z.string().length(4, "Tech ID must be exactly 4 digits"),
  pin: z.string().length(4, "PIN must be exactly 4 digits")
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface UserAuthProps {
  onLoginSuccess: (user: User) => void;
}

const UserAuth: React.FC<UserAuthProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      techId: '',
      pin: ''
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        onLoginSuccess(userData);
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${userData.firstName}!`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Login failed",
          description: errorData.message || "Invalid credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Connection error. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[350px] mx-auto">
      <CardHeader>
        <CardTitle className="text-center">HelpTech</CardTitle>
        <CardDescription className="text-center">
          Enter your technician ID and PIN
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="techId">Technician ID (4 digits)</Label>
              <Input 
                id="techId" 
                placeholder="1234" 
                {...register('techId')} 
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
              />
              {errors.techId && (
                <span className="text-sm text-red-500">{errors.techId.message}</span>
              )}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="pin">PIN (4 digits)</Label>
              <Input 
                id="pin" 
                type="password" 
                placeholder="****" 
                {...register('pin')} 
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
              />
              {errors.pin && (
                <span className="text-sm text-red-500">{errors.pin.message}</span>
              )}
            </div>
          </div>
          <Button className="w-full mt-4" type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        Test credentials: ID: 1234 / PIN: 5678
      </CardFooter>
    </Card>
  );
};

export default UserAuth;