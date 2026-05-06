import { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange, placeholder, style }) => {
    // useMemo prevents modules from being recreated on every render,
    // which would cause Quill to constantly lose focus.
    const modules = useMemo(() => ({
        // NOTE: syntax: true is intentionally disabled here.
        // It requires a global hljs shim that is incompatible with Vite/ESM
        // and causes a blank white screen crash. Syntax highlighting is
        // applied on the student-facing CourseViewer side instead.
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image', 'video'],
            ['code-block', 'code'],
            ['clean']
        ],
    }), []);

    const formats = [
        'header', 'color', 'background', 'font', 'align',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'video', 'code-block', 'code'
    ];

    return (
        <div className="rich-text-editor-container">
            <ReactQuill
                theme="snow"
                value={value || ''}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder || 'Start writing your content...'}
                style={style || { height: '300px', marginBottom: '50px' }}
            />
        </div>
    );
};

export default RichTextEditor;
