import { useUser } from "../../context/UserContext"
import { useState, MouseEventHandler, ChangeEvent } from "react"
import { Plus, Minus, Copy } from "lucide-react"

interface INoteModel {
    id: number,
    title: string,
    content: string,
    ownedBy: string
}

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
    sessionStorage.setItem("selectedDashboard", "3")
    const { user, loading } = useUser()
    const [ notes, setNotes ] = useState<INoteModel[]>(list)
    const [ selectedNoteID, setSelectedNoteID ] = useState<number | null>()

    const selectedNote = notes.find((note) => note.id === selectedNoteID)
    const fillteredList = notes.filter((note) => note.ownedBy === 'Janusz')
    console.log(selectedNoteID)
    console.log(selectedNote)

    if (loading) {
        return (<p>
            Loading profile...
        </p>)
    }
    
    const titleChangeHandle = (e: ChangeEvent<HTMLInputElement>) => {
        if (selectedNoteID !== null) {
            setNotes(prevNotes => 
                prevNotes.map(note =>
                    note.id === selectedNoteID 
                    ? { ... note, title: e.target.value }
                    : note
                )
            )
        }
    }

    const contentChangeHandle = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (selectedNoteID !== null) {
            setNotes(prevNotes => 
                prevNotes.map(note =>
                    note.id === selectedNoteID 
                    ? { ... note, content: e.target.value }
                    : note
                )
            )
        }
    }

    const createNewNote = () => {
        const generatedID = Math.random() % 100 + 1
        setNotes([...notes, {id: generatedID, title: "", content: "", ownedBy: "Janusz"}])
        setSelectedNoteID(generatedID)
    }

    const deleteNote = () => {
        if (selectedNoteID) {
            setNotes(prevNotes => prevNotes.filter(note => note.id !== selectedNoteID))
            setSelectedNoteID(null)
        }
    }

    const copyNote = () => {
        if (selectedNoteID && selectedNote) {
            const generatedID = Math.random() % 100 + 1
            setNotes([...notes, {id: generatedID, title: selectedNote?.title, content: selectedNote?.content, ownedBy: selectedNote?.ownedBy}])
            setSelectedNoteID(generatedID)
        }
    }

    console.log(user)
    
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
                    fillteredList.map((note) => { 
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