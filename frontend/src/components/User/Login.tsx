import Button from '../Button/Button';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import FormField from '../FormUtils/FormField';
import { useForm, Controller } from 'react-hook-form';
import FieldError from '../FormUtils/FieldError';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { AxiosError } from 'axios';

const UserSchema = z.object({
    username: z
        .string()
        .min(3, { error: 'Username too short ' })
        .max(60, { error: 'Username too long' }),
    password: z.string().min(3, { error: 'Password too short' }),
});

type TUserSchema = z.infer<typeof UserSchema>;

export default function Login() {
    const queryClient = useQueryClient();
    const {
        handleSubmit,
        control,
        setError,
        formState: { errors },
    } = useForm<TUserSchema>({
        resolver: zodResolver(UserSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    const [passwordView, setPasswordView] = useState(false);
    const navigate = useNavigate();
    const { loginMutate } = useUser();
    const { mutate } = loginMutate;

    const handlePasswordView = () => {
        setPasswordView(!passwordView);
    };

    const handleLogin = async (data: TUserSchema) => {
        if (data.username === '' || data.password === '') {
            setError('root', {
                message: 'Username or password not present',
            });
            return;
        }
        mutate(data, {
            onSuccess: (res) => {
                localStorage.setItem('token', res.data.token);
                queryClient.invalidateQueries({ queryKey: ['user'] });
                navigate('/dashboard');
            },
            onError: (err: AxiosError) => {
                const status = err.response ? err.response.status : null;
                switch (status) {
                    case 404:
                        setError('username', {
                            message: "That username doesn't exist",
                        });
                        break;
                    case 401:
                        setError('password', {
                            message: 'Wrong password',
                        });
                        break;
                    default:
                        setError('root', {
                            message: 'Internal server error.',
                        });
                }
            },
        });
    };

    let passwordIcon;
    if (!passwordView) {
        passwordIcon = (
            <EyeIcon
                className="size-8 text-black"
                onClick={handlePasswordView}
            />
        );
    } else {
        passwordIcon = (
            <EyeOffIcon
                className="size-8 text-black"
                onClick={handlePasswordView}
            />
        );
    }

    return (
        <div>
            <form
                onSubmit={handleSubmit(handleLogin)}
                className="relative bg-linear-to-r from-rose-400 to-rose-500 p-8 lg:p-16 rounded-4xl text-center max-w-3xs md:max-w-2xl lg:max-w-3xl z-10 shadow-2xl backdrop-blur-3xl m-auto"
            >
                <h1 className="text-2xl md:text-3xl font-bold mb-8">
                    Login form
                </h1>
                <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                        <>
                            <FormField
                                label="Username:"
                                type="text"
                                id="username"
                                {...field}
                            />
                            {errors.username && (
                                <FieldError id="usernameError" message={errors.username.message} />
                            )}
                        </>
                    )}
                />
                <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                        <>
                            <FormField
                                label="Password:"
                                type={passwordView ? 'text' : 'password'}
                                id="password"
                                {...field}
                            >
                                <span className="self-end relative bottom-9.5 right-1.5">
                                    {passwordIcon}
                                </span>
                            </FormField>
                            {errors.password && (
                                <FieldError id="passwordError" message={errors.password.message} />
                            )}
                        </>
                    )}
                />
                {errors.root && <p id='status'>{errors.root.message}</p>}
                <p className="flex my-4 flex-col">
                    <Button text="Login" />
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
