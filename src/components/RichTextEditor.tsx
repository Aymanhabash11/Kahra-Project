import { CKEditor } from '@ckeditor/ckeditor5-react'
import {
  Autoformat,
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  Heading,
  HorizontalLine,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  List,
  Paragraph,
  Strikethrough,
  Table,
  TableToolbar,
  Underline,
} from 'ckeditor5'
import 'ckeditor5/ckeditor5.css'
import { supabase } from '../lib/supabase'

class SupabaseUploadAdapter {
  private loader: { file: Promise<File> }
  constructor(loader: { file: Promise<File> }) { this.loader = loader }
  async upload(): Promise<{ default: string }> {
    const file = await this.loader.file
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `content/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('admin-uploads').upload(path, file, { upsert: false })
    if (error) throw new Error(error.message)
    const { data } = supabase.storage.from('admin-uploads').getPublicUrl(path)
    return { default: data.publicUrl }
  }
  abort(): void {}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SupabaseUploadAdapterPlugin(editor: any): void {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: { file: Promise<File> }) =>
    new SupabaseUploadAdapter(loader)
}

interface Props {
  value: string
  onChange: (html: string) => void
}

// Undo is already inside Essentials — do NOT add it again or CKEditor throws a plugin-conflict error
// FileRepository is already a dependency of ImageUpload — same reason
const PLUGINS = [
  Essentials, Autoformat,
  Paragraph, Heading,
  Bold, Italic, Underline, Strikethrough,
  Link,
  List,
  Indent, IndentBlock,
  BlockQuote,
  ImageUpload, Image, ImageCaption, ImageResize, ImageStyle, ImageToolbar,
  Table, TableToolbar,
  HorizontalLine,
]

const TOOLBAR = [
  'undo', 'redo', '|',
  'heading', '|',
  'bold', 'italic', 'underline', 'strikethrough', '|',
  'link', '|',
  'bulletedList', 'numberedList', '|',
  'outdent', 'indent', '|',
  'blockQuote', 'insertTable', 'horizontalLine', '|',
  'uploadImage',
]

export default function RichTextEditor({ value, onChange }: Props) {
  return (
    <div className="rich-text-editor">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        onError={(error: Error) => console.error('CKEditor init error:', error)}
        config={{
          licenseKey: 'GPL',
          plugins: PLUGINS,
          extraPlugins: [SupabaseUploadAdapterPlugin],
          toolbar: { items: TOOLBAR },
          heading: {
            options: [
              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
              { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
              { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            ],
          },
          image: {
            toolbar: ['imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative'],
          },
          table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
          },
          link: { defaultProtocol: 'https://' },
        }}
        onChange={(_event, editor) => onChange(editor.getData())}
      />
    </div>
  )
}
