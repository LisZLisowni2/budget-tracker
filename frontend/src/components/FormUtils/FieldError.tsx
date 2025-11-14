interface IFieldError {
    message?: string;
    className?: string;
}

export default function FieldError({ message, className }: IFieldError) {
    return <p className={'mb-4 ' + { className }}>{message}</p>;
}
