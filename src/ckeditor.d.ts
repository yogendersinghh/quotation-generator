declare module '@ckeditor/ckeditor5-react' {
  import { Component } from 'react';
  import { Editor } from '@ckeditor/ckeditor5-core';
  import { EventInfo } from '@ckeditor/ckeditor5-utils';

  interface CKEditorProps {
    editor: {
      create(sourceElementOrData: HTMLElement | string, config?: any): Promise<Editor>;
    };
    data?: string;
    config?: any;
    disabled?: boolean;
    id?: string;
    onReady?: (editor: Editor) => void;
    onChange?: (event: EventInfo, editor: Editor) => void;
    onBlur?: (event: EventInfo, editor: Editor) => void;
    onFocus?: (event: EventInfo, editor: Editor) => void;
    onError?: (event: EventInfo,
      data: {
        phase: 'initialization' | 'runtime';
        error: Error;
      }
    ) => void;
  }

  export class CKEditor extends Component<CKEditorProps> {}
}

declare module '@ckeditor/ckeditor5-build-classic' {
  const ClassicEditor: any;
  export = ClassicEditor;
} 