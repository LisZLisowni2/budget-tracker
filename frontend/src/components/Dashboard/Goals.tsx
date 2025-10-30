import { useUser } from '@/context/UserContext';
import { useGoals } from '@/context/GoalContext';
import { useReducer, useState, useRef, ChangeEvent, FormEvent } from 'react';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import FormField from '../FormUtils/FormField';

interface FormState {
    goalname: string;
    requiredmoney: number;
}

type Action =
    | {
          type: 'UPDATE_FIELD';
          field: keyof FormState;
          value: string | number | boolean | null;
      }
    | { type: 'UPDATE_BODY'; field: FormState; }
    | { type: 'RESET' };

const initialState: FormState = {
    goalname: '',
    requiredmoney: 0,
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
    const { user, loading } = useUser();
    const { goals, loading: goalsLoading, handleAddGoal, handleChangeGoal, handleDeleteGoal, handleFinishGoal } = useGoals();
    const [isAddForm, setStateAddForm] = useState<boolean>(false);
    const [isChangeForm, setStateChangeForm] = useState<boolean>(false);
    const [isDeleteForm, setStateDeleteForm] = useState<boolean>(false);

    const [state, dispatch] = useReducer(formReducer, initialState);
    const selectRef = useRef<HTMLSelectElement>(null);

    if (loading) {
        return <p>Loading profile...</p>;
    }

    if (goalsLoading) {
        return <p>Loading goals...</p>;
    }

    if (!user) {
        return (
            <div className="w-full flex justify-center items-center">
                <p className="text-black text-4xl font-bold text-center">
                    You are not allowed to access Dashboard.
                    <br />
                    Please login to continue
                </p>
            </div>
        );
    }

    if (!goals) {
        return (
            <div className="w-full flex justify-center items-center">
                <p className="text-black text-4xl font-bold text-center">
                    Goals doesn't load. Probably server's error.
                    <br />
                    Please try again later
                </p>
            </div>
        );
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, type, checked, value } = e.target;
        dispatch({
            type: 'UPDATE_FIELD',
            field: id as keyof FormState,
            value: type === "checkbox" ? checked : value
        })
    }

    const handleAdd = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (state.goalname === "" || state.goalname === null) return;
        handleAddGoal(state);
        dispatch({
            type: 'RESET'
        })
    }

    const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
        const filtered = goals.filter(goal => goal._id === e.target.value)
        if (filtered.length === 1) {
            const body = filtered[0];
            dispatch({
                type: 'UPDATE_BODY',
                field: body,
            })
        } 
    }

    const handleChangeItem = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (state.goalname === '' || state.goalname === null) return;
        if (!selectRef.current) return;
        handleChangeGoal(selectRef.current.value, state);
        dispatch({
            type: 'RESET'
        })
    }

    const handleDeleteItem = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectRef.current) return;
        handleDeleteGoal(selectRef.current.value)
        dispatch({
            type: 'RESET'
        })
    }

    return (
        <div className="flex items-center justify-between flex-col h-full *:p-4 max-lg:overflow-auto">
            <Modal
                activator={isAddForm}
                header="Add goal form"
                onClick={() => setStateAddForm(!isAddForm)}
            >
                <form className="p-8 m-4 *:w-full" onSubmit={handleAdd}>
                    <FormField
                        id="goalname"
                        label="Goal name"
                        type="text"
                        onChange={handleChange}
                    />
                    <FormField
                        id="requiredmoney"
                        label="Money quantity"
                        type="number"
                        onChange={handleChange}
                    />
                    <Button text="Send" />
                </form>
            </Modal>
            <Modal
                activator={isChangeForm}
                header="Update goal form"
                onClick={() => setStateChangeForm(!isChangeForm)}
            >
                <form className="p-8 m-4 *:w-full" onSubmit={handleChangeItem}>
                    <h1 className="text-3xl">Select Item</h1>
                    <select
                        ref={selectRef}
                        onChange={handleSelect}
                        className="bg-white rounded-2xl p-4 my-6"
                    >
                        {goals.map(goal => (
                            <option value={goal._id}>
                                {goal.goalname}
                            </option>
                        ))}
                    </select>
                    <FormField
                        id="goalname"
                        label="Goal name"
                        type="text"
                        onChange={handleChange}
                        value={state.goalname}
                    />
                    <FormField
                        id="requiredmoney"
                        label="Money quantity"
                        type="number"
                        onChange={handleChange}
                        value={state.requiredmoney}
                    />
                    <Button text="Update" />
                </form>
            </Modal>
            <Modal
                activator={isDeleteForm}
                header="Delete goal form"
                onClick={() => setStateDeleteForm(!isDeleteForm)}
            >
                <form className="p-8 m-4 *:w-full" onSubmit={handleDeleteItem}>
                    <h1 className="text-3xl">Select Item</h1>
                    <select
                        ref={selectRef}
                        onChange={handleSelect}
                        className="bg-white rounded-2xl p-4 my-6"
                    >
                        {goals.map(goal => (
                            <option value={goal._id}>
                                {goal.goalname}
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
                                <td>{goal.dateCreation.toString()}</td>
                                <td>{goal.dateUpdate.toString()}</td>
                                <td>{goal.goalname}</td>
                                <td>{goal.requiredmoney}</td>
                                <td>
                                    {goal.completed
                                        ? 'Completed'
                                        : 'In progress'}
                                </td>
                                <td>
                                    {!goal.completed ?
                                        <Button text='Finish' onClick={() => handleFinishGoal(goal._id)} />
                                        : <p>Completed</p>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="text-white flex max-md:flex-col justify-evenly w-full h-1/3 items-center">
                <Button text="Add new goal" onClick={() => setStateAddForm(!isAddForm)}/>
                <Button text="Change goal details" onClick={() => setStateChangeForm(!isChangeForm)}/>
                <Button text="Delete goal" onClick={() => setStateDeleteForm(!isDeleteForm)}/>
            </div>
        </div>
    );
}
