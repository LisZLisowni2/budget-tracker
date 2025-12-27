interface IFieldError {
    message?: string;
    className?: string;
    id?: string
}

export default function FieldError({ message, id, className }: IFieldError) {
    return <p id={id} className={'mb-4 ' + { className }}>{message}</p>;
}
