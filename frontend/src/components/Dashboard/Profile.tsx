import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import useUserQuery from '@/hooks/useUserQuery';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/context/UserContext';
import { useState } from 'react';
import Button from '../Button/Button';
import ErrorData from './ErrorData';
import Modal from '../Modal/Modal';
import FormField from '../FormUtils/FormField';
import FieldError from '../FormUtils/FieldError';

const PasswordSchema = z.object({
    password: z.string().min(3, { error: 'Password too short' }),
    passwordSecond: z.string().min(3, { error: 'Password too short' }),
});

type TPassword = z.infer<typeof PasswordSchema>;

const AccountDetailsSchema = z.object({
    username: z.string().min(3, { error: 'Password too short' }),
    email: z.email({ error: 'Invalid email pattern' }),
    phone: z.e164({ error: 'Invalid phone number' }),
    baseCurrency: z.string().length(3, { error: 'Invalid currency code' }),
    preferredLanguage: z.string().length(2, { error: 'Invalid language code' }),
});

type TAccounDetailsSchema = z.infer<typeof AccountDetailsSchema>;

export default function Profile() {
    sessionStorage.setItem('selectedDashboard', '5');
    const queryClient = useQueryClient();
    const { data: user, isLoading: isUserLoading } = useUserQuery();
    const { logoutMutation, updatePassword, deleteAccount, updateAccountDetails } = useUser();
    const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] =
        useState<boolean>(false);
    const [
        isAccountDetailsChangeModalOpen,
        setIsAccountDetailsChangeModalOpen,
    ] = useState<boolean>(false);
    const [isAccountDeletionModalOpen, setIsAccountDeletionModalOpen] =
        useState<boolean>(false);
    const {
        handleSubmit,
        control,
        setError,
        formState: { errors },
    } = useForm<TPassword>({
        resolver: zodResolver(PasswordSchema),
        defaultValues: {
            password: '',
            passwordSecond: '',
        },
    });
    const handlePasswordUpdate = updatePassword;
    const handleAccountDeletionMutation = deleteAccount;
    const handleUpdateAccountDetails = updateAccountDetails

    if (isUserLoading) {
        return <p>Loading profile...</p>;
    }

    if (!user)
        return (
            <ErrorData
                dataType="User"
                message="You are not allowed to access Dashboard. "
            />
        );

    const {
        handleSubmit: handleSubmitAccountDetails,
        control: controlAccountDetails,
        setError: setErrorAccountDetails,
        formState: { errors: errorsAccountDetails },
    } = useForm<TAccounDetailsSchema>({
        resolver: zodResolver(AccountDetailsSchema),
        defaultValues: {
            username: user.username,
            email: user.email,
            phone: user.phone,
            baseCurrency: user.baseCurrency,
            preferredLanguage: user.preferredLanguage,
        },
    });
    const handleLogout = () => {
        logoutMutation();
    };

    const handlePasswordChange = async (data: TPassword) => {
        if (data.password !== data.passwordSecond) {
            setError('root', { message: 'Passwords are not the same' });
        }

        handlePasswordUpdate.mutate(data.password, {
            onSuccess: () => {
                setError('root', { message: 'Password has changed' });
            },

            onError: (err) => {
                switch (err.status) {
                    case 400:
                        setError('root', {
                            message: 'There are empty fields',
                        });
                        break;
                    default:
                        setError('root', {
                            message: 'Internal server error',
                        });
                }
            },
        });
    };

    const handleAccountDetailsUpdate = async (data: TAccounDetailsSchema) => {
        let finalData = new Map<string, string>()
        if (data.username !== user.username) {
            finalData.set('username', data.username)
        }
        if (data.email !== user.email) {
            finalData.set('email', data.email)
        }
        if (data.phone !== user.phone) {
            finalData.set('phone', data.phone)
        }
        if (data.baseCurrency !== user.baseCurrency) {
            finalData.set('baseCurrency', data.baseCurrency)
        }
        if (data.preferredLanguage !== user.preferredLanguage) {
            finalData.set('preferredLanguage', data.preferredLanguage)
        }
        const obj = Object.fromEntries(finalData)
        handleUpdateAccountDetails.mutate(obj, {
            onSuccess: () => {
                setErrorAccountDetails('root', {
                    message: 'Account details have changed',
                });
            },
            onError: (err) => {
                switch (err.status) {
                    case 400:
                        setErrorAccountDetails('root', {
                            message: err.message
                        })
                        break;
                    default:
                        setErrorAccountDetails('root', {
                            message: 'Internal server error',
                        });
                }
            },
        })
    }

    const handleAccountDeletion = () => {
        handleAccountDeletionMutation.mutate(null, {
            onSuccess: () => {
                setIsAccountDeletionModalOpen(false);
                queryClient.invalidateQueries({ queryKey: ['user'] });
                handleLogout();
            },
            onError: () => {
                setError('root', {
                    message: 'Internal server error',
                });
            },
        });
    };

    // FIXME: Background of section only white, not gradient gray.
    return (
        <div className="flex justify-center items-center flex-col h-full *:p-4">
            <Modal
                header="Change Password Form"
                activator={isPasswordChangeModalOpen}
                onClick={() => setIsPasswordChangeModalOpen(false)}
            >
                <form
                    className="p-8 m-4 *:w-full"
                    id="passwordChangeForm"
                    onSubmit={handleSubmit(handlePasswordChange)}
                >
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <>
                                <FormField
                                    label="Password:"
                                    type="password"
                                    id="password"
                                    {...field}
                                />
                                {errors.password && (
                                    <FieldError
                                        message={errors.password.message!}
                                    />
                                )}
                            </>
                        )}
                    />
                    <Controller
                        name="passwordSecond"
                        control={control}
                        render={({ field }) => (
                            <>
                                <FormField
                                    label="Verify password:"
                                    type="password"
                                    id="passwordSecond"
                                    {...field}
                                />
                                {errors.passwordSecond && (
                                    <FieldError
                                        message={errors.passwordSecond.message!}
                                    />
                                )}
                            </>
                        )}
                    />
                    <Button text="Submit" />
                    {errors.root && (
                        <FieldError message={errors.root.message!} />
                    )}
                </form>
            </Modal>
            <Modal
                header="Change Account Details Form"
                activator={isAccountDetailsChangeModalOpen}
                onClick={() => setIsAccountDetailsChangeModalOpen(false)}
            >
                <form
                    className="p-8 m-4 *:w-full"
                    id="accountDetailsChangeForm"
                    onSubmit={handleSubmitAccountDetails(handleAccountDetailsUpdate)}
                >
                    <Controller
                        name="username"
                        control={controlAccountDetails}
                        render={({ field }) => (
                            <>
                                <FormField
                                    label="Username:"
                                    type="text"
                                    id="username"
                                    {...field}
                                />
                                {errorsAccountDetails.username && (
                                    <FieldError
                                        message={errorsAccountDetails.username.message!}
                                    />
                                )}
                            </>
                        )}
                    />
                    <Controller
                        name="email"
                        control={controlAccountDetails}
                        render={({ field }) => (
                            <>
                                <FormField
                                    label="email:"
                                    type="text"
                                    id="email"
                                    {...field}
                                />
                                {errorsAccountDetails.email && (
                                    <FieldError
                                        message={errorsAccountDetails.email.message!}
                                    />
                                )}
                            </>
                        )}
                    />
                    <Controller
                        name="phone"
                        control={controlAccountDetails}
                        render={({ field }) => (
                            <>
                                <FormField
                                    label="phone:"
                                    type="text"
                                    id="phone"
                                    {...field}
                                />
                                {errorsAccountDetails.phone && (
                                    <FieldError
                                        message={errorsAccountDetails.phone.message!}
                                    />
                                )}
                            </>
                        )}
                    />
                    <Controller
                        name="baseCurrency"
                        control={controlAccountDetails}
                        render={({ field }) => (
                            <>
                                <FormField
                                    label="Base currency:"
                                    type="text"
                                    id="baseCurrency"
                                    {...field}
                                />
                                {errorsAccountDetails.baseCurrency && (
                                    <FieldError
                                        message={errorsAccountDetails.baseCurrency.message!}
                                    />
                                )}
                            </>
                        )}
                    />
                    <Controller
                        name="preferredLanguage"
                        control={controlAccountDetails}
                        render={({ field }) => (
                            <>
                                <FormField
                                    label="Preferred language:"
                                    type="text"
                                    id="preferredLanguage"
                                    {...field}
                                />
                                {errorsAccountDetails.preferredLanguage && (
                                    <FieldError
                                        message={errorsAccountDetails.preferredLanguage.message!}
                                    />
                                )}
                            </>
                        )}
                    />
                    <Button text="Submit" />
                    {errorsAccountDetails.root && (
                        <FieldError message={errorsAccountDetails.root.message!} />
                    )}
                </form>
            </Modal>
            <Modal
                onClick={() => setIsAccountDeletionModalOpen(false)}
                header="Delete Account"
                activator={isAccountDeletionModalOpen}
            >
                <div className="p-4 *:m-4">
                    <p>Are you sure you want to delete your account?</p>
                    <div className="*:w-1/4 flex justify-evenly">
                        <Button
                            text="Yes"
                            onClick={() => handleAccountDeletion()}
                        />
                        <Button
                            text="No"
                            onClick={() => setIsAccountDeletionModalOpen(false)}
                        />
                    </div>
                </div>
            </Modal>
            <h1 id='usernameHeadline' className="text-6xl">{user?.username} </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-8">
                <div className="flex flex-col *:font-bold *:text-xl *:m-2 *:p-3 *:border *:rounded-4xl *:shadow-xl *:hover:scale-105 *:transition-all">
                    <p>Email: {user.email}</p>
                    <p>Phone number: {user.phone}</p>
                    <p>Base currency: {user.baseCurrency}</p>
                    <p>Preferred language: {user.preferredLanguage}</p>
                </div>
                <div className="flex flex-col *:m-4">
                    <Button text="Logout" id='logoutBtn' onClick={handleLogout} />
                    <Button
                        text="Change Password"
                        id='changePasswordBtn'
                        onClick={() => setIsPasswordChangeModalOpen(true)}
                    />
                    <Button
                        text="Change Account Details"
                        id='changeAccountDetailsBtn'
                        onClick={() => setIsAccountDetailsChangeModalOpen(true)}
                    />
                    <Button
                        text="Delete Account"
                        onClick={() => setIsAccountDeletionModalOpen(true)}
                    />
                </div>
            </div>
        </div>
    );
}
