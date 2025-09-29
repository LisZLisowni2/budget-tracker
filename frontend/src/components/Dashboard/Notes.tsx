import { useUser } from "../../context/UserContext"
import { useState, MouseEventHandler } from "react"

interface INoteElement {
    id?: number,
    title: string,
    content: string,
    onClick: MouseEventHandler<HTMLButtonElement>,
    selected: boolean,
    ownedBy?: string
}

function NoteElement({ title, content, onClick, selected }: INoteElement) {
    return (
        <button id={`note`} onClick={onClick} className={`${(selected) ? "bg-rose-100" : ""} shadow-lg w-4/5 rounded-4xl mx-12 hover:scale-105 transition-all m-4 cursor-pointer`}>
            <div className="flex flex-col justify-start text-left p-2 m-4">
                <h1 className="text-3xl break-words max-h-32 overflow-auto">{ title }</h1>
                <h3 className="text-sm text-gray-400 h-8 overflow-hidden">{ content }</h3>
            </div>
        </button>
    )
}

export default function Notes() {
    sessionStorage.setItem("selectedDashboard", "3")
    const { user, loading } = useUser()
    const [ selectedID, setSelectedID ] = useState<number>()

    const listTemplate = {
        id: 10294,
        ownedBy: 'Janusz',
        title: 'Title',
        content: '<h1>Hello world</h1>'
    }

    const listTemplate2 = {
        id: 1581,
        ownedBy: 'Janusz',
        title: 'Koza',
        content: 'Ale beka krwa'
    }

    const listTemplate3 = {
        id: 52,
        ownedBy: 'Kowal',
        title: 'Szansa',
        content: 'Jutro kiedykolwiek będzie mocno w kij'
    }

    const list = [listTemplate, listTemplate2, listTemplate3]

    let fillteredList = list.filter((note) => note.ownedBy === 'Janusz')

    if (loading) {
        return (<p>
            Loading profile...
        </p>)
    }

    console.log(user)
    
    return (
        <div className="flex flex-1 overflow-hidden items-center justify-between flex-row max-lg:overflow-auto">
            <div className="max-md:w-full w-2/5 h-screen overflow-y-auto transition-all shadow-2xl border-r-2">
                <div className="h-1/16 sticky top-0">
                    { /* ICONS */ }
                </div>
                <hr className="border "/>
                {
                    fillteredList.map((note) => { 
                        if (note.id === selectedID) return <NoteElement key={note.id} selected={true} title={note.title} content={note.content} onClick={() => setSelectedID(note.id)}/>
                        return <NoteElement key={note.id} selected={false} title={note.title} content={note.content} onClick={() => setSelectedID(note.id)}/>
                    })
                }
            </div>
            <div className="max-md:w-1/4 w-4/5 h-full">
                {/* SERVER IMPLEMENTATION */}
            </div>
        </div>
    )
}