import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from "sonner"
import { useFrappeAuth } from 'frappe-react-sdk';
import { useNavigate } from 'react-router-dom';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoginFormData = {
  username: string;
  password: string;
};

const LoginPage: React.FC = () => {
  const { currentUser, login, isLoading } = useFrappeAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      username: '',
      password: '',
    },
    mode: 'onBlur', // Validate on blur for better UX
  });
  

  const onSubmit = async (data: LoginFormData) => {
    try {

      console.log('Login requested .....');
      await login({ username: data.username, password: data.password }).then(() => {
        console.log('Login successful');
       toast.success("Login successful", {
        duration: 3000,
        position: 'top-right',
        style: {
          borderRadius: '10px',
          borderColor: 'green',
        },
       
       });
        
        navigate('/');
      }).catch((error) => {
        console.error('Login failed:', error);
        toast.success("Login failed", {
       
        description: error.message,
        descriptionClassName: 'text-red-500',
        duration: 3000,
        position: 'top-right',
        style: {
          borderRadius: '10px',
          borderColor: 'red',
        },
       
       });
        
        setLoginError(error.message || 'Invalid credentials');
      })
      
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error('Login failed');
      setLoginError(error.message || 'Invalid credentials');
    }
  };

  return (

    

    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Login Card */}
     

  <Card className="w-full max-w-sm">
   <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      
      </CardHeader>
      <CardContent>
         <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Controller
              name="username"
              control={control}
              rules={{
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Must be at least 3 characters',
                },
              }}
              render={({ field }) => (
                <>
              <Label htmlFor="username">Username </Label>
              <Input
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.username ? 'border-red-500' : ''
                    }`}
                id="username"
                type="text"
                placeholder="m@example.com"
                
                {...field}
              />
                </>
              )}
            />
            {/* {errors.username && (
              <Label className="text-red-500">
                {errors.username.message}
              </Label>
            )} */}

            </div>
            <div className="grid gap-2 ">
              <Controller
              name="password"
              control={control}
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 3,
                  message: 'Must be at least 3 characters',
                },
              }}
              render={({ field }) => (
                <>
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.password ? 'border-red-500' : ''
                    }`}
              id="password" type="password" {...field}/>
                </>
              )}
            />
            </div>
          </div>
       
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" disabled={isLoading} className="w-full">
          Login
        </Button>
      </CardFooter>
      </form>
    </Card>
  </div>
   
  );
};

export default LoginPage;
