import { useGoals } from '@/context/GoalContext';
import { useReducer, useState, useRef, ChangeEvent, FormEvent } from 'react';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import FormField from '../FormUtils/FormField';
import useGoalsQuery from '@/hooks/useGoalsQuery';
import useUserQuery from '@/hooks/useUserQuery';
import ErrorData from './ErrorData';

interface FormState {
    name: string;
    requiredValue: number;
}

type Action =
    | {
          type: 'UPDATE_FIELD';
          field: keyof FormState;
          value: string | number | boolean | null;
      }
    | { type: 'UPDATE_BODY'; field: FormState }
    | { type: 'RESET' };

const initialState: FormState = {
    name: '',
    requiredValue: 0,
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

export default function Goals() {
    sessionStorage.setItem('selectedDashboard', '2');
    const { data: user, isLoading: isUserLoading } = useUserQuery();

    const { addMutation, deleteMutation, changeMutation, finishMutation } =
        useGoals();
    const { data: goals, isLoading: isGoalsLoading } = useGoalsQuery();
    const [isAddForm, setStateAddForm] = useState<boolean>(false);
    const [isChangeForm, setStateChangeForm] = useState<boolean>(false);
    const [isDeleteForm, setStateDeleteForm] = useState<boolean>(false);

    const [state, dispatch] = useReducer(formReducer, initialState);
    const selectRef = useRef<HTMLSelectElement>(null);
    const selectRef2 = useRef<HTMLSelectElement>(null);

    if (isUserLoading || isGoalsLoading) {
        return (
            <p>
                Loading... User: {isUserLoading ? 'Loading' : 'Loaded'}, Goals:
                {isGoalsLoading ? 'Loading' : 'Loaded'}, Notes:
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

    if (!goals) return <ErrorData dataType="Goals" />;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, type, checked, value } = e.target;
        dispatch({
            type: 'UPDATE_FIELD',
            field: id as keyof FormState,
            value: type === 'checkbox' ? checked : value,
        });
    };

    const handleAdd = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (state.name === '' || state.name === null) return;
        addMutation(state);
        dispatch({
            type: 'RESET',
        });
    };

    const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === '-1') return;
        const filtered = goals.filter((goal) => goal._id === e.target.value);
        if (filtered.length === 1) {
            const body = filtered[0];
            dispatch({
                type: 'UPDATE_BODY',
                field: body,
            });
        }
    };

    const handleChangeItem = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (state.name === '' || state.name === null) return;
        if (!selectRef.current) return;
        changeMutation(selectRef.current.value, state);
        dispatch({
            type: 'RESET',
        });
    };

    const handleDeleteItem = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectRef2.current) return;
        deleteMutation(selectRef2.current.value);
        dispatch({
            type: 'RESET',
        });
    };

    return (
        <div className="flex items-center justify-between flex-col h-full *:p-4">
            <Modal
                activator={isAddForm}
                header="Add goal form"
                onClick={() => setStateAddForm(!isAddForm)}
                id='addForm'
            >
                <form className="p-8 m-4 *:w-full" onSubmit={handleAdd}>
                    <FormField
                        id="name"
                        label="Goal name"
                        type="text"
                        onChange={handleChange}
                    />
                    <FormField
                        id="requiredValue"
                        label="Money quantity"
                        type="number"
                        onChange={handleChange}
                    />
                    <Button id='submit' text="Send" />
                </form>
            </Modal>
            <Modal
                activator={isChangeForm}
                header="Update goal form"
                onClick={() => setStateChangeForm(!isChangeForm)}
                id='changeForm'
            >
                <form className="p-8 m-4 *:w-full" onSubmit={handleChangeItem}>
                    <h1 className="text-3xl">Select Item</h1>
                    <select
                        id='select'
                        ref={selectRef}
                        onChange={handleSelect}
                        className="bg-white rounded-2xl p-4 my-6"
                    >
                        <option defaultValue={'-1'}>
                            Select one of these
                        </option>
                        {goals.map((goal) => (
                            <option key={goal._id} value={goal._id}>
                                {goal.name}
                            </option>
                        ))}
                    </select>
                    <FormField
                        id="name2"
                        label="Goal name"
                        type="text"
                        onChange={handleChange}
                        defaultValue={state.name}
                    />
                    <FormField
                        id="requiredValue2"
                        label="Money quantity"
                        type="number"
                        onChange={handleChange}
                        defaultValue={state.requiredValue}
                    />
                    <Button id='submit2' text="Update" />
                </form>
            </Modal>
            <Modal
                activator={isDeleteForm}
                header="Delete goal form"
                onClick={() => setStateDeleteForm(!isDeleteForm)}
                id='deleteForm'
            >
                <form className="p-8 m-4 *:w-full" onSubmit={handleDeleteItem}>
                    <h1 className="text-3xl">Select Item</h1>
                    <select
                        id='select2'
                        ref={selectRef2}
                        onChange={handleSelect}
                        defaultValue={'-1'}
                        className="bg-white rounded-2xl p-4 my-6"
                    >
                        <option selected>
                            Select one of these
                        </option>
                        {goals.map((goal) => (
                            <option key={goal._id} value={goal._id}>
                                {goal.name}
                            </option>
                        ))}
                    </select>
                    <Button id='submit3' text="Delete" />
                </form>
            </Modal>
            <div className="bg-white w-4/5 shadow-2xl rounded-4xl max-h-150 m-8 overflow-auto">
                <table className="**:p-3 **:border border-collapse w-full h-full table-auto">
                    <thead className="bg-gray-300 sticky top-0">
                        <tr>
                            <th>Date Creation</th>
                            <th>Date Update</th>
                            <th>Goal</th>
                            <th>Required money</th>
                            <th>Done?</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody className="*:hover:bg-gray-100 *:transition-all">
                        {goals.map((goal) => (
                            <tr key={goal._id}>
                                <td>{goal.createdAt.toString()}</td>
                                <td>{goal.updatedAt.toString()}</td>
                                <td>{goal.name}</td>
                                <td>{goal.requiredValue}</td>
                                <td>
                                    {goal.isCompleted
                                        ? 'Completed'
                                        : 'In progress'}
                                </td>
                                <td>
                                    {!goal.isCompleted ? (
                                        <Button
                                            text="Finish"
                                            onClick={() =>
                                                finishMutation(goal._id)
                                            }
                                        />
                                    ) : (
                                        <p>Completed</p>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="text-white flex max-md:flex-col justify-evenly w-full h-1/3 items-center">
                <Button
                    text="Add new goal"
                    id='add'
                    onClick={() => setStateAddForm(!isAddForm)}
                />
                <Button
                    text="Change goal details"
                    id='change'
                    onClick={() => setStateChangeForm(!isChangeForm)}
                />
                <Button
                    text="Delete goal"
                    id='delete'
                    onClick={() => setStateDeleteForm(!isDeleteForm)}
                />
            </div>
        </div>
    );
}
