import { useUser } from "../../context/UserContext"
import { useState, MouseEventHandler, ChangeEvent } from "react"
import { Plus, Minus, Copy } from "lucide-react"
import { useNotes } from "../../context/NoteContext"

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
        <button id={`note`} onClick={onClick} className={`${(selected) ? "bg-rose-100" : ""} shadow-sm md:shadow-lg w-4/5 md:rounded-4xl md:m-4 md:mx-12 md:hover:scale-105 transition-all cursor-pointer`}>
            <div className="flex flex-col justify-start text-left p-2 md:m-4">
                <h1 className="text-3xl break-words max-h-10 overflow-hidden">{ title }</h1>
                <h3 className="text-sm text-gray-400 h-8 overflow-hidden">{ content }</h3>
            </div>
        </button>
    )
}

export default function Notes() {
    // TODO: Handle CRUD for notes
    sessionStorage.setItem("selectedDashboard", "3")
    const { user, loading: userLoading } = useUser()
    const { notes, loading: notesLoading } = useNotes()
    const [ selectedNoteID, setSelectedNoteID ] = useState<number | null>()

    if (userLoading) {
        return (<p>
            Loading profile...
        </p>)
    }

    if (notesLoading) {
        return (<p>
            Loading notes...
        </p>)
    }

    if (!user || !notes) return (<p>User or notes not loaded</p>)

    const selectedNote = notes.find((note) => note.id === selectedNoteID)
    
    const titleChangeHandle = (e: ChangeEvent<HTMLInputElement>) => {
        if (selectedNoteID !== null) {
            console.log(e.target)
        }
    }

    const contentChangeHandle = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (selectedNoteID !== null) {
            console.log(e.target)
        }
    }

    const createNewNote = () => {
        // const generatedID = Math.random() % 100 + 1
        // setNotes([...notes, {id: generatedID, title: "", content: "", ownedBy: "Janusz"}])
        // setSelectedNoteID(generatedID)
    }

    const deleteNote = () => {
        // if (selectedNoteID) {
        //     setNotes(prevNotes => prevNotes.filter(note => note.id !== selectedNoteID))
        //     setSelectedNoteID(null)
        // }
    }

    const copyNote = () => {
        // if (selectedNoteID && selectedNote) {
        //     const generatedID = Math.random() % 100 + 1
        //     setNotes([...notes, {id: generatedID, title: selectedNote?.title, content: selectedNote?.content, ownedBy: selectedNote?.ownedBy}])
        //     setSelectedNoteID(generatedID)
        // }
    }

    return (
        <div className="flex flex-1 max-md:flex-col overflow-hidden items-center justify-between flex-row max-lg:overflow-auto">
            <div className="max-md:w-full w-2/5 max-md:h-64 h-screen overflow-y-auto transition-all shadow-sm md:shadow-2xl border-r-2">
                <div className="max-md:p-4 md:h-1/16 sticky top-0 bg-white border-b">
                    <div className="flex justify-evenly items-center h-full *:cursor-pointer *:hover:scale-125 *:hover:text-gray-400 *:transition-all">
                        <Plus onClick={createNewNote}/>
                        <Minus onClick={deleteNote}/>
                        <Copy onClick={copyNote}/>
                    </div>
                </div>
                {
                    notes.map((note) => { 
                        if (note.id === selectedNoteID) return <NoteElement key={note.id} selected={true} title={note.title} content={note.content} onClick={() => setSelectedNoteID(note.id)}/>
                        return <NoteElement key={note.id} selected={false} title={note.title} content={note.content} onClick={() => setSelectedNoteID(note.id)}/>
                    })
                }
            </div>
            <div className="md:w-4/5 md:h-1/2">
                { (selectedNoteID !== undefined && selectedNote !== undefined) ? 
                    <section className="flex flex-col items-center *:text-center">
                        <input className="md:w-1/2 text-4xl" type="text" value={selectedNote?.title} onChange={titleChangeHandle} placeholder="Title" id="title"/>
                        <textarea 
                            className="block md:w-7/8 md:m-4 flex-1" 
                            id="content" rows={30} readOnly={false} onChange={contentChangeHandle} value={selectedNote?.content} placeholder="Content">
                        </textarea>
                    </section>
                : <h1 className="text-3xl">Choose a note</h1> }
            </div>
        </div>
    )
}