import { useState, useReducer, FormEvent, useRef } from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { ChangeEvent } from 'react';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import FormField from '../FormUtils/FormField';
import useTransactionsQuery from '@/hooks/useTransactionsQuery';
import useUserQuery from '@/hooks/useUserQuery';
import ErrorData from './ErrorData';

interface FormState {
    name: string;
    value: number;
    category: string;
    receiver: boolean;
}

type Action =
    | {
          type: 'UPDATE_FIELD';
          field: keyof FormState;
          value: string | number | boolean | null;
      }
    | { type: 'UPDATE_BODY'; field: FormState; value: FormState }
    | { type: 'RESET' };

const initialState: FormState = {
    name: '',
    value: 0,
    category: '',
    receiver: false,
};

function formReducer(state: FormState, action: Action): FormState {
    switch (action.type) {
        case 'UPDATE_FIELD':
            return {
                ...state,
                [action.field]: action.value,
            };
        case 'RESET':
            return initialState;
        case 'UPDATE_BODY':
            return action.field;
        default:
            return state;
    }
}

export default function Transactions() {
    sessionStorage.setItem('selectedDashboard', '1');
    const { data: user, isLoading: isUserLoading } = useUserQuery();
    const { data: transactions, isLoading: isTransactionsLoading } =
        useTransactionsQuery();
    const [isAddForm, setStateAddForm] = useState<boolean>(false);
    const [isChangeForm, setStateChangeForm] = useState<boolean>(false);
    const [isDeleteForm, setStateDeleteForm] = useState<boolean>(false);
    const { add, change, delete: remove } = useTransactions();

    const [state, dispatch] = useReducer(formReducer, initialState);
    const selectRef = useRef<HTMLSelectElement>(null);

    if (isUserLoading || isTransactionsLoading) {
        return (
            <p>
                Loading... User: {isUserLoading ? 'Loading' : 'Loaded'}, Goals:
                {isTransactionsLoading ? 'Loading' : 'Loaded'}, Notes:
            </p>
        );
    }

    if (!user)
        return (
            <ErrorData
                dataType="User"
                message="You are not allowed to access Dashboard. "
            />
        );

    if (!transactions) return <ErrorData dataType="Transactions" />;

    const handleAdd = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (state.name === '' || state.name === null) return;
        add(state);
        dispatch({
            type: 'RESET',
        });
    };

    const handleChangeItem = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectRef.current) return;
        if (state.name === '' || state.name === null) return;
        change(selectRef.current.value, state);
        dispatch({
            type: 'RESET',
        });
    };

    const handleDeleteItem = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectRef.current) return;
        remove(selectRef.current.value);
        dispatch({
            type: 'RESET',
        });
    };

    const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === '-1') return;
        const filtered = transactions.filter(
            (transaction) => transaction._id === e.target.value
        );
        if (filtered.length === 1) {
            const body = filtered[0];
            dispatch({
                type: 'UPDATE_BODY',
                field: body,
                value: body,
            });
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, type, checked, value } = e.target;
        dispatch({
            type: 'UPDATE_FIELD',
            field: id as keyof FormState,
            value: type === 'checkbox' ? checked : value,
        });
    };

    return (
        <div className="flex items-center justify-between flex-col h-full *:p-4">
            <Modal
                activator={isAddForm}
                header="Add transaction form"
                onClick={() => setStateAddForm(!isAddForm)}
            >
                <form className="p-8 m-4 *:w-full" onSubmit={handleAdd}>
                    <FormField
                        id="name"
                        label="Transaction name"
                        type="text"
                        onChange={handleChange}
                    />
                    <FormField
                        id="category"
                        label="Category"
                        type="text"
                        onChange={handleChange}
                    />
                    <FormField
                        id="value"
                        label="Money quantity"
                        type="number"
                        onChange={handleChange}
                    />
                    <FormField
                        id="receiver"
                        label="Is receiving?"
                        type="checkbox"
                        onChange={handleChange}
                    />
                    <Button text="Send" />
                </form>
            </Modal>
            <Modal
                activator={isChangeForm}
                header="Update transaction form"
                onClick={() => setStateChangeForm(!isChangeForm)}
            >
                <form className="p-8 m-4 *:w-full" onSubmit={handleChangeItem}>
                    <h1 className="text-3xl">Select Item</h1>
                    <select
                        ref={selectRef}
                        onChange={handleSelect}
                        className="bg-white rounded-2xl p-4 my-6"
                    >
                        <option selected value={'-1'}>
                            Select one of these
                        </option>
                        {transactions.map((transaction) => (
                            <option
                                key={transaction._id}
                                value={transaction._id}
                            >
                                {transaction.name}
                            </option>
                        ))}
                    </select>
                    <FormField
                        id="name"
                        label="Transaction name"
                        value={state.name}
                        type="text"
                        onChange={handleChange}
                    />
                    <FormField
                        id="category"
                        label="Category"
                        value={state.category}
                        type="text"
                        onChange={handleChange}
                    />
                    <FormField
                        id="value"
                        label="Money quantity"
                        value={state.value}
                        type="number"
                        onChange={handleChange}
                    />
                    <FormField
                        id="receiver"
                        label="Is receiving?"
                        checked={state.receiver}
                        type="checkbox"
                        onChange={handleChange}
                    />
                    <Button text="Update" />
                </form>
            </Modal>
            <Modal
                activator={isDeleteForm}
                header="Delete transaction form"
                onClick={() => setStateDeleteForm(!isDeleteForm)}
            >
                <form className="p-8 m-4 *:w-full" onSubmit={handleDeleteItem}>
                    <h1 className="text-3xl">Select Item</h1>
                    <select
                        ref={selectRef}
                        onChange={handleSelect}
                        className="bg-white rounded-2xl p-4 my-6"
                    >
                        <option selected value={'-1'}>
                            Select one of these
                        </option>
                        {transactions.map((transaction) => (
                            <option
                                key={transaction._id}
                                value={transaction._id}
                            >
                                {transaction.name}
                            </option>
                        ))}
                    </select>
                    <Button text="Delete" />
                </form>
            </Modal>
            <div className="bg-white w-4/5 shadow-2xl rounded-4xl max-h-150 m-8 overflow-auto">
                <table className="**:p-3 **:border border-collapse w-full h-full table-auto">
                    <thead className="bg-gray-300 sticky top-0">
                        <tr>
                            <th>Date creation</th>
                            <th>Last update</th>
                            <th>Transaction Name</th>
                            <th>Category</th>
                            <th>Receiver?</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody className="*:hover:bg-gray-100 *:transition-all">
                        {transactions.map((transaction) => (
                            <tr key={transaction._id}>
                                <td>{transaction.createdAt.toString()}</td>
                                <td>{transaction.updatedAt.toString()}</td>
                                <td>{transaction.name}</td>
                                <td>{transaction.category}</td>
                                <td>{transaction.receiver ? 'Yes' : 'No'}</td>
                                <td>{transaction.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="text-white flex max-md:flex-col justify-evenly w-full h-1/3 items-center">
                <Button
                    text="Add new transaction"
                    onClick={() => setStateAddForm(!isAddForm)}
                />
                <Button
                    text="Change transaction details"
                    onClick={() => setStateChangeForm(!isChangeForm)}
                />
                <Button
                    text="Delete transactions"
                    onClick={() => setStateDeleteForm(!isDeleteForm)}
                />
            </div>
        </div>
    );
}
