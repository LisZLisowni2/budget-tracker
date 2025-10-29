import { useUser } from '../../context/UserContext';
import { useState, MouseEventHandler, ChangeEvent } from 'react';
import { Plus, Minus, Copy } from 'lucide-react';
import { useNotes } from '../../context/NoteContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Button from '../Button/Button';

interface INoteElement {
    id?: number;
    title: string;
    content: string;
    onClick: MouseEventHandler<HTMLButtonElement>;
    selected: boolean;
    ownedBy?: string;
}

interface INoteViewer {
    content?: string;
}

function NoteElement({ title, content, onClick, selected }: INoteElement) {
    return (
        <button
            id={`note`}
            onClick={onClick}
            className={`${selected ? 'bg-rose-100' : ''} shadow-sm md:shadow-lg w-4/5 md:rounded-4xl md:m-4 md:mx-12 md:hover:scale-105 transition-all cursor-pointer`}
        >
            <div className="flex flex-col justify-start text-left p-2 md:m-4">
                <h1 className="text-3xl break-words max-h-10 overflow-hidden">
                    {title}
                </h1>
                <h3 className="text-sm text-gray-400 h-8 overflow-hidden">
                    {content}
                </h3>
            </div>
        </button>
    );
}

function NoteViewer({ content }: INoteViewer) {
    return (
        <div className="prose max-w-none p-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content?.replace(/\\n/g, '\n')}
            </ReactMarkdown>
        </div>
    );
}

export default function Notes() {
    sessionStorage.setItem('selectedDashboard', '3');
    const [isEditor, setIsEditor] = useState<boolean>(false);
    const { user, loading: userLoading } = useUser();
    const {
        notes,
        loading: notesLoading,
        handleAddNote,
        handleChangeNote,
        handleCopyNote,
        handleDeleteNote,
    } = useNotes();
    const [selectedNoteID, setSelectedNoteID] = useState<string | null>();

    if (userLoading) {
        return <p>Loading profile...</p>;
    }

    if (notesLoading) {
        return <p>Loading notes...</p>;
    }

    if (!user) {
        return (
            <div className="w-full flex justify-center items-center">
                <p className="text-black text-4xl font-bold text-center">
                    You are not allowed to access Dashboard.
                    <br />
                    Please login to continue
                </p>
            </div>
        );
    }

    if (!notes) {
        return (
            <div className="w-full flex justify-center items-center">
                <p className="text-black text-4xl font-bold text-center">
                    Notes doesn't load. Probably server's error.
                    <br />
                    Please try again later
                </p>
            </div>
        );
    }

    const selectedNote = notes.find((note) => note._id === selectedNoteID);

    const titleChangeHandle = (e: ChangeEvent<HTMLInputElement>) => {
        if (selectedNoteID)
            handleChangeNote(selectedNoteID, { title: e.target.value });
    };

    const contentChangeHandle = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (selectedNoteID)
            handleChangeNote(selectedNoteID, { content: e.target.value });
    };

    const createNewNote = () => {
        handleAddNote();
    };

    const deleteNote = () => {
        if (selectedNoteID) {
            handleDeleteNote(selectedNoteID);
            setSelectedNoteID(null);
        }
    };

    const copyNote = () => {
        if (selectedNoteID) handleCopyNote(selectedNoteID);
    };

    return (
        <div className="flex flex-1 max-md:flex-col overflow-hidden items-center justify-between flex-row max-lg:overflow-auto">
            <div className="max-md:w-full w-1/3 max-md:h-64 h-screen overflow-y-auto transition-all shadow-sm md:shadow-2xl border-r-2">
                <div className="max-md:p-4 md:h-1/16 sticky top-0 bg-white border-b">
                    <div className="flex justify-evenly items-center h-full *:cursor-pointer *:hover:scale-125 *:hover:text-gray-400 *:transition-all">
                        <Plus onClick={createNewNote} />
                        <Minus onClick={deleteNote} />
                        <Copy onClick={copyNote} />
                    </div>
                </div>
                {notes.map((note) => {
                    if (note._id === selectedNoteID)
                        return (
                            <NoteElement
                                key={note._id}
                                selected={true}
                                title={note.title}
                                content={note.content}
                                onClick={() => setSelectedNoteID(note._id)}
                            />
                        );
                    return (
                        <NoteElement
                            key={note._id}
                            selected={false}
                            title={note.title}
                            content={note.content}
                            onClick={() => setSelectedNoteID(note._id)}
                        />
                    );
                })}
            </div>
            <div className="max-md:w-full w-2/3 h-screen overflow-y-auto transition-all">
                <div className="md:h-1/2">
                    {selectedNoteID !== undefined &&
                    selectedNote !== undefined ? (
                        <section className="flex flex-col items-center *:text-center">
                            <div className="max-w-2/3 flex flex-row justify-evenly items-center">
                                <input
                                    className="w-full text-4xl p-4"
                                    type="text"
                                    value={selectedNote?.title}
                                    onChange={titleChangeHandle}
                                    placeholder="Title"
                                    id="title"
                                />
                                <Button
                                    text={isEditor ? 'Preview' : 'Edit'}
                                    onClick={() => setIsEditor(!isEditor)}
                                />
                            </div>
                            <div className="w-full *:md:m-4 *:flex-1 flex flex-col justify-center">
                                {isEditor ? (
                                    <textarea
                                        className="block"
                                        id="content"
                                        rows={30}
                                        readOnly={false}
                                        onChange={contentChangeHandle}
                                        value={selectedNote?.content}
                                        placeholder="Content"
                                    ></textarea>
                                ) : (
                                    <NoteViewer
                                        content={selectedNote?.content}
                                    />
                                )}
                            </div>
                        </section>
                    ) : (
                        <h1 className="text-3xl">Choose a note</h1>
                    )}
                </div>
            </div>
        </div>
    );
}
