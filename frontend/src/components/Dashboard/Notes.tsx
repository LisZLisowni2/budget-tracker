import { useUser } from "../../context/UserContext"
import Button from "../Button/Button"

function NoteElement() {
    return (
        <div className="flex flex-col justify-start text-left shadow-lg rounded-4xl p-4 m-4 mx-12 hover:scale-105 transition-all">
            <h1 className="text-3xl break-words max-h-32 overflow-auto">Title</h1>
            <h3 className="text-sm text-gray-400 h-4 overflow-hidden">Characters</h3>
        </div>
    )
}

export default function Notes() {
    const { user, loading } = useUser()

    if (loading) {
        return (<p>
            Loading profile...
        </p>)
    }

    console.log(user)
    
    return (
        <div className="flex flex-1 overflow-hidden items-center justify-between flex-row max-lg:overflow-auto">
            <div className="max-md:w-full w-2/5 h-screen overflow-y-auto transition-all shadow-2xl border-r-2">
                <NoteElement />
                <NoteElement />
                <NoteElement />
                <NoteElement />
                <NoteElement />
                <NoteElement />
                <NoteElement />
                <NoteElement />
                <NoteElement />
                <NoteElement />
                <NoteElement />
            </div>
            <div className="max-md:w-1/4 w-4/5 h-full">
            </div>
        </div>
    )
}