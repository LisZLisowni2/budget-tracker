// TODO: Add more info about User like: Currency,
// TODO: Enable change details about account and it deletion.

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

export default function Profile() {
    sessionStorage.setItem('selectedDashboard', '5');
    const queryClient = useQueryClient();
    const { data: user, isLoading: isUserLoading } = useUserQuery();
    const { logoutMutation, updatePassword, deleteAccount } = useUser();
    const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] =
        useState<boolean>(false);
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

    const handleLogout = () => {
        logoutMutation();
    };

    const handlePasswordChange = async (data: TPassword) => {
        if (data.password !== data.passwordSecond) {
            setError('root', { message: 'Passwords are not the same' });
        }
        
        handlePasswordUpdate.mutate(
            data.password,
            {
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
                                message: 'Internal server error'
                            })
                    }
                }
            }
        );
    };

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
            }
        });
    };

    // FIXME: Background of section only white, not gradient gray.
    return (
        <div className="flex justify-center items-center flex-col h-full max-md:overflow-auto *:p-4">
            <Modal
                header="Change Password Form"
                activator={isPasswordChangeModalOpen}
                onClick={() => setIsPasswordChangeModalOpen(false)}
            >
                <form
                    className="p-8 m-4 *:w-full"
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
            <Modal onClick={() => setIsAccountDeletionModalOpen(false)} header="Delete Account" activator={isAccountDeletionModalOpen}>
                <div className='p-4 *:m-4'>
                    <p>Are you sure you want to delete your account?</p>
                    <div className='*:w-1/4 flex justify-evenly'>
                        <Button text="Yes" onClick={() => handleAccountDeletion()}/>
                        <Button text="No" onClick={() => setIsAccountDeletionModalOpen(false)}/>
                    </div>
                </div>
            </Modal>
            <h1 className="text-6xl">{user?.username} </h1>
            <h3 className="text-2xl">{user?.email}</h3>
            <div className="*:m-4 flex flex-col">
                <Button
                    text="Change Password"
                    onClick={() => setIsPasswordChangeModalOpen(true)}
                />
                <Button text="Logout" onClick={handleLogout} />
                <Button text="Delete Account" onClick={() => setIsAccountDeletionModalOpen(true)} />
            </div>
        </div>
    );
}
