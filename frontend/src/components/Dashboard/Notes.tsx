import { useUser } from "../../context/UserContext"

interface INoteElement {
    id: number,
    title: string,
    content: string,
    ownedBy?: string
}

function NoteElement({ id, title, content }: INoteElement) {
    return (
        <button id={`note${id}`} className="shadow-lg w-4/5 rounded-4xl mx-12 hover:scale-105 transition-all m-4">
            <div className="flex flex-col justify-start text-left p-2 m-4">
                <h1 className="text-3xl break-words max-h-32 overflow-auto">{ title }</h1>
                <h3 className="text-sm text-gray-400 h-4 overflow-hidden">{ content }</h3>
            </div>
        </button>
    )
}

export default function Notes() {
    const { user, loading } = useUser()

    const listTemplate = {
        id: 10294,
        ownedBy: 'Janusz',
        title: 'Title',
        content: '<h1>Hello world</h1>'
    }

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
                <NoteElement id={listTemplate.id} title={listTemplate.title} content={listTemplate.content}/>
            </div>
            <div className="max-md:w-1/4 w-4/5 h-full">
            </div>
        </div>
    )
}