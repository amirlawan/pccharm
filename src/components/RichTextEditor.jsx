import { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

/**
 * RichTextEditor
 * 
 * A fully-featured rich text editor for admin content creation.
 * 
 * Props:
 *  - value: string (HTML)
 *  - onChange: (html: string) => void
 *  - placeholder: string
 *  - style: object  — override container height etc.
 *  - dark: boolean  — apply dark-mode Quill theme (for admin panel)
 */
const RichTextEditor = ({ value, onChange, placeholder, style, dark = false }) => {
    // useMemo prevents modules from being recreated on every render,
    // which causes Quill to lose focus constantly.
    const modules = useMemo(() => ({
        // NOTE: syntax: true is intentionally disabled here.
        // It requires a global hljs shim that is incompatible with Vite/ESM
        // and causes a blank white screen crash. Syntax highlighting is
        // applied on the student-facing CourseViewer side instead.
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['clean'],
        ],
    }), []);

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script',
        'blockquote', 'code-block',
        'list', 'bullet', 'check',
        'indent', 'direction', 'align',
        'link', 'image', 'video',
    ];

    return (
        <div className={`rich-text-editor-container${dark ? ' quill-dark' : ''}`}>
            <ReactQuill
                theme="snow"
                value={value || ''}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder || 'Start writing your lesson content...'}
                style={style || { height: '380px', marginBottom: '60px' }}
            />
        </div>
    );
};

export default RichTextEditor;
