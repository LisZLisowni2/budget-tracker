import Button from "../Button/Button"
import { ReactNode, useState, ChangeEventHandler, ChangeEvent, FormEvent } from "react"
import api from "../../api"
import { Link } from "react-router"

interface IFormLabel {
    label: string,
    type: string,
    id: string,
    onChange?: ChangeEventHandler
    children?: ReactNode
}

function FormField({ label, type, id, onChange, children }: IFormLabel) {
    return (
        <p className="flex md:my-4 h-20 flex-col">
            <span className="lg:text-lg">{label}</span>
            <input type={type} id={id} className="p-1 md:p-2 font-extrabold text-black bg-white border-white border-2 rounded-2xl" onChange={onChange}/>
            { children }
        </p>
    )
}

export default function Register() {
    const [passwordView, setPasswordView] = useState(false)
    const [username, setUsername] = useState<string | null>("")
    const [email, setEmail] = useState<string | null>("")
    const [password, setPassword] = useState<string | null>("")
    const [passwordVerify, setPasswordVerify] = useState<string | null>("")
    const [error, setError] = useState<string | null>("")

    const handlePasswordView = () => {
        setPasswordView(!passwordView)
    }

    const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("")
        if (!username || !password || !email || !passwordVerify) {
            setError("Username, email, password or second password not present")
            return;
        }

        if (password != passwordVerify) {
            setError("Passwords are not the same")
            return;
        }

        const obj = {
            username: username,
            email: email,
            password: password
        }

        await api.post('/users/register', obj)
        .then(() => {
            setError("Account has created")
        }).catch((err) => {
            console.error(err)
            setError(`Error while registering: ${err.message}`)
        })
    }

    let passwordIcon
    if (!passwordView) {
        passwordIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" onClick={handlePasswordView}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>                  
    } else {
        passwordIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" onClick={handlePasswordView}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>                  
    }

    return (
        <div>
            <form onSubmit={async (event) => await handleRegister(event)} className="relative bg-gradient-to-r from-rose-400 to-rose-500 p-8 lg:p-16 rounded-4xl text-center max-w-3xs md:max-w-2xl lg:max-w-3xl z-10 shadow-2xl backdrop-blur-3xl m-auto">
                <h1 className="text-2xl md:text-3xl font-bold md:mb-8">Register form</h1>
                <div className="flex md:gap-4 max-md:flex-col">
                    <div>
                        <FormField label="Username:" type="text" id="login" onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}/>
                        <FormField label="Email:" type="text" id="email" onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}/>
                    </div>
                    <div>
                        <FormField label="Password:" type={ (passwordView) ? "text" : "password" } id="password" onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}>
                            <span className="self-end relative bottom-7.5 md:bottom-8.5 right-1.5">{ passwordIcon }</span>
                        </FormField>
                        <FormField label="Password Verify:" type={ (passwordView) ? "text" : "password" } id="passwordSecond" onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordVerify(e.target.value)}>
                            <span className="self-end relative bottom-7.5 md:bottom-8.5 right-1.5">{ passwordIcon }</span>
                        </FormField>
                    </div>
                </div>
                <p className="flex my-4 flex-col"><Button text="Register" /></p>
                <p className="text-red-600 font-bold lg:text-xl">{ error }</p>
                <p><Link to="/login" className="font-bold lg:text-xl hover:text-gray-300 transition">If you have an account, login</Link></p>
            </form>
        </div>
    )
}