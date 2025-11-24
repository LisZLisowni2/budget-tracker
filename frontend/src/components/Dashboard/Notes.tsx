import { useState, MouseEventHandler, ChangeEvent } from 'react';
import { Plus, Minus, Copy } from 'lucide-react';
import { useNotes } from '../../context/NoteContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Button from '../Button/Button';
import useNotesQuery from '@/hooks/useNotesQuery';
import useUserQuery from '@/hooks/useUserQuery';
import ErrorData from './ErrorData';

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
    const { data: user, isLoading: isUserLoading } = useUserQuery();
    const { data: notes, isLoading: isNotesLoading } = useNotesQuery();
    const { addMutation, changeMutation, copyMutation, deleteMutation } =
        useNotes();
    const [selectedNoteID, setSelectedNoteID] = useState<string | null>();

    if (isUserLoading || isNotesLoading) {
        return (
            <p>
                Loading... User: {isUserLoading ? 'Loading' : 'Loaded'}, Goals:
                {isNotesLoading ? 'Loading' : 'Loaded'}
            </p>
        );
    }
    if (!user)
        return (
            <ErrorData
                dataType="User"
                message="You are not allowed to access Dashboard. "
            />
        );
    if (!notes) return <ErrorData dataType="Note" />;

    const selectedNote = notes.find((note) => note._id === selectedNoteID);

    const titleChangeHandle = (e: ChangeEvent<HTMLInputElement>) => {
        if (selectedNoteID)
            changeMutation(selectedNoteID, { title: e.target.value });
    };

    const contentChangeHandle = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (selectedNoteID)
            changeMutation(selectedNoteID, { content: e.target.value });
    };

    const createNewNote = () => {
        addMutation();
    };

    const deleteNote = () => {
        if (selectedNoteID) {
            deleteMutation(selectedNoteID);
            setSelectedNoteID(null);
        }
    };

    const copyNote = () => {
        if (selectedNoteID) copyMutation(selectedNoteID);
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
