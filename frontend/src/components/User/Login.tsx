import Button from '../Button/Button';
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from 'react';
import { useUser } from '../../context/UserContext';
import api from '../../api';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import FormField from '../FormUtils/FormField';
import { useForm, Controller } from "react-hook-form"

const UserSchema = z.object({
    username: z.string().min(3).max(60),
    password: z.string().min(3)
})

type TUserSchema = z.infer<typeof UserSchema>;

export default function Login() {
    const { register, handleSubmit, control } = useForm<TUserSchema>({
        resolver: zodResolver(UserSchema),
        defaultValues: {
            username: '',
            password: ''
        }
    });

    const [passwordView, setPasswordView] = useState(false);
    const [error, setError] = useState<string | null>('');
    const navigate = useNavigate();
    const { handleUserLogin } = useUser();

    const handlePasswordView = () => {
        setPasswordView(!passwordView);
    };

    const onSubmit = (data: TUserSchema) => console.log(data)

    const handleLogin = async (data: TUserSchema) => {
        console.log("handleLogin triggered")
        await api
            .post('/users/login', data)
            .then((res) => {
                localStorage.setItem('token', res.data.token);
                handleUserLogin();
                navigate('/dashboard');
            })
            .catch((err) => {
                console.error(err);
                setError(`Error while logging: ${err.message}`);
            });
    };
    handleLogin({ username: '', password: '' });

    let passwordIcon;
    if (!passwordView) {
        passwordIcon = (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 text-black"
                onClick={handlePasswordView}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
            </svg>
        );
    } else {
        passwordIcon = (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 text-black"
                onClick={handlePasswordView}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                />
            </svg>
        );
    }

    return (
        <div>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="relative bg-gradient-to-r from-rose-400 to-rose-500 p-8 lg:p-16 rounded-4xl text-center max-w-3xs md:max-w-2xl lg:max-w-3xl z-10 shadow-2xl backdrop-blur-3xl m-auto"
            >
                <h1 className="text-2xl md:text-3xl font-bold mb-8">
                    Login form
                </h1>
                <Controller 
                    name='username'
                    control={control}
                    render={({field}) => (
                        <FormField
                            label="Username:"
                            type='text'
                            id='username'
                            {...field}
                        />
                    )}
                />
                <Controller 
                    name='password'
                    control={control}
                    render={({field}) => (        
                        <FormField
                            label="Password:"
                            type={passwordView ? 'text' : 'password'}
                            id="password"
                            {...field}
                        >
                            <span className="self-end relative bottom-8.5 right-1.5">
                                {passwordIcon}
                            </span>
                        </FormField>
                    )}
                />
                <p className="flex my-4 flex-col">
                    <Button text="Login" />
                </p>
                <p id="status" className="text-orange-300 font-bold text-2xl">
                    {error}
                </p>
                <p>
                    <Link
                        to="/register"
                        className="font-bold lg:text-xl hover:text-gray-300 transition"
                    >
                        If you don't have an account, register
                    </Link>
                </p>
            </form>
        </div>
    );
}
