import Button from '../Button/Button';
import FieldError from '../FormUtils/FieldError';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';
import api from '../../api';
import { Link } from 'react-router';
import FormField from '../FormUtils/FormField';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

const UserRegisterSchema = z.object({
    username: z
        .string()
        .min(3, { error: 'Username too short' })
        .max(60, { error: 'Username too long' })
        .regex(/^[a-zA-Z0-9]+$/, {
            error: 'Username contains forbidden characters',
        }),
    email: z.email({ error: 'Invalid email pattern ' }),
    password: z.string().min(3, { error: 'Password too short' }),
    passwordVerify: z.string().min(3, { error: 'Password too short' }),
});

type TUserRegisterSchema = z.infer<typeof UserRegisterSchema>;

export default function Register() {
    const [passwordView, setPasswordView] = useState(false);

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<TUserRegisterSchema>({
        resolver: zodResolver(UserRegisterSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            passwordVerify: '',
        },
    });

    const handlePasswordView = () => {
        setPasswordView(!passwordView);
    };

    const handleRegister = async (data: TUserRegisterSchema) => {
        // Verify passwords
        if (data.password != data.passwordVerify) {
            setError('passwordVerify', {
                message: 'Passwords are not the same',
            });
            return;
        }

        const obj = {
            username: data.username,
            email: data.email,
            password: data.password,
        };

        await api
            .post('/users/register', obj)
            .then(() => {
                setError('root', { message: 'Account has created' });
            })
            .catch((err) => {
                console.error(err);
                switch (err.status) {
                    case 404:
                        setError('root', {
                            message: 'There are empty fields',
                        });
                        break;
                    default:
                        setError('root', {
                            message: 'Internal server error.',
                        });
                }
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
                onSubmit={handleSubmit(handleRegister)}
                className="relative bg-linear-to-r from-rose-400 to-rose-500 p-8 lg:p-16 rounded-4xl text-center max-w-3xs md:max-w-2xl lg:max-w-3xl z-10 shadow-2xl backdrop-blur-3xl m-auto"
            >
                <h1 className="text-2xl md:text-3xl font-bold md:mb-8">
                    Register form
                </h1>
                <div className="flex md:gap-4 max-md:flex-col justify-between">
                    <div>
                        <Controller
                            name="username"
                            control={control}
                            render={({ field }) => (
                                <>
                                    <FormField
                                        label="Username:"
                                        type="text"
                                        id="login"
                                        {...field}
                                    />
                                    {errors.username && (
                                        <FieldError id='usernameError'
                                            message={errors.username.message}
                                        />
                                    )}
                                </>
                            )}
                        />
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <>
                                    <FormField
                                        label="Email:"
                                        type="text"
                                        id="email"
                                        {...field}
                                    />
                                    {errors.email && (
                                        <FieldError id='emailError'
                                            message={errors.email.message}
                                        />
                                    )}
                                </>
                            )}
                        />
                    </div>
                    <div>
                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <>
                                    <FormField
                                        label="Password:"
                                        type={
                                            passwordView ? 'text' : 'password'
                                        }
                                        id="password"
                                        {...field}
                                    >
                                        <span className="self-end relative bottom-9.5 right-1.5">
                                            {passwordIcon}
                                        </span>
                                    </FormField>
                                    {errors.password && (
                                        <FieldError id='passwordError'
                                            message={errors.password.message}
                                        />
                                    )}
                                </>
                            )}
                        />
                        <Controller
                            name="passwordVerify"
                            control={control}
                            render={({ field }) => (
                                <>
                                    <FormField
                                        label="Password Verify:"
                                        type={
                                            passwordView ? 'text' : 'password'
                                        }
                                        id="passwordSecond"
                                        {...field}
                                    >
                                        <span className="self-end relative bottom-9.5 right-1.5">
                                            {passwordIcon}
                                        </span>
                                    </FormField>
                                    {errors.passwordVerify && (
                                        <FieldError id='passwordSecondError'
                                            message={
                                                errors.passwordVerify.message
                                            }
                                        />
                                    )}
                                </>
                            )}
                        />
                    </div>
                </div>
                <p className="flex my-4 flex-col">
                    <Button text="Register" />
                </p>
                {errors.root && <p id="status">{errors.root.message}</p>}
                <p>
                    <Link
                        to="/login"
                        className="font-bold lg:text-xl hover:text-gray-300 transition"
                    >
                        If you have an account, login
                    </Link>
                </p>
            </form>
        </div>
    );
}
