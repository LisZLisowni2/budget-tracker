import { ChangeEventHandler, ReactNode } from 'react';

interface IFormLabel {
    label: string;
    type: string;
    id: string;
    value?: string | number;
    defaultValue?: string | number;
    checked?: boolean;
    onChange?: ChangeEventHandler;
    children?: ReactNode;
}

export default function FormField({
    label,
    type,
    id,
    onChange,
    checked,
    children,
    value,
    defaultValue
}: IFormLabel) {
    return (
        <p className="flex md:mt-4 h-20 flex-col">
            <span className="lg:text-lg">{label}</span>
            <input
                type={type}
                id={id}
                value={value}
                defaultValue={defaultValue}
                checked={checked}
                className="p-1 md:p-2 font-extrabold text-black bg-white border-white border-2 rounded-2xl"
                onChange={onChange}
            />
            {children}
        </p>
    );
}
