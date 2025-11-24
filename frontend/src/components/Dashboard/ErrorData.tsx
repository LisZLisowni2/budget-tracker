interface IProps {
    dataType: string,
    message?: string
}

export default function ErrorData({ dataType, message }: IProps) {
    return (
        <div className="w-full flex justify-center items-center">
            <p className="text-black text-4xl font-bold text-center">
                { !message ? ({ dataType } + "doesn't load. Probably server's error.") : ({dataType} + message) } 
                <br />
                Please try again later
            </p>
        </div>
    );
}