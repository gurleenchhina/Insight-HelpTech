import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/types';

// Validation schemas
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  pin: z.string().length(4, "PIN must be exactly 4 digits")
});

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  pin: z.string().length(4, "PIN must be exactly 4 digits"),
  confirmPin: z.string().length(4, "PIN must be exactly 4 digits"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required")
}).refine((data) => data.pin === data.confirmPin, {
  message: "PINs do not match",
  path: ["confirmPin"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

interface UserAuthProps {
  onLoginSuccess: (user: User) => void;
}

const UserAuth: React.FC<UserAuthProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      pin: ''
    }
  });

  // Signup form
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      pin: '',
      confirmPin: '',
      firstName: '',
      lastName: ''
    }
  });

  const onLogin = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await apiRequest({
        url: '/api/auth/login',
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
  
  const onSignup = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const { confirmPin, ...signupData } = data;
      
      const response = await apiRequest({
        url: '/api/auth/signup',
        method: 'POST',
        body: JSON.stringify(signupData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        onLoginSuccess(userData);
        
        toast({
          title: "Account created successfully",
          description: `Welcome, ${userData.firstName}!`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Registration failed",
          description: errorData.message || "Something went wrong",
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
    <Card className="w-[400px] mx-auto">
      <CardHeader>
        <CardTitle className="text-center">HelpTech</CardTitle>
        <CardDescription className="text-center">
          The trusted tool for Ontario pest control technicians
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={loginForm.handleSubmit(onLogin)}>
              <div className="grid w-full items-center gap-4 mt-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    placeholder="jsmith" 
                    {...loginForm.register('username')} 
                  />
                  {loginForm.formState.errors.username && (
                    <span className="text-sm text-red-500">{loginForm.formState.errors.username.message}</span>
                  )}
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="pin">PIN (4 digits)</Label>
                  <Input 
                    id="pin" 
                    type="password" 
                    placeholder="****" 
                    {...loginForm.register('pin')} 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                  />
                  {loginForm.formState.errors.pin && (
                    <span className="text-sm text-red-500">{loginForm.formState.errors.pin.message}</span>
                  )}
                </div>
              </div>
              <Button className="w-full mt-4" type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={signupForm.handleSubmit(onSignup)}>
              <div className="grid w-full items-center gap-4 mt-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="signupUsername">Username</Label>
                  <Input 
                    id="signupUsername" 
                    placeholder="jsmith" 
                    {...signupForm.register('username')} 
                  />
                  {signupForm.formState.errors.username && (
                    <span className="text-sm text-red-500">{signupForm.formState.errors.username.message}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      placeholder="John" 
                      {...signupForm.register('firstName')} 
                    />
                    {signupForm.formState.errors.firstName && (
                      <span className="text-sm text-red-500">{signupForm.formState.errors.firstName.message}</span>
                    )}
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Smith" 
                      {...signupForm.register('lastName')} 
                    />
                    {signupForm.formState.errors.lastName && (
                      <span className="text-sm text-red-500">{signupForm.formState.errors.lastName.message}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="signupPin">PIN (4 digits)</Label>
                  <Input 
                    id="signupPin" 
                    type="password" 
                    placeholder="****" 
                    {...signupForm.register('pin')} 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                  />
                  {signupForm.formState.errors.pin && (
                    <span className="text-sm text-red-500">{signupForm.formState.errors.pin.message}</span>
                  )}
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="confirmPin">Confirm PIN</Label>
                  <Input 
                    id="confirmPin" 
                    type="password" 
                    placeholder="****" 
                    {...signupForm.register('confirmPin')} 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                  />
                  {signupForm.formState.errors.confirmPin && (
                    <span className="text-sm text-red-500">{signupForm.formState.errors.confirmPin.message}</span>
                  )}
                </div>
              </div>
              <Button className="w-full mt-4" type="submit" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        <p>Test account: Username: jsmith / PIN: 5678</p>
      </CardFooter>
    </Card>
  );
};

export default UserAuth;